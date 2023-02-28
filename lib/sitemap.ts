import fs from "fs";

const getDate = new Date().toISOString();

export function createSiteMap() {
  const path = process.cwd();

  const allPosts = fs.readdirSync(`${path}/content`);
  const slugs = allPosts.map((post) => post.replace(".mdx", ""));

  const postUrls = slugs
    .map(
      (slug) => `<url>
        <loc>https://www.yujiseok.blog/post/${slug}</loc>
        <lastmod>${getDate}</lastmod>
      </url>`
    )
    .join("");

  const generatedSitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    >
      <url>
        <loc>https://www.yujiseok.blog/</loc>
      </url>
      <url>
        <loc>https://www.yujiseok.blog/about</loc>
      </url>
      <url>
        <loc>https://www.yujiseok.blog/post</loc>
      </url>
      ${postUrls}
    </urlset> `;

  fs.writeFileSync("public/sitemap.xml", generatedSitemap, "utf-8");
}

createSiteMap();
