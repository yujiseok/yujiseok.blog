import Track from "@/app/components/music/track";
import BlurContainer from "@/app/components/blurContainer";
import { getTopTracks } from "@/lib/spotify/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Tracks",
  description: "최근 한 달간 가장 많이 들은 음악",
};

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
