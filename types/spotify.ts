import type { extractTrack, extractTopTrack } from "@/lib/spotify/extract";

// 공통으로 사용되는 기본 타입들
interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export interface SpotifyArtist {
  name: string;
}

interface SpotifyExternalUrls {
  spotify: string;
}

interface SpotifyAlbum {
  images: SpotifyImage[];
  name?: string;
}

// Top Track 관련 타입
export interface SpotifyTopTrack {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  external_urls: SpotifyExternalUrls;
  name: string;
}

// Recently Played Track 관련 타입
export interface RawSpotifyTrack {
  track: {
    album: SpotifyAlbum;
    artists: SpotifyArtist[];
    external_urls: SpotifyExternalUrls;
    name: string;
  };
  played_at: string;
}

export type TypeTopTrack = ReturnType<typeof extractTopTrack>;

export type TypeRecentlyPlayedTrack = ReturnType<typeof extractTrack>;

export interface TypeSpotifyPlaylist {
  owner: { display_name: string };
  images: {
    height: null | number;
    url: string;
    width: null | number;
  }[];
  external_urls: {
    spotify: string;
  };
  name: string;
  description: string;
  id: string;
  blurDataURL: string;
}
