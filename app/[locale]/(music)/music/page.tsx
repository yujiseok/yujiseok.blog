import BlurContainer from "@/app/_components/blur-container";
import Track from "@/app/[locale]/(music)/_components/track";
import { getRecentlyPlayed } from "@/lib/spotify/api";
import type { Metadata } from "next";
import { alternates, siteOg } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";

export const generateMetadata = async ({
  params,
}: LocaleParams): Promise<Metadata> => {
  const locale = await requireLocale(params);
  const alt = alternates(locale, "/music");

  return {
    title: "Recently Played",
    description: getDictionary(locale).music.recentDescription,
    alternates: alt,
    openGraph: { url: alt.canonical, type: "website", ...siteOg(locale) },
  };
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
