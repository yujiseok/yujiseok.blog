import {
  extractCurrentlyPlayingTrack,
  extractTrack,
  extractTopTrack,
} from "./extract";
import {
  TypeCurrentlyPlayingTrack,
  TypeRecentlyPlayedTrack,
  TypeSpotifyPlaylist,
  TypeTopTrack,
} from "@/types/spotify";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
  process.env;

const BASIC_TOKEN = Buffer.from(
  SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET,
).toString("base64");

const body = new URLSearchParams({
  grant_type: "refresh_token",
  refresh_token: SPOTIFY_REFRESH_TOKEN!,
}).toString();

export const getAccessToken = async () => {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${BASIC_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();

  return data.access_token;
};

export const getRecentlyPlayed = async (): Promise<
  TypeRecentlyPlayedTrack[]
> => {
  const access_token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  const data = await res.json();
  const tracks = data.items.map(extractTrack);

  return tracks;
};

export const getCurrentlyPlaying =
  async (): Promise<TypeCurrentlyPlayingTrack> => {
    const access_token = await getAccessToken();

    const res = await fetch(
      `https://api.spotify.com/v1/me/player/currently-playing`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        next: {
          revalidate: 60,
        },
      },
    );

    if (res.status === 204) {
      return {
        isPlaying: false,
        artistName: "",
        trackName: "",
        albumImage: {
          url: "",
          width: 0,
          height: 0,
        },
        spotifyUrl: "",
        timestamp: 0,
      };
    }

    const data = await res.json();

    return extractCurrentlyPlayingTrack(data);
  };

export const getPlaylists = async (
  limit = 20,
  offset = 0,
): Promise<TypeSpotifyPlaylist[]> => {
  const access_token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/me/playlists?fields=items(id,name,images,external_urls.spotify)&limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );

  const data = await res.json();

  return data.items;
};

export const getTopTracks = async (): Promise<TypeTopTrack[]> => {
  const access_token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=short_term`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );

  const data = await res.json();
  const tracks = data.items.map(extractTopTrack);

  return tracks;
};

export const getPlaylistTrack = async (
  playlistId: string,
  limit = 10,
  offset = 0,
): Promise<TypeRecentlyPlayedTrack[]> => {
  const access_token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(name,external_urls.spotify,album(name,images),artists(name)))&limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );

  const data = await res.json();

  const tracks = data.items.map(extractTrack);

  return tracks;
};
