import { BLUR_DATA_URL } from "@/lib/blurUrl";
import { cn } from "@/lib/cn";
import { getPlaylists } from "@/lib/spotify/api";
import { TypeSpotifyPlaylist } from "@/types/spotify";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
export const revalidate = 86_400;

const page = async () => {
  const playlists = await getPlaylists();

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      {playlists.map((playlist, i) => (
        <PlaylistCard key={playlist.id} playlist={playlist} index={i} />
      ))}
    </div>
  );
};

export default page;

const PlaylistCard = ({
  playlist,
  index,
}: {
  playlist: TypeSpotifyPlaylist;
  index: number;
}) => {
  return (
    <ViewTransition name={`playlist-${playlist.id}`}>
      <Link
        href={`/music/playlists/${playlist.id}`}
        className={cn(
          "fadeDown block size-full overflow-hidden rounded-lg",
          index % 2 === 0 ? "row-span-2" : "row-span-3",
        )}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <Image
          src={playlist.images[0].url}
          alt={playlist.name}
          width={playlist.images[0].width ?? 640}
          height={playlist.images[0].height ?? 640}
          className="pointer-events-none size-full object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      </Link>
    </ViewTransition>
  );
};
