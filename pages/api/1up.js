export default async function UpdateHits(req, res) {
  if (req.method.toLowerCase() !== 'post') {
    res.status(405).json({ success: false })
  } else {
    const bodyBag = await req.body
    console.info(bodyBag)
    res.json({ success: true })
  }
}
