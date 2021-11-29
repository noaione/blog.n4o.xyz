import { NextApiRequest, NextApiResponse } from 'next';

const URL_MAPPING = {
  blog: ['/posts', true],
  release: ['https://shigoto.n4o.xyz/release', true],
};

export default async function OldRedirectionRewriting(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { base },
  } = req;
  if (typeof base !== 'string') {
    return res.status(400).json({ message: 'Not a valid URL redirection' });
  }

  const basePath = URL_MAPPING[base];
  if (!Array.isArray(basePath)) {
    return res.status(400).json({ message: 'Not a valid URL redirection' });
  }
  const [pathExtra, noPageIsFine] = basePath;
  if (noPageIsFine) {
    res.redirect(pathExtra);
  } else {
    res.status(400).json({ message: 'Not a valid URL redirection' });
  }
}
