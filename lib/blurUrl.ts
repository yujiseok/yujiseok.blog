export const getBlurDataUrl = async (url: string) => {
  const res = await fetch(url, {
    cache: "no-store",
  });
  const buffer = await res.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
};
