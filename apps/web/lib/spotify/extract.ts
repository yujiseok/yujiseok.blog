import type {
  RawSpotifyTrack,
  SpotifyArtist,
  SpotifyTrack,
} from "@/types/spotify";

const normalizeArtists = (artists: SpotifyArtist[]): string =>
  artists.map((artist) => artist.name).join(", ");

// id를 남긴다. 이름은 리믹스·라이브 버전끼리 겹칠 수 있어 목록의 key로
// 쓰기에 안전하지 않다.
export const extractTopTrack = (track: SpotifyTrack) => ({
  id: track.id,
  albumCover: track.album.images[0],
  artistName: normalizeArtists(track.artists),
  spotifyUrl: track.external_urls.spotify,
  trackName: track.name,
});

export const extractTrack = (rawTrack: RawSpotifyTrack) => ({
  ...extractTopTrack(rawTrack.track),
  // 플레이리스트 트랙에는 played_at이 없다. 없는 걸 Date로 감싸면
  // Invalid Date가 조용히 흘러다닌다.
  playedAt: rawTrack.played_at ? new Date(rawTrack.played_at) : undefined,
});
