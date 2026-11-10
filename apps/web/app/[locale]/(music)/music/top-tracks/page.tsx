import Track from "@/app/[locale]/(music)/_components/track";
import BlurContainer from "@/app/_components/blur-container";
import { getTopTracks } from "@/lib/spotify/api";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireLocale, type LocaleParams } from "@/lib/i18n/params";

export const generateMetadata = async ({
  params,
}: LocaleParams): Promise<Metadata> => {
  const locale = await requireLocale(params);

  return pageMetadata({
    locale,
    path: "/music/top-tracks",
    title: "Top Tracks",
    description: getDictionary(locale).music.topTracksDescription,
  });
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
