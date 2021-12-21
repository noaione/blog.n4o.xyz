import { NextApiRequest, NextApiResponse } from 'next';

interface PageViewResponse {
  count: number;
  name: string;
  pageviews: number;
}

async function fetchPagesViews(): Promise<PageViewResponse[]> {
  const response = await fetch('https://tr.n4o.xyz/api/stats/blog.n4o.xyz/pages');
  if (response.status < 300) {
    return await response.json();
  }
  return [];
}

export default async function ViewCountAPI(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query || {};
  const apiRes = await fetchPagesViews();
  if (typeof query?.slug === 'string') {
    const pageView = apiRes.findIndex((e) => e.name === query.slug);
    if (pageView === -1) {
      res.json({ hits: 0 });
    } else {
      const views = apiRes[pageView].count ?? apiRes[pageView].pageviews;
      res.json({ hits: views });
    }
  } else {
    let totalViews = 0;
    apiRes.forEach((e) => {
      totalViews += e.count ?? e.pageviews;
    });
    res.json({ hits: totalViews });
  }
}
