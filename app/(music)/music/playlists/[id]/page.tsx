import Track from "@/app/(music)/_components/track";
import {
  getPlaylistById,
  getPlaylists,
  getPlaylistTrack,
} from "@/lib/spotify/api";
import { ViewTransition } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import BlurContainer from "@/app/_components/blur-container";
import ArrowUpRight from "@/app/_components/arrow-up-right";
import type { Metadata } from "next";
import { alternates, SITE_OG } from "@/lib/metadata";
import ExternalLink from "@/app/_components/external-link";

export const generateStaticParams = async () => {
  try {
    const playlists = await getPlaylists();
    return playlists.map((playlist) => ({
      id: playlist.id,
    }));
  } catch {
    // Spotify가 죽어도 빌드는 통과시킨다. 빈 배열이면 요청 시 렌더된다.
    return [];
  }
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata | undefined> => {
  const { id } = await params;
  const playlist = await getPlaylistById(id);

  if (!playlist) return;

  return {
    title: playlist.name,
    description: `${playlist.name} 플레이리스트의 트랙 목록`,
    alternates: alternates(`/music/playlists/${id}`),
    openGraph: {
      url: `/music/playlists/${id}`,
      type: "website",
      ...SITE_OG,
    },
  };
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const playlistId = (await params).id;
  const playlist = await getPlaylistById(playlistId);

  if (!playlist) {
    notFound();
  }

  const playlistTracks = await getPlaylistTrack(playlistId);

  return (
    <div>
      <ViewTransition name={`playlist-${playlist.id}`}>
        {playlist.images[0] && (
          <Image
            src={playlist.images[0].url}
            alt={playlist.name}
            width={playlist.images[0].width ?? 640}
            height={playlist.images[0].height ?? 640}
            className="pointer-events-none mb-3 size-56 rounded-lg object-cover"
          />
        )}
      </ViewTransition>
      <BlurContainer className="gap-0">
        <p className="group flex items-center gap-1.5">
          <span className="text-lg">{playlist.name}</span>
          <small>◦</small>
          <ExternalLink
            href={playlist.external_urls.spotify}
            className="flex items-center gap-0.5 text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            스포티파이에서 보기
            <ArrowUpRight />
          </ExternalLink>
        </p>

        <div className="-mx-3 mt-4">
          {playlistTracks.map((track) => (
            <Track key={track.id} track={track} />
          ))}
        </div>
      </BlurContainer>
    </div>
  );
};

export default page;
