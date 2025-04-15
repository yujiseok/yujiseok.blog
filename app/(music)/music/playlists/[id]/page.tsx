import Track from "@/app/components/music/track";
import { getBlurDataUrl } from "@/lib/blurUrl";
import { getPlaylists, getPlaylistTrack } from "@/lib/spotify/api";
import { TypeSpotifyPlaylist } from "@/types/spotify";
import { unstable_ViewTransition as ViewTransition } from "react";
import Image from "next/image";
import BlurContainer from "@/app/components/blurContainer";
import ArrowUpRight from "@/app/components/arrowUpRight";

export const revalidate = 86_400;

export const generateStaticParams = async () => {
  const playlists = await getPlaylists();
  return playlists.map((playlist) => ({
    id: playlist.id,
  }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const playlistId = (await params).id;
  const playlists = await getPlaylists();
  const playlist = playlists.find(
    (playlist) => playlist.id === playlistId,
  ) as TypeSpotifyPlaylist;

  return {
    title: playlist.name,
  };
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
    <div>
      <ViewTransition name="playlist">
        <Image
          src={playlist.images[0].url}
          alt={playlist.name}
          width={playlist.images[0].width ?? 640}
          height={playlist.images[0].height ?? 640}
          className="pointer-events-none mb-3 size-56 rounded-lg object-cover"
          placeholder="blur"
          blurDataURL={blurDataUrl}
        />
      </ViewTransition>
      <BlurContainer className="gap-0">
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

        <div className="-mx-3 mt-4">
          {playlistTracks.map((track) => (
            <Track key={track.trackName} track={track} />
          ))}
        </div>
      </BlurContainer>
    </div>
  );
};

export default page;
