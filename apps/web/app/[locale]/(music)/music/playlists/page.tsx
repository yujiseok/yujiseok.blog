import { cn } from "@/lib/cn";
import { getPlaylists } from "@/lib/spotify/api";
import { TypeSpotifyPlaylist } from "@/types/spotify";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export const generateMetadata = async ({
  params,
}: LocaleParams): Promise<Metadata> => {
  const locale = await requireLocale(params);

  return pageMetadata({
    locale,
    path: "/music/playlists",
    title: "Playlists",
    description: getDictionary(locale).music.playlistsDescription,
  });
};

const page = async ({ params }: LocaleParams) => {
  const locale = await requireLocale(params);
  const playlists = await getPlaylists();

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      {playlists.map((playlist, i) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          index={i}
          locale={locale}
        />
      ))}
    </div>
  );
};

export default page;

const PlaylistCard = ({
  playlist,
  index,
  locale,
}: {
  playlist: TypeSpotifyPlaylist;
  index: number;
  locale: Locale;
}) => {
  const [cover] = playlist.images;

  return (
    <ViewTransition name={`playlist-${playlist.id}`}>
      <Link
        href={localizedPath(locale, `/music/playlists/${playlist.id}`)}
        className={cn(
          "fadeDown block size-full overflow-hidden rounded-lg",
          index % 2 === 0 ? "row-span-2" : "row-span-3",
        )}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {cover && (
          <Image
            src={cover.url}
            alt={playlist.name}
            width={cover.width ?? 640}
            height={cover.height ?? 640}
            className="pointer-events-none size-full object-cover"
          />
        )}
      </Link>
    </ViewTransition>
  );
};
