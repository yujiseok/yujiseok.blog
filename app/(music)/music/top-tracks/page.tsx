import Track from "@/app/(music)/_components/track";
import BlurContainer from "@/app/_components/blur-container";
import { getTopTracks } from "@/lib/spotify/api";
import type { Metadata } from "next";
import { alternates, SITE_OG } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Top Tracks",
  description: "최근 한 달간 가장 많이 들은 음악",
  alternates: alternates("/music/top-tracks"),
  openGraph: {
    url: "/music/top-tracks",
    type: "website",
    ...SITE_OG,
  },
};

const page = async () => {
  const topTracks = await getTopTracks();

  return (
    <BlurContainer className="gap-0">
      {topTracks.map((track) => (
        <Track key={track.id} track={track} />
      ))}
    </BlurContainer>
  );
};

export default page;
