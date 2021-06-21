const URL_MAPPING = {
  blog: ['/posts', true],
  r: ['https://shigoto.n4o.xyz/r', false],
  release: ['https://shigoto.n4o.xyz/release', true],
}

export default async function OldRedirectionRewriting(req, res) {
  const {
    query: { page, base },
  } = req
  if (typeof base !== 'string') {
    return res.status(400).json({ message: 'Not a valid URL redirection' })
  }

  const basePath = URL_MAPPING[base]
  if (!Array.isArray(basePath)) {
    return res.status(400).json({ message: 'Not a valid URL redirection' })
  }
  const [pathExtra, noPageIsFine] = basePath
  if (!Array.isArray(page) && !noPageIsFine) {
    return res.status(400).json({ message: 'Not a valid URL redirection' })
  }
  if (page.length < 1 && !noPageIsFine) {
    res.status(400).json({ message: 'Not a valid URL redirection' })
  } else if (page.length < 1 && noPageIsFine) {
    res.redirect(pathExtra)
  } else {
    const joinPath = '/' + page.join('/')
    res.redirect(pathExtra + joinPath)
  }
}
