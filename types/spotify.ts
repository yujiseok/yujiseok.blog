import {
  extractCurrentlyPlayingTrack,
  extractTrack,
  extractTopTrack,
} from "@/lib/spotify/extract";

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

// Currently Playing Track 관련 타입
export interface SpotifyData {
  is_playing: boolean;
  actions: {
    disallows: {
      pausing: boolean;
    };
  };
  item: {
    album: SpotifyAlbum;
    artists: SpotifyArtist[];
    name: string;
    external_urls: SpotifyExternalUrls;
  };
  timestamp: number;
}

export type SpotifyPlaylist = {
  collaborative: boolean;
  description: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: {
    height: null | number;
    url: string;
    width: null | number;
  }[];
  name: string;
  owner: {
    display_name: string;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  primary_color: null | string;
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
};

export type TypeTopTrack = ReturnType<typeof extractTopTrack>;

export type TypeRecentlyPlayedTrack = ReturnType<typeof extractTrack>;

export type TypeCurrentlyPlayingTrack = ReturnType<
  typeof extractCurrentlyPlayingTrack
>;

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
}
