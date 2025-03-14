import {
  RawSpotifyTrack,
  SpotifyArtist,
  SpotifyData,
  SpotifyTopTrack,
} from "@/types/spotify";

const normalizeArtists = (artists: SpotifyArtist[]): string =>
  artists.map((artist) => artist.name).join(", ");

export const extractTopTrack = (track: SpotifyTopTrack) => ({
  albumCover: track.album.images[0],
  artistName: normalizeArtists(track.artists),
  spotifyUrl: track.external_urls.spotify,
  trackName: track.name,
});

export const extractRecentlyPlayedTrack = (rawTrack: RawSpotifyTrack) => ({
  albumCover: rawTrack.track.album.images[0],
  albumName: rawTrack.track.album.name,
  artistName: normalizeArtists(rawTrack.track.artists),
  spotifyUrl: rawTrack.track.external_urls.spotify,
  trackName: rawTrack.track.name,
  playedAt: new Date(rawTrack.played_at),
});

export const extractCurrentlyPlayingTrack = (track: SpotifyData) => ({
  isPlaying: track.is_playing,
  artistName: normalizeArtists(track.item.artists),
  trackName: track.item.name,
  albumImage: track.item.album.images[0],
  spotifyUrl: track.item.external_urls.spotify,
  timestamp: track.timestamp,
});
