import Image from "next/image";
import { name, avatar, intro, bottomIntro } from "lib/home";

export default function Home() {
  return (
    <section>
      <div className="my-4 flex items-center gap-8">
        <div className="flex h-[125px] w-[125px]">
          <Image
            src={avatar}
            width={125}
            height={125}
            alt={name}
            placeholder="blur"
            priority
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        {intro()}
      </div>
      {bottomIntro()}
    </section>
  );
}
