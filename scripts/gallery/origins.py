"""썸네일 URL을 원본 URL로 되돌리는 규칙.

미술관·갤러리 사이트는 거의 다 이미지 CDN 앞에 변환 세그먼트를 끼워 넣는다.
그 세그먼트를 떼거나 실측으로 확인한 최댓값으로 바꾸면 원본이 나온다. 규칙마다
주석에 적은 숫자는 **실제로 받아서 재 본 값**이고, 그보다 큰 숫자를 넣으면
대부분 404나 AccessDenied가 돌아온다(가짜 업스케일을 주는 곳도 있다). 그래서
숫자를 임의로 올리지 않는다.

출처를 새로 추가할 때는 여기에 규칙 하나를 더하고 sources.toml에서 이름으로
가리킨다. URL은 코드가 아니라 sources.toml에 적는다.
"""

import re

# Artlogic(static-assets.artlogic.net)은 호스트 바로 뒤 첫 세그먼트가 변환
# 지시자다: w_1000,c_limit,f_auto,fl_lossy,q_auto 처럼 쉼표로 이어진다.
_ARTLOGIC_TRANSFORM = re.compile(
    r"(?<=//static-assets\.artlogic\.net/)[a-z]+_[^/]*(?:,[a-z]+_[^/]*)*/"
)


def artlogic(url: str) -> str:
    """변환 세그먼트를 통째로 뗀다 → 원본. 실측 2143×3000 ~ 6000×4000.

    f_auto를 남기면 CDN이 다시 WebP로 재인코딩해 내려주므로 부분 제거는 안 된다.
    """
    return _ARTLOGIC_TRANSFORM.sub("", url)


def artlogic_q100(url: str) -> str:
    """PKM(exhibit-e 경로)만 예외다. 변환 세그먼트를 지우는 대신 q_100으로 바꾼다.

    이쪽은 세그먼트를 아예 없애면 응답이 없고, q_100이 붙은 주소가 진짜 원본
    (실측 7500px)이다. q_100을 빼면 화질이 뭉개진다.
    """
    return _ARTLOGIC_TRANSFORM.sub("q_100/", url)


def lisson(url: str) -> str:
    """CDN 캐러셀 이미지의 -S<폭>x- 를 실측 최댓값 3840으로 올린다.

    -S8000x- 처럼 더 키우면 404다. 같은 페이지의 `_next/image?url=` 경유 S3
    원본은 작품에 따라 1000px대라 이 CDN 경로가 낫다.
    """
    return re.sub(r"-S\d+x-F", "-S3840x-F", url)


def pace(url: str) -> str:
    """srcset의 width-360/720/1100/1440/2000 중 2000이 하드캡이다.

    프리셋 밖의 숫자(width-3000 등)나 세그먼트 제거는 S3 AccessDenied가 된다.
    """
    return re.sub(r"\.width-\d+\.(jpg|jpeg|png)", r".width-2000.\1", url)


def perrotin(url: str) -> str:
    """s3.perrotin.com/d:600xauto/... 의 변환 세그먼트를 뗀다 → 실측 4096px."""
    return re.sub(r"/d:\d+xauto(?=/)", "", url)


def busan_thmb(url: str) -> str:
    """부산시립미술관은 파일명 앞 thmb 접두어만 떼면 원본이다(실측 1200px)."""
    return re.sub(r"/thmb(?=[^/]+$)", "/", url)


def tate(url: str) -> str:
    """미디어 파일명 접미어 _7/_8은 썸네일, _9가 최댓값이다(실측 1200px)."""
    return re.sub(r"_\d+\.(jpg|jpeg|png)", r"_9.\1", url)


def bubble(url: str) -> str:
    """BLUM 등 bubble.io 기반. cdn-cgi/image/w=.../ 를 떼면 원본(실측 1400px)."""
    return re.sub(r"/cdn-cgi/image/[^/]+/", "/", url)


def passthrough(url: str) -> str:
    """API가 이미 원본 주소를 주는 곳(Commons, 구겐하임 wp-json, MMCA 업로드 경로)."""
    return url


RULES = {
    "artlogic": artlogic,
    "artlogic_q100": artlogic_q100,
    "lisson": lisson,
    "pace": pace,
    "perrotin": perrotin,
    "busan_thmb": busan_thmb,
    "tate": tate,
    "bubble": bubble,
    "passthrough": passthrough,
}


def normalize(rule: str, url: str) -> str:
    try:
        return RULES[rule](url)
    except KeyError:
        raise SystemExit(f"origins.py에 없는 규칙입니다: {rule!r}")
