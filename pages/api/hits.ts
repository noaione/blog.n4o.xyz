import { isNone } from '@/lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';

interface PageViewResponse {
  results?: {
    visitors?: {
      value?: number;
    };
  };
}

const { PLAUSIBLE_BASE_URL, PLAUSIBLE_SITE_ID, PLAUSIBLE_TOKEN } = process.env;

async function fetchPagesViews(pages?: string): Promise<PageViewResponse | undefined> {
  const url = `${PLAUSIBLE_BASE_URL}/api/v1/stats/aggregate`;
  const urlWithParam = new URL(url);
  urlWithParam.searchParams.append('site_id', PLAUSIBLE_SITE_ID);
  if (!isNone(pages)) {
    let decodedUrl = decodeURIComponent(pages);
    if (!decodedUrl.startsWith('/')) {
      decodedUrl = '/' + decodedUrl;
    }
    urlWithParam.searchParams.append('filters', `event:page==${decodedUrl}`);
  }
  const response = await fetch(urlWithParam.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${PLAUSIBLE_TOKEN}`,
    },
  });
  if (response.status < 300) {
    return await response.json();
  }
  return undefined;
}

function pickFirstOne(data?: string | string[]): string | null {
  if (isNone(data)) {
    return null;
  }
  if (Array.isArray(data)) {
    return data[0];
  }
  return data;
}

export default async function ViewCountAPI(req: NextApiRequest, res: NextApiResponse) {
  if (isNone(PLAUSIBLE_BASE_URL) || isNone(PLAUSIBLE_SITE_ID) || isNone(PLAUSIBLE_TOKEN)) {
    res.status(500).json({ hits: 0 });
  }
  const query = req.query || {};
  const apiRes = await fetchPagesViews(pickFirstOne(query.slug));
  if (isNone(apiRes)) {
    res.json({ hits: 0 });
  } else {
    res.json({ hits: apiRes?.results?.visitors?.value || 0 });
  }
}
