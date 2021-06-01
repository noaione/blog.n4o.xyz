async function fetchPagesViews() {
  const response = await fetch('https://tr.n4o.xyz/api/stats/blog.n4o.xyz/pages')
  if (response.status < 300) {
    return await response.json()
  }
  return []
}

export default async function ViewCountAPI(req, res) {
  const query = req.query || {}
  const apiRes = await fetchPagesViews()
  if (typeof query.slug === 'string') {
    const pageView = apiRes.findIndex((e) => e.name === query.slug)
    if (pageView === -1) {
      res.json({ hits: 0 })
    } else {
      res.json({ hits: apiRes[pageView].pageviews })
    }
  } else {
    let totalViews = 0
    apiRes.forEach((elem) => {
      totalViews += elem.pageviews
    })
    res.json({ hits: totalViews })
  }
}
