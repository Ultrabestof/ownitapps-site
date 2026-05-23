import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@data/site';

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.datePublished,
      link: `/blog/${post.slug}`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
