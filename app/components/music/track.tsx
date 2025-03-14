import { getBlurDataUrl } from "@/lib/blurUrl";
import { TypeRecentlyPlayedTrack, TypeTopTrack } from "@/types/spotify";
import Image from "next/image";

const Track = async ({
  track,
}: {
  track: TypeRecentlyPlayedTrack | TypeTopTrack;
}) => {
  const blurDataUrl = await getBlurDataUrl(track.albumCover.url);

  return (
    <a
      href={track.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 rounded-lg p-3 transition-colors duration-250 ease-out hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
    >
      <Image
        src={track.albumCover.url}
        alt={track.trackName}
        width={track.albumCover.width}
        height={track.albumCover.height}
        className="pointer-events-none aspect-square size-14 rounded-lg shadow-xs"
        placeholder="blur"
        blurDataURL={blurDataUrl}
      />
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
