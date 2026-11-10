import Track from "@/app/[locale]/(music)/_components/track";
import { getPlaylistById, getPlaylistTrack } from "@/lib/spotify/api";
import { ViewTransition } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import BlurContainer from "@/app/_components/blur-container";
import ArrowUpRight from "@/app/_components/arrow-up-right";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale } from "@/lib/i18n/params";
import ExternalLink from "@/app/_components/external-link";

/*
 * generateStaticParams를 두지 않는다. 플레이리스트 목록은 Spotify에서 오는데,
 * 그걸 빌드 타임에 물으면 배포가 남의 API 가용성에 묶인다. 실제로 cacheComponents
 * 아래에서는 빈 결과가 곧 빌드 실패라("all generateStaticParams functions must
 * return at least one result") 토큰이 만료되거나 API가 흔들리는 순간 배포가
 * 멈춘다.
 *
 * 대신 요청 시 렌더한다. 응답은 lib/spotify/api.ts의 "use cache" + cacheLife가
 * 이미 받아 두고 있고, PPR이라 껍데기는 미리 만들어 둔 채 트랙 목록만 채우므로
 * 첫 요청 한 번을 빼면 프리렌더와 차이가 없다.
 *
 * instant를 끄는 것도 그래서다. 프리렌더할 경로 목록이 없으니 이 라우트는
 * 요청 때 Spotify 응답을 기다렸다 그리는 블로킹 라우트가 된다 — cacheComponents는
 * 그걸 명시적으로 허용받게 한다.
 */
export const instant = false;

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/music/playlists/[id]">): Promise<
  Metadata | undefined
> => {
  const locale = await requireLocale(params);
  const { id } = await params;
  const playlist = await getPlaylistById(id);

  if (!playlist) return;

  return pageMetadata({
    locale,
    path: `/music/playlists/${id}`,
    title: playlist.name,
    description: getDictionary(locale).music.playlistTracks(playlist.name),
  });
};

const page = async ({
  params,
}: PageProps<"/[locale]/music/playlists/[id]">) => {
  const locale = await requireLocale(params);
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
            // Spotify가 이미 크기별로 준다. 최적화를 거치면 Vercel 이미지 사용량만 는다.
            unoptimized
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
            {getDictionary(locale).music.viewOnSpotify}
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
