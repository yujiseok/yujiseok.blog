#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["scrapling[fetchers]>=0.4", "httpx"]
# ///
"""갤러리 이미지 수집기.

`public/images/gallery/<작가 폴더>/` 를 채운다. 출처와 추출 규칙은 전부
sources.toml에 데이터로 적혀 있고(URL을 코드에 박지 않는다), 썸네일 주소를
원본으로 되돌리는 규칙은 origins.py에 있다.

    uv run scripts/gallery/collect.py --artist lee-ufan
    uv run scripts/gallery/collect.py --list

왜 파이썬인가: JS로 이미지를 늦게 끼워 넣거나 Cloudflare 챌린지를 세우는
사이트가 있어서 헤드리스 브라우저가 필요하고, 그걸 해 주는 Scrapling이
파이썬이다. 블로그 쪽 의존성(package.json)과 섞지 않으려고 PEP 723 인라인
의존성 + uv로 격리한다.

파이프라인: 출처에서 URL 수집 → 원본화 → 내려받기 → 실제 픽셀 측정 →
긴 변 1200px 미만 폐기 → 큰 것부터 상한까지 → cwebp(q90, 긴 변 2400 상한).
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import subprocess
import sys
import tempfile
import time
import tomllib
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import unquote, urlparse

import httpx

import origins

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
GALLERY = ROOT / "public/images/gallery"
SOURCES = HERE / "sources.toml"
SEEN_FILE = HERE / ".seen.json"

# 긴 변이 이보다 작으면 벽에 걸어도 뭉개진다. 2400은 저장 상한 — 그 이상은
# 화면에서 구별되지 않는데 용량만 먹는다(next/image가 다시 줄여서 내려준다).
MIN_LONG_EDGE = 1200
MAX_LONG_EDGE = 2400

# lib/gallery.ts가 벽에 거는 확장자. .gitkeep 같은 것은 장수에 넣지 않는다
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".avif"}

# 평범한 브라우저 값으로 둔다. 개인 도메인이나 연락처를 헤더에 적지 않는다.
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)


# ──────────────────────────────── 치수 측정 ────────────────────────────────
# ImageMagick도 Pillow도 없다. 헤더만 읽으면 되는 일이라 직접 읽는다 —
# 받은 바이트를 그대로 믿지 않고 실제 픽셀을 재는 것이 이 스크립트의 핵심이다
# (CDN이 "w_4000"이라고 적어 두고 1400px을 주는 경우가 흔하다).


def _jpeg_size(d: bytes) -> tuple[int, int] | None:
    i, n = 2, len(d)
    while i + 9 < n:
        if d[i] != 0xFF:
            i += 1
            continue
        marker = d[i + 1]
        if marker == 0x01 or 0xD0 <= marker <= 0xD9:
            i += 2
            continue
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            return (
                int.from_bytes(d[i + 7 : i + 9], "big"),
                int.from_bytes(d[i + 5 : i + 7], "big"),
            )
        i += 2 + int.from_bytes(d[i + 2 : i + 4], "big")
    return None


def _webp_size(d: bytes) -> tuple[int, int] | None:
    chunk = d[12:16]
    if chunk == b"VP8X":
        return (
            int.from_bytes(d[24:27], "little") + 1,
            int.from_bytes(d[27:30], "little") + 1,
        )
    if chunk == b"VP8 ":
        return (
            int.from_bytes(d[26:28], "little") & 0x3FFF,
            int.from_bytes(d[28:30], "little") & 0x3FFF,
        )
    if chunk == b"VP8L":
        bits = int.from_bytes(d[21:25], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    return None


def probe_size(d: bytes) -> tuple[int, int] | None:
    if len(d) < 32:
        return None
    if d[:8] == b"\x89PNG\r\n\x1a\n":
        return int.from_bytes(d[16:20], "big"), int.from_bytes(d[20:24], "big")
    if d[:3] == b"GIF":
        return (
            int.from_bytes(d[6:8], "little"),
            int.from_bytes(d[8:10], "little"),
        )
    if d[:4] == b"RIFF" and d[8:12] == b"WEBP":
        return _webp_size(d)
    if d[:2] == b"\xff\xd8":
        return _jpeg_size(d)
    return None


# ───────────────────────────────── 출처 설정 ─────────────────────────────────


@dataclass
class Source:
    name: str
    kind: str  # html | browser | json | commons
    origin: str = "passthrough"
    url: str = ""
    # html/browser: 페이지 텍스트에서 이미지 URL을 찾는 정규식. CSS 선택자
    # 대신 정규식인 이유는, 이미지 주소가 <img>가 아니라 인라인 JS 딕셔너리나
    # srcset 안에 들어 있는 사이트가 절반이기 때문이다.
    pattern: str = ""
    include: str = ""  # 작품만 남기는 경로 필터(로고·설치샷 제외)
    exclude: str = ""
    method: str = "GET"
    body: dict | None = None
    items: str = ""  # json: 배열이 있는 경로
    image_field: str = ""
    title_field: str = ""
    year_field: str = ""
    # json: PHP 사이트들이 흔히 쓰는 모양들. 세션 쿠키를 먼저 받아야 하거나,
    # 목록을 구간(type)으로 쪼개 오프셋으로 더 불러오거나, 항목 배열이 아니라
    # {image:[...], title:[...]} 처럼 열 단위로 오는 경우를 받아 준다
    session_url: str = ""
    form: bool = False
    types: list[str] = field(default_factory=list)
    type_field: str = "type"
    page_field: str = ""
    page_start: int = 0
    page_step: int = 0
    page_max: int = 0
    columns: dict[str, str] = field(default_factory=dict)
    prefix: str = ""  # json: 상대 경로 앞에 붙일 호스트
    query: str = ""  # commons: 검색식
    # commons: extmetadata.Artist가 이 정규식에 맞는 파일만 받는다. 카테고리에는
    # 다른 작가 작품과 전시 전경 사진이 섞여 들어온다
    artist_match: str = ""
    strip: list[str] = field(default_factory=list)
    delay: float = 1.5
    enabled: bool = True


@dataclass
class Candidate:
    url: str
    source: str
    title: str = ""
    year: str = ""
    # API가 크기를 알려 주는 곳(Commons)은 내려받기 전에 걸러낸다
    width: int = 0
    height: int = 0
    # 내려받을 때 지킬 간격. Commons는 무간격이면 5번째부터 429다
    delay: float = 0.3


def load_sources() -> tuple[dict[str, list[Source]], dict[str, dict[str, str]]]:
    with SOURCES.open("rb") as f:
        raw = tomllib.load(f)
    sources = {
        artist: [Source(**entry) for entry in entries]
        for artist, entries in raw.get("artist", {}).items()
    }
    return sources, raw.get("titles", {})


# ─────────────────────────────── 캡션 만들기 ───────────────────────────────
# 작품명 표를 따로 두면 파일과 표가 어긋난다. 파일명이 곧 캡션이다(lib/gallery.ts).
# parseCaption이 네 자리 연도를 먼저 만나고 그 뒤를 작품명으로 읽으므로
# <번호>-<연도>-<작품명>.webp 순서를 지켜야 한다.

_YEAR = re.compile(r"\b(1[89]\d{2}|20\d{2})\b")


def slugify(text: str) -> str:
    text = unquote(text).lower()
    text = re.sub(r"[^a-z0-9가-힣]+", "-", text).strip("-")
    return text[:60].strip("-")


# CDN이 파일명에 남기는 부스러기. 어느 출처에서나 같은 꼬리가 붙는다
_JUNK = re.compile(
    r"\b(?:width|height|fwebp|webp|jpg|jpeg|png|s\d+x|d\d+xauto|v\d+|"
    r"thmb|thumb|large|medium|small|detail|crop|copy|final|edit)\b"
)


def caption_from_url(url: str, strip: list[str]) -> tuple[str, str]:
    stem = Path(urlparse(url).path).stem
    slug = slugify(stem)
    for token in strip:
        slug = re.sub(token, "-", slug)
    year_match = _YEAR.search(slug)
    year = year_match.group(1) if year_match else ""
    if year:
        slug = slug.replace(year, "-")
    slug = _JUNK.sub("-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    # 알파벳·한글 낱말이 하나도 없으면 작품명이 아니라 CDN 일련번호다
    if not re.search(r"[a-z가-힣]{3,}", slug) or re.fullmatch(r"[0-9a-f]{16,}", slug):
        slug = ""
    return year, slug


def localize(title: str, titles: dict[str, str]) -> str:
    """영문 연작명을 한글로 바꾼다.

    한국 작가의 작품명은 한글로 걸고 싶은데, 해외 갤러리가 내려주는 파일명은
    영문 연작명("from-point")이다. 작품마다 번역표를 만드는 건 유지가 안 되므로
    연작명만 sources.toml에 적어 두고 앞부분을 갈아 끼운다.
    """
    for english in sorted(titles, key=len, reverse=True):
        if title.startswith(english):
            return (titles[english] + title[len(english) :]).strip("-")
    return title


def filename(index: int, year: str, title: str) -> str:
    parts = [f"{index:02d}"]
    if year:
        parts.append(year)
    if title:
        parts.append(title)
    return "-".join(parts) + ".webp"


# ──────────────────────────────── 출처별 수집 ────────────────────────────────


def dig(obj, path: str):
    """점으로 이은 경로를 따라간다. 숫자는 배열 인덱스로 읽는다."""
    for key in filter(None, path.split(".")):
        if obj is None:
            return None
        if isinstance(obj, list):
            try:
                obj = obj[int(key)]
            except (ValueError, IndexError):
                return None
        else:
            obj = obj.get(key)
    return obj


def fetch_page(source: Source) -> str:
    if source.kind == "browser":
        # Cloudflare 챌린지나 JS 렌더링이 필요한 곳만. 봇 우회가 목적이 아니라
        # DOM이 채워진 뒤의 이미지 주소를 보려는 것이다.
        from scrapling.fetchers import StealthyFetcher

        page = StealthyFetcher.fetch(source.url, headless=True, network_idle=True)
    else:
        from scrapling.fetchers import Fetcher

        page = Fetcher.get(source.url, stealthy_headers=True)
    if page.status >= 400:
        raise RuntimeError(f"{source.name}: HTTP {page.status}")
    return page.html_content


def caption_from_text(text: str) -> tuple[str, str]:
    """title·alt 속성에 담긴 설명에서 작품명과 연도를 꺼낸다.

    출처가 다른데도 형식은 거의 같다 — "작가, 작품명, 연도, 재료, 규격".
    (환기미술관 title 속성, PKM alt 속성 모두 이 순서다.) 그래서 쉼표로 끊어
    두 번째 칸을 작품명으로 읽고, 연도는 문장 전체에서 네 자리를 찾는다.
    """
    # title 속성 안의 &lt;작품명&gt; 같은 엔티티를 먼저 풀어야 꺾쇠가 글자로
    # 남지 않는다(풀지 않으면 작품명이 "lt-무제-gt"가 된다)
    text = html.unescape(unquote(text))
    text = re.sub(r"<[^>]*>", " ", text)
    fields = [f.strip() for f in text.split(",") if f.strip()]
    year_match = _YEAR.search(text)
    year = year_match.group(1) if year_match else ""
    name = fields[1] if len(fields) > 1 else (fields[0] if fields else "")
    title = slugify(name)
    if year:
        title = re.sub(rf"-?{year}-?", "-", title).strip("-")
    title = _JUNK.sub("-", title)
    title = re.sub(r"-+", "-", title).strip("-")
    return year, title


def from_html(source: Source) -> list[Candidate]:
    """정적 HTML에서 이미지 URL(과 있으면 캡션)을 긁는다.

    pattern에 (?P<url>...) 이름 그룹이 있으면 (?P<caption>...) / (?P<year>...) 과
    짝지어 읽는다. 작품명이 파일명이 아니라 title·alt 속성이나 인라인 JSON에
    들어 있는 사이트가 많아서, URL 하나만 뽑으면 캡션을 잃는다.
    """
    body = fetch_page(source)
    named = "(?P<url>" in source.pattern
    seen: dict[str, Candidate] = {}
    for match in re.finditer(source.pattern, body):
        url = match.group("url") if named else match.group(0)
        if source.include and not re.search(source.include, url):
            continue
        if source.exclude and re.search(source.exclude, url):
            continue
        groups = match.groupdict() if named else {}
        if groups.get("caption"):
            year, title = caption_from_text(groups["caption"])
        else:
            year, title = caption_from_url(url, source.strip)
        if groups.get("year"):
            year_match = _YEAR.search(groups["year"])
            year = year_match.group(1) if year_match else year
        seen.setdefault(
            source.prefix + url,
            Candidate(
                url=source.prefix + url,
                source=source.name,
                title=title,
                year=year,
            ),
        )
    return list(seen.values())


def _rows(source: Source, payload) -> list[dict]:
    """응답에서 항목 목록을 꺼낸다.

    항목 배열({items: [{...}]})이 보통이지만, 열 단위로 주는 곳도 있다
    ({image: [...], title: [...], year: [...]}) — 그건 인덱스로 엮어 준다.
    """
    if source.columns:
        arrays = {
            key: dig(payload, path) or [] for key, path in source.columns.items()
        }
        length = min((len(a) for a in arrays.values()), default=0)
        return [{key: arrays[key][i] for key in arrays} for i in range(length)]
    found = dig(payload, source.items) if source.items else payload
    return found if isinstance(found, list) else []


def _candidate(source: Source, row: dict) -> Candidate | None:
    image_key = source.columns.get("image", source.image_field) and (
        "image" if source.columns else source.image_field
    )
    url = dig(row, image_key) if image_key else None
    if not isinstance(url, str) or not url:
        return None
    title_key = "title" if source.columns else source.title_field
    year_key = "year" if source.columns else source.year_field
    title = dig(row, title_key) if title_key else ""
    raw_year = dig(row, year_key) if year_key else ""
    year_match = _YEAR.search(str(raw_year or ""))
    return Candidate(
        url=source.prefix + url,
        source=source.name,
        title=slugify(str(title or "")),
        year=year_match.group(1) if year_match else "",
        delay=source.delay,
    )


def from_json(source: Source) -> list[Candidate]:
    out: list[Candidate] = []
    with httpx.Client(
        headers={"User-Agent": UA}, follow_redirects=True, timeout=60
    ) as client:
        # 세션 쿠키를 요구하는 PHP 사이트가 있다. 목록 페이지를 먼저 한 번 연다
        if source.session_url:
            client.get(source.session_url)

        for type_value in source.types or [None]:
            page = source.page_start
            while True:
                data = dict(source.body or {})
                if type_value is not None:
                    data[source.type_field] = type_value
                if source.page_field:
                    data[source.page_field] = page

                if source.method.upper() == "POST":
                    kwargs = {"data": data} if source.form else {"json": data}
                    res = client.post(source.url, **kwargs)
                else:
                    res = client.get(source.url, params=data)
                res.raise_for_status()
                rows = _rows(source, res.json())
                out += [c for row in rows if (c := _candidate(source, row))]

                # 페이징이 없거나, 더 줄 것이 없거나, 상한에 닿으면 끝낸다
                if not rows or not source.page_field or not source.page_step:
                    break
                page += source.page_step
                if source.page_max and page >= source.page_max:
                    break
                time.sleep(source.delay)
    return out


def from_commons(source: Source) -> list[Candidate]:
    """Wikimedia Commons: 검색으로 파일 목록을 받고, 배치로 크기·캡션을 받는다.

    무간격으로 다섯 번째 요청부터 429가 떨어진다(실측). 요청 사이에 delay를 둔다.
    크기를 미리 알 수 있으니 저해상도는 내려받기 전에 버린다 — Commons는 같은
    카테고리에 3300px와 400px가 섞여 있다.
    """
    api = "https://commons.wikimedia.org/w/api.php"
    out: list[Candidate] = []
    with httpx.Client(
        headers={"User-Agent": UA}, follow_redirects=True, timeout=60
    ) as client:
        res = client.get(
            api,
            params={
                "action": "query",
                "list": "search",
                "srsearch": source.query,
                "srnamespace": 6,
                "srlimit": 500,
                "format": "json",
            },
        )
        res.raise_for_status()
        titles = [hit["title"] for hit in res.json()["query"]["search"]]
        print(f"    Commons 검색 {len(titles)}건")

        for start in range(0, len(titles), 50):
            time.sleep(source.delay)
            batch = titles[start : start + 50]
            res = client.get(
                api,
                params={
                    "action": "query",
                    "titles": "|".join(batch),
                    "prop": "imageinfo",
                    "iiprop": "url|size|extmetadata",
                    "format": "json",
                },
            )
            res.raise_for_status()
            for page in res.json()["query"]["pages"].values():
                info = (page.get("imageinfo") or [{}])[0]
                url = info.get("url")
                if not url:
                    continue
                meta = info.get("extmetadata") or {}
                if source.artist_match:
                    credit = re.sub(
                        r"<[^>]+>", " ", str(dig(meta, "Artist.value") or "")
                    )
                    if not re.search(source.artist_match, credit, re.I):
                        continue
                name = dig(meta, "ObjectName.value") or page.get("title", "")
                year, slug = caption_from_url(url, source.strip)
                title = slugify(re.sub(r"<[^>]+>", " ", str(name))) or slug
                for token in source.strip:
                    title = re.sub(token, "-", title)
                # 제목에 연도가 들어 있으면 파일명에 두 번 박힌다(04-1916-...-1916)
                if year:
                    title = re.sub(rf"-?{year}-?", "-", title)
                out.append(
                    Candidate(
                        # API가 붙여 주는 utm_* 추적 파라미터를 뗀다
                        url=url.split("?")[0],
                        source=source.name,
                        title=re.sub(r"-+", "-", title).strip("-"),
                        year=year,
                        width=info.get("width", 0),
                        height=info.get("height", 0),
                        delay=source.delay,
                    )
                )
    return out


GATHERERS = {
    "html": from_html,
    "browser": from_html,
    "json": from_json,
    "commons": from_commons,
}


# ──────────────────────────────── 같은 그림 판별 ────────────────────────────────
# 바이트 해시(SHA-256)로는 같은 작품을 다른 갤러리에서 다른 크기로 받은 경우를
# 못 걸러낸다. 그런데 한 작가를 여러 출처에서 긁으면 그게 대부분이다 — Pace와
# Lisson이 같은 작품을 함께 걸어 둔다. 16×16 평균 해시로 구도를 비교한다.
#
# 단색화는 구도만으로는 구별이 안 되므로(박서보 묘법은 서로 닮았다) 가로세로
# 비율까지 2% 안에서 같을 때만 같은 그림으로 본다.
FINGERPRINT_GRID = 16
FINGERPRINT_DISTANCE = 5


def fingerprint(path: Path) -> tuple[tuple[bool, ...], float] | None:
    """dwebp로 회색 평면을 뽑아 평균 해시와 가로세로 비율을 만든다."""
    with tempfile.NamedTemporaryFile(suffix=".pgm") as tmp:
        result = subprocess.run(
            ["dwebp", str(path), "-pgm", "-o", tmp.name], capture_output=True
        )
        if result.returncode != 0:
            return None
        raw = Path(tmp.name).read_bytes()
    header = raw.split(b"\n", 3)
    if len(header) < 4:
        return None
    width, height = map(int, header[1].split())
    plane = header[3]
    cells = []
    for gy in range(FINGERPRINT_GRID):
        for gx in range(FINGERPRINT_GRID):
            x = int((gx + 0.5) * width / FINGERPRINT_GRID)
            y = int((gy + 0.5) * height / FINGERPRINT_GRID)
            offset = y * width + x
            cells.append(plane[offset] if offset < len(plane) else 0)
    average = sum(cells) / len(cells)
    return tuple(cell > average for cell in cells), width / height


def same_picture(a, b) -> bool:
    bits_a, ratio_a = a
    bits_b, ratio_b = b
    if abs(ratio_a - ratio_b) / max(ratio_a, ratio_b) >= 0.02:
        return False
    return sum(x != y for x, y in zip(bits_a, bits_b)) <= FINGERPRINT_DISTANCE


# ───────────────────────────────── 파이프라인 ─────────────────────────────────


class TooBusy(RuntimeError):
    """기다려서 풀릴 수준을 넘은 차단. 남은 후보를 두드리면 더 길어진다."""


# 위키미디어는 두 종류의 429를 준다: 몇 초짜리 버스트 제한과 10분짜리 쿨다운.
# 앞쪽은 기다렸다 이어가면 되고, 뒤쪽은 접고 나중에 다시 돌려야 한다.
PATIENCE = 120


def fetch(client: httpx.Client, candidate: Candidate) -> bytes:
    for attempt in range(3):
        res = client.get(candidate.url)
        if res.status_code != 429:
            res.raise_for_status()
            return res.content

        wait = int(res.headers.get("retry-after", PATIENCE + 1))
        if wait > PATIENCE:
            raise TooBusy(f"{wait}초 차단입니다. 그만큼 뒤에 다시 돌리세요.")
        print(f"    … 429, {wait}초 기다립니다 ({attempt + 1}/3)")
        time.sleep(wait + 1)

    raise TooBusy("429가 이어집니다. 잠시 뒤에 다시 돌리세요.")


def load_seen() -> dict[str, dict[str, str]]:
    """받은 기록. 바이트 해시와 **URL** 둘 다 남긴다.

    해시는 내려받은 뒤에야 나오므로, 해시만 기록하면 다시 돌릴 때 이미 가진
    그림을 전부 다시 내려받는다 — 요청을 세는 출처(Commons)에서는 그것만으로
    차단에 걸린다. 그래서 결과가 무엇이었든(기록·저해상도·중복) URL을 남겨
    두 번째 실행은 건너뛴다.
    """
    blank = {"hashes": {}, "urls": {}}
    if not SEEN_FILE.exists():
        return blank
    stored = json.loads(SEEN_FILE.read_text())
    if "hashes" in stored or "urls" in stored:
        return {**blank, **stored}
    # 옛 형식: {해시: 파일명}
    return {"hashes": stored, "urls": {}}


def next_index(folder: Path) -> int:
    used = [
        int(m.group(1))
        for f in folder.glob("*")
        if (m := re.match(r"(\d+)-", f.name))
    ]
    return max(used, default=0) + 1


def to_webp(data: bytes, dst: Path, width: int, height: int) -> None:
    cmd = ["cwebp", "-q", "90", "-m", "6"]
    if max(width, height) > MAX_LONG_EDGE:
        side = ["2400", "0"] if width >= height else ["0", "2400"]
        cmd += ["-resize", *side]
    with tempfile.NamedTemporaryFile(suffix=".src") as tmp:
        tmp.write(data)
        tmp.flush()
        subprocess.run([*cmd, tmp.name, "-o", str(dst)], check=True, capture_output=True)


def collect(artist: str, limit: int, dry_run: bool, only: str | None) -> None:
    configured, titles = load_sources()
    if artist not in configured:
        raise SystemExit(
            f"sources.toml에 {artist!r} 항목이 없습니다. "
            f"등록된 작가: {', '.join(sorted(configured))}"
        )

    folder = GALLERY / artist
    folder.mkdir(parents=True, exist_ok=True)
    existing = sorted(
        p for p in folder.iterdir() if p.suffix.lower() in IMAGE_SUFFIXES
    )
    budget = limit - len(existing)
    print(f"[{artist}] 기존 {len(existing)}장, 상한 {limit}장 → 여유 {budget}장")
    if budget <= 0 and not dry_run:
        print("  상한에 도달했습니다. 새로 받지 않습니다.")
        return

    # 1) 출처마다 후보 URL을 모은다
    candidates: list[Candidate] = []
    for source in configured[artist]:
        if not source.enabled or (only and source.name != only):
            continue
        print(f"  ← {source.name} ({source.kind})")
        # 파일명에 박힌 작가 이름은 작품명이 아니다. 출처마다 적지 않고 여기서 뺀다
        source.strip = source.strip + [
            rf"\b{re.escape(token)}\b" for token in artist.split("-") if len(token) > 1
        ]
        try:
            found = GATHERERS[source.kind](source)
        except Exception as error:  # 한 출처가 막혀도 나머지는 계속 간다
            print(f"    실패: {type(error).__name__}: {error}")
            continue
        for candidate in found:
            candidate.url = origins.normalize(source.origin, candidate.url)
            candidate.title = localize(candidate.title, titles.get(artist, {}))
        print(f"    후보 {len(found)}건")
        candidates += found
        time.sleep(source.delay)

    # 2) URL 중복 제거 + API가 크기를 알려 준 것은 미리 걸러낸다
    unique: dict[str, Candidate] = {}
    for candidate in candidates:
        if candidate.width and max(candidate.width, candidate.height) < MIN_LONG_EDGE:
            continue
        unique.setdefault(candidate.url, candidate)
    print(f"  후보 합계 {len(unique)}건 (중복·저해상도 제외)")

    # 3) 내려받아 실제 픽셀을 재고, 같은 그림을 두 번 받지 않는다
    seen = load_seen()
    fresh: list[tuple[Candidate, bytes, int, int]] = []
    small = dupes = failed = 0
    with httpx.Client(
        headers={"User-Agent": UA}, follow_redirects=True, timeout=120
    ) as client:
        for candidate in unique.values():
            if candidate.url in seen["urls"]:
                dupes += 1
                continue
            time.sleep(candidate.delay)
            try:
                data = fetch(client, candidate)
            except TooBusy as error:
                failed += 1
                print(f"    ! {error}")
                break
            except httpx.HTTPStatusError as error:
                failed += 1
                print(f"    x HTTP {error.response.status_code} {candidate.url[-50:]}")
                continue
            except Exception as error:
                failed += 1
                print(f"    x {type(error).__name__} {candidate.url[-50:]}")
                continue

            digest = hashlib.sha256(data).hexdigest()
            if digest in seen["hashes"]:
                seen["urls"][candidate.url] = seen["hashes"][digest]
                dupes += 1
                continue
            size = probe_size(data)
            if not size or max(size) < MIN_LONG_EDGE:
                seen["urls"][candidate.url] = "(저해상도)"
                small += 1
                continue
            fresh.append((candidate, data, *size))
            print(f"    ✓ {size[0]}×{size[1]} {len(data) // 1024}KB {candidate.title or candidate.url[-40:]}")
            time.sleep(candidate.delay)

    print(
        f"  받음 {len(fresh)}건 / 저해상도 폐기 {small} / 중복 {dupes} / 실패 {failed}"
    )

    # 4) 큰 것부터 상한까지만 남긴다
    fresh.sort(key=lambda row: row[2] * row[3], reverse=True)
    keep = fresh[:budget] if budget > 0 else []
    if dry_run:
        SEEN_FILE.write_text(json.dumps(seen, indent=2, ensure_ascii=False) + "\n")
        print("  --dry-run: 파일을 쓰지 않습니다.")
        for candidate, _, width, height in fresh[: max(budget, 10)]:
            print(f"    {width}×{height}  {candidate.source}  {candidate.url}")
        return

    # 이미 걸려 있는 그림의 지문을 먼저 떠 둔다
    prints = [
        print_ for path in existing if (print_ := fingerprint(path)) is not None
    ]

    index = next_index(folder)
    written = []
    twins = 0
    for candidate, data, width, height in keep:
        name = filename(index, candidate.year, candidate.title)
        destination = folder / name
        to_webp(data, destination, width, height)

        new_print = fingerprint(destination)
        if new_print and any(same_picture(new_print, old) for old in prints):
            destination.unlink()
            seen["urls"][candidate.url] = "(같은 그림)"
            twins += 1
            continue
        if new_print:
            prints.append(new_print)

        seen["hashes"][hashlib.sha256(data).hexdigest()] = f"{artist}/{name}"
        seen["urls"][candidate.url] = f"{artist}/{name}"
        written.append((name, width, height))
        index += 1

    if twins:
        print(f"  같은 그림이라 버림 {twins}장")

    SEEN_FILE.write_text(json.dumps(seen, indent=2, ensure_ascii=False) + "\n")
    print(f"  → {len(written)}장 기록")
    for name, width, height in written:
        print(f"    {name}  ({width}×{height} 원본)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artist", help="작가 폴더명 (sources.toml의 키)")
    parser.add_argument("--limit", type=int, default=30, help="작가당 장수 상한")
    parser.add_argument("--only", help="이 출처 하나만 쓴다")
    parser.add_argument("--dry-run", action="store_true", help="받아서 재 보고 쓰지 않는다")
    parser.add_argument("--list", action="store_true", help="등록된 작가와 출처를 보여준다")
    args = parser.parse_args()

    configured, _ = load_sources()
    if args.list or not args.artist:
        for artist, sources in sorted(configured.items()):
            folder = GALLERY / artist
            count = (
                sum(1 for p in folder.iterdir() if p.suffix.lower() in IMAGE_SUFFIXES)
                if folder.exists()
                else 0
            )
            print(f"{artist} ({count}장)")
            for source in sources:
                mark = " " if source.enabled else "×"
                print(f"  {mark} {source.name:22} {source.kind:8} {source.origin}")
        return

    collect(args.artist, args.limit, args.dry_run, args.only)


if __name__ == "__main__":
    main()
