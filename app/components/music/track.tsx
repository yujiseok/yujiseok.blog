import { TypeRecentlyPlayedTrack, TypeTopTrack } from "@/types/spotify";
import Image from "next/image";

const Track = ({
  track,
}: {
  track: TypeRecentlyPlayedTrack | TypeTopTrack;
}) => {
  return (
    <a
      href={track.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 rounded-lg p-3 transition-colors duration-50 hover:bg-black/5 dark:hover:bg-neutral-200/10"
    >
      {track.albumCover && (
        <Image
          src={track.albumCover.url}
          alt={track.trackName}
          width={track.albumCover.width}
          height={track.albumCover.height}
          className="pointer-events-none aspect-square size-14 rounded-lg border border-neutral-200 shadow-xs dark:border-neutral-800"
        />
      )}
      <div className="flex flex-col">
        <h2>{track.trackName}</h2>
        <small className="text-sm text-neutral-600 dark:text-neutral-400">
          {track.artistName}
        </small>
      </div>
    </a>
  );
};

export default Track;
