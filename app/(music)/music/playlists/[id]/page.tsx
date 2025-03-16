import BlurContainer from "@/app/components/blurContainer";
import Track from "@/app/components/music/track";
import { getBlurDataUrl } from "@/lib/blurUrl";
import { getPlaylists, getPlaylistTrack } from "@/lib/spotify/api";
import { TypeSpotifyPlaylist } from "@/types/spotify";

import Image from "next/image";

export const revalidate = 86_400;

export const generateStaticParams = async () => {
  const playlists = await getPlaylists();
  return playlists.map((playlist) => ({
    id: playlist.id,
  }));
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const playlistId = (await params).id;
  const playlistTracks = await getPlaylistTrack(playlistId, 10, 0);

  const playlists = await getPlaylists();
  const playlist = playlists.find(
    (playlist) => playlist.id === playlistId,
  ) as TypeSpotifyPlaylist;

  const blurDataUrl = await getBlurDataUrl(playlist.images[0].url);

  return (
    <BlurContainer className="gap-0">
      <div className="mb-4 grid items-center gap-2">
        <Image
          src={playlist.images[0].url}
          alt={playlist.name}
          width={playlist.images[0].width ?? 640}
          height={playlist.images[0].height ?? 640}
          className="pointer-events-none mb-2 size-56 rounded-lg object-cover"
          placeholder="blur"
          blurDataURL={blurDataUrl}
        />
        <p className="group flex items-center gap-1.5">
          <span className="text-lg">{playlist.name}</span>
          <small>◦</small>
          <a
            href={playlist.external_urls.spotify}
            target="_blank"
            className="flex items-center gap-0.5 text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            스포티파이에서 보기
            <ArrowUpRight />
          </a>
        </p>
      </div>
      <div className="-m-3">
        {playlistTracks.map((track) => (
          <Track key={track.trackName} track={track} />
        ))}
      </div>
    </BlurContainer>
  );
};

export default page;

const ArrowUpRight = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1"
      stroke="currentColor"
      className="size-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
      />
    </svg>
  );
};
