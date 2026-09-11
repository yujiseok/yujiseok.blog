import BlurContainer from "@/app/_components/blur-container";
import Track from "@/app/(music)/_components/track";
import { getRecentlyPlayed } from "@/lib/spotify/api";
import type { Metadata } from "next";
import { alternates, SITE_OG } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Recently Played",
  description: "최근에 들은 음악 목록",
  alternates: alternates("/music"),
  openGraph: {
    url: "/music",
    type: "website",
    ...SITE_OG,
  },
};

const page = async () => {
  const recentlyPlayedTracks = await getRecentlyPlayed();

  return (
    <BlurContainer className="gap-0">
      {recentlyPlayedTracks.map((track) => (
        // 같은 곡을 여러 번 들으면 id가 겹치므로 재생 시각까지 묶는다.
        <Track
          key={`${track.id}-${track.playedAt?.toISOString()}`}
          track={track}
        />
      ))}
    </BlurContainer>
  );
};

export default page;
