import type {
  RawSpotifyTrack,
  SpotifyArtist,
  SpotifyImage,
  SpotifyTrack,
} from "@/types/spotify";

const normalizeArtists = (artists: SpotifyArtist[]): string =>
  artists.map((artist) => artist.name).join(", ");

// 트랙 표지는 56px 칸(2배 화면 112px)에 들어간다. 이미지 최적화를 거치지 않으므로
// Spotify가 주는 크기(큰 것부터 640·300·64) 중 그보다 큰 것 가운데 가장 작은 것을 고른다.
const COVER_MIN_WIDTH = 112;

const pickCover = (images: SpotifyImage[]): SpotifyImage | undefined =>
  images.filter((image) => (image.width ?? 0) >= COVER_MIN_WIDTH).at(-1) ??
  images[0];

// id를 남긴다. 이름은 리믹스·라이브 버전끼리 겹칠 수 있어 목록의 key로
// 쓰기에 안전하지 않다.
export const extractTopTrack = (track: SpotifyTrack) => ({
  id: track.id,
  albumCover: pickCover(track.album.images),
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
