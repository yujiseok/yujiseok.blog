export const getBlurDataUrl = async (url: string) => {
  const res = await fetch(url, {
    cache: "force-cache",
  });
  const buffer = await res.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
};
