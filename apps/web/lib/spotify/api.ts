import { cacheLife } from "next/cache";
import { extractTrack, extractTopTrack } from "./extract";
import type {
  RawPlaylistTrack,
  RawSpotifyTrack,
  SpotifyTrack,
  TypeSpotifyPlaylist,
} from "@/types/spotify";

/*
 * 액세스 토큰은 1시간 유효하다. 캐시하지 않으면 데이터 요청 한 건마다
 * 토큰 발급 POST가 한 건씩 따라붙는다. 만료보다 넉넉히 앞서 갱신한다.
 */
const getAccessToken = async () => {
  "use cache";
  cacheLife({ revalidate: 1800, expire: 3000 });

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error(
      "SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN 환경변수가 필요합니다",
    );
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Spotify 토큰 갱신 실패 (${res.status}): ${await res.text()}`,
    );
  }

  const { access_token }: { access_token: string } = await res.json();

  return access_token;
};

const spotifyFetch = async <T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `${path}?${query}` : path;
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${await getAccessToken()}` },
  });

  if (!res.ok) {
    throw new Error(
      `Spotify 요청 실패 ${endpoint} (${res.status}): ${await res.text()}`,
    );
  }

  return res.json();
};

// Spotify가 한 번에 주는 최대치. 이보다 크게 요청해도 잘려서 온다.
const PAGE_LIMIT = 50;

// 어떤 목록도 조용히 잘리지 않게 total에 닿을 때까지 offset을 민다.
// limit 하나로 끊어두면 그 뒤 항목은 존재하지 않는 것처럼 보인다.
const fetchAllPages = async <T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T[]> => {
  const items: T[] = [];

  for (let offset = 0; ; offset += PAGE_LIMIT) {
    const page = await spotifyFetch<{ items: (T | null)[]; total: number }>(
      path,
      { ...params, limit: String(PAGE_LIMIT), offset: String(offset) },
    );

    // 삭제되거나 지역 제한에 걸린 트랙은 null로 온다.
    items.push(...page.items.filter((item): item is T => item !== null));

    if (page.items.length === 0 || offset + page.items.length >= page.total) {
      return items;
    }
  }
};

export const getRecentlyPlayed = async () => {
  "use cache";
  cacheLife({ revalidate: 180 });

  const { items } = await spotifyFetch<{ items: RawSpotifyTrack[] }>(
    "/me/player/recently-played",
  );

  return items.map(extractTrack);
};

export const getPlaylists = async () => {
  "use cache";
  cacheLife("days");

  return fetchAllPages<TypeSpotifyPlaylist>("/me/playlists");
};

export const getPlaylistById = async (id: string) =>
  (await getPlaylists()).find((playlist) => playlist.id === id);

export const getTopTracks = async () => {
  "use cache";
  cacheLife("days");

  const { items } = await spotifyFetch<{ items: SpotifyTrack[] }>(
    "/me/top/tracks",
    { limit: String(PAGE_LIMIT), time_range: "short_term" },
  );

  return items.map(extractTopTrack);
};

export const getPlaylistTrack = async (playlistId: string) => {
  "use cache";
  cacheLife("days");

  // fields를 쓰면 응답이 그 목록으로 잘리므로 total도 함께 요청해야 한다.
  const items = await fetchAllPages<RawPlaylistTrack>(
    `/playlists/${playlistId}/tracks`,
    {
      fields:
        "total,items(track(id,name,external_urls.spotify,album(name,images),artists(name)))",
    },
  );

  return items
    .filter((item): item is RawSpotifyTrack => item.track != null)
    .map(extractTrack);
};
