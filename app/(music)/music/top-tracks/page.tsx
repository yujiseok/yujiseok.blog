import Track from "@/app/components/music/track";
import BlurContainer from "@/app/components/blurContainer";
import { getTopTracks } from "@/lib/spotify/api";

export const revalidate = 86_400;

const page = async () => {
  const topTracks = await getTopTracks();

  return (
    <BlurContainer className="gap-0">
      {topTracks.map((track) => (
        <Track key={track.trackName} track={track} />
      ))}
    </BlurContainer>
  );
};

export default page;
