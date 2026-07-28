import { cacheLife } from "next/cache";
import { extractTrack, extractTopTrack } from "./extract";
import {
  RawSpotifyTrack,
  SpotifyTopTrack,
  TypeRecentlyPlayedTrack,
  TypeSpotifyPlaylist,
  TypeTopTrack,
} from "@/types/spotify";

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

  return items.map(extractTrack);
};

export const getPlaylists = async (
  limit = 20,
  offset = 0,
): Promise<TypeSpotifyPlaylist[]> => {
  "use cache";
  cacheLife("days");

  const { items } = await spotifyFetch<{ items: TypeSpotifyPlaylist[] }>(
    `/me/playlists?fields=items(id,name,images,external_urls.spotify)&limit=${limit}&offset=${offset}`,
  );

  return items;
};

export const getPlaylistById = async (id: string) =>
  (await getPlaylists()).find((playlist) => playlist.id === id);

export const getTopTracks = async (): Promise<TypeTopTrack[]> => {
  "use cache";
  cacheLife("days");

  const { items } = await spotifyFetch<{ items: SpotifyTopTrack[] }>(
    "/me/top/tracks?limit=20&time_range=short_term",
  );

  return items.map(extractTopTrack);
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

  return items.map(extractTrack);
};
