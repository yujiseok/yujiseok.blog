import type { extractTrack, extractTopTrack } from "@/lib/spotify/extract";

export interface SpotifyImage {
  height: number | null;
  url: string;
  width: number | null;
}

export interface SpotifyArtist {
  name: string;
}

export interface SpotifyTrack {
  id: string;
  album: { images: SpotifyImage[] };
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
  name: string;
}

export interface RawSpotifyTrack {
  track: SpotifyTrack;
  // 플레이리스트 트랙 응답에는 없다.
  played_at?: string;
}

// 삭제된 트랙은 항목이 아니라 그 안의 track이 null로 온다.
export interface RawPlaylistTrack {
  track: SpotifyTrack | null;
}

export type TypeTopTrack = ReturnType<typeof extractTopTrack>;

export type TypeRecentlyPlayedTrack = ReturnType<typeof extractTrack>;

export interface TypeSpotifyPlaylist {
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
  name: string;
  id: string;
}
