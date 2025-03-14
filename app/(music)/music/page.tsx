import BlurContainer from "@/app/components/blurContainer";
import Track from "@/app/components/music/track";
import { getRecentlyPlayed } from "@/lib/spotify/api";

export const revalidate = 180;

const page = async () => {
  const recentlyPlayedTracks = await getRecentlyPlayed();

  return (
    <BlurContainer className="gap-0">
      {recentlyPlayedTracks.map((track) => (
        <Track key={track.playedAt.toString()} track={track} />
      ))}
    </BlurContainer>
  );
};

export default page;
