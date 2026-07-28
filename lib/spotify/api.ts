import { cacheLife } from "next/cache";
import sharp from "sharp";
import { extractTrack, extractTopTrack } from "./extract";
import { BLUR_DATA_URL } from "@/lib/blurUrl";
import {
  RawSpotifyTrack,
  SpotifyTopTrack,
  TypeRecentlyPlayedTrack,
  TypeSpotifyPlaylist,
  TypeTopTrack,
} from "@/types/spotify";

/**
 * Spotify images 배열(큰 것부터 정렬됨)의 가장 작은 이미지로 blur placeholder를 만든다.
 * 반드시 "use cache" 함수 안에서만 호출할 것 — 빌드/리밸리데이트당 한 번만 돌게 하기 위함.
 */
const getBlurDataURL = async (
  images: { url: string }[] | undefined,
): Promise<string> => {
  const src = images?.at(-1)?.url;
  if (!src) return BLUR_DATA_URL;

  try {
    const res = await fetch(src);
    if (!res.ok) return BLUR_DATA_URL;

    const blur = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(10)
      .webp({ quality: 40 })
      .toBuffer();

    return `data:image/webp;base64,${blur.toString("base64")}`;
  } catch {
    return BLUR_DATA_URL;
  }
};

const getAccessToken = async () => {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;

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
      refresh_token: SPOTIFY_REFRESH_TOKEN ?? "",
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Spotify 토큰 갱신 실패 (${res.status}): ${await res.text()}`,
    );
  }

  const { access_token } = await res.json();

  return access_token as string;
};

const spotifyFetch = async <T>(endpoint: string): Promise<T> => {
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

export const getRecentlyPlayed = async (): Promise<
  TypeRecentlyPlayedTrack[]
> => {
  "use cache";
  cacheLife({ revalidate: 180 });

  const { items } = await spotifyFetch<{ items: RawSpotifyTrack[] }>(
    "/me/player/recently-played",
  );

  return Promise.all(
    items.map(async (item) =>
      extractTrack(item, await getBlurDataURL(item.track.album.images)),
    ),
  );
};

export const getPlaylists = async (
  limit = 20,
  offset = 0,
): Promise<TypeSpotifyPlaylist[]> => {
  "use cache";
  cacheLife("days");

  const { items } = await spotifyFetch<{
    items: Omit<TypeSpotifyPlaylist, "blurDataURL">[];
  }>(
    `/me/playlists?fields=items(id,name,images,external_urls.spotify)&limit=${limit}&offset=${offset}`,
  );

  return Promise.all(
    items.map(async (playlist) => ({
      ...playlist,
      blurDataURL: await getBlurDataURL(playlist.images),
    })),
  );
};

export const getPlaylistById = async (id: string) =>
  (await getPlaylists()).find((playlist) => playlist.id === id);

export const getTopTracks = async (): Promise<TypeTopTrack[]> => {
  "use cache";
  cacheLife("days");

  const { items } = await spotifyFetch<{ items: SpotifyTopTrack[] }>(
    "/me/top/tracks?limit=20&time_range=short_term",
  );

  return Promise.all(
    items.map(async (item) =>
      extractTopTrack(item, await getBlurDataURL(item.album.images)),
    ),
  );
};

export const getPlaylistTrack = async (
  playlistId: string,
  limit = 10,
  offset = 0,
): Promise<TypeRecentlyPlayedTrack[]> => {
  "use cache";
  cacheLife("days");

  const { items } = await spotifyFetch<{ items: RawSpotifyTrack[] }>(
    `/playlists/${playlistId}/tracks?fields=items(track(name,external_urls.spotify,album(name,images),artists(name)))&limit=${limit}&offset=${offset}`,
  );

  return Promise.all(
    items.map(async (item) =>
      extractTrack(item, await getBlurDataURL(item.track.album.images)),
    ),
  );
};
