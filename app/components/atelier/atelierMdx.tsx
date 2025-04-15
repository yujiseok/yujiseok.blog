import { MDXRemote } from "next-mdx-remote/rsc";
import Typewriter from "./typewriter";
import ShowCase from "./showCase";
import Meteor from "./meteor";

const atelierComponents = {
  ShowCase,
  Typewriter,
  Meteor,
};

const AtelierMdx = ({ source }: any) => {
  return (
    <article className="prose dark:prose-invert prose-h1:text-2xl prose-a:break-all max-w-3xl break-keep">
      <MDXRemote source={source} components={atelierComponents} />
    </article>
  );
};

export default AtelierMdx;
