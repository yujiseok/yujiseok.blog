import BlurContainer from "@/app/components/blurContainer";
import Track from "@/app/components/music/track";
import { getRecentlyPlayed } from "@/lib/spotify/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recently Played",
  description: "최근에 들은 음악 목록",
};

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
