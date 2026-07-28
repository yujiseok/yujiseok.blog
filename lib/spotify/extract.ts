import {
  RawSpotifyTrack,
  SpotifyArtist,
  SpotifyTopTrack,
} from "@/types/spotify";

const normalizeArtists = (artists: SpotifyArtist[]): string =>
  artists.map((artist) => artist.name).join(", ");

export const extractTopTrack = (
  track: SpotifyTopTrack,
  blurDataURL: string,
) => ({
  albumCover: track.album.images[0],
  blurDataURL,
  artistName: normalizeArtists(track.artists),
  spotifyUrl: track.external_urls.spotify,
  trackName: track.name,
});

export const extractTrack = (
  rawTrack: RawSpotifyTrack,
  blurDataURL: string,
) => ({
  albumCover: rawTrack.track.album.images[0],
  blurDataURL,
  albumName: rawTrack.track.album.name,
  artistName: normalizeArtists(rawTrack.track.artists),
  spotifyUrl: rawTrack.track.external_urls.spotify,
  trackName: rawTrack.track.name,
  playedAt: new Date(rawTrack.played_at),
});
