# N4O Personal Blog

This blog is based on [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) by timlrx

## Features

- Easy styling customization with [Tailwind 2.0](https://blog.tailwindcss.com/tailwindcss-v2)
- Near perfect lighthouse score - [Lighthouse report](https://www.webpagetest.org/result/210111_DiC1_08f3670c3430bf4a9b76fc3b927716c5/)
- Lightweight, 43kB first load JS, uses Preact in production build
- Mobile-friendly view
- Light and dark theme
- [MDX - write JSX in markdown documents!](https://mdxjs.com/)
- Server-side syntax highlighting with [rehype-prism](https://github.com/mapbox/rehype-prism)
- Math display supported via [KaTeX](https://katex.org/)
- Automatic image optimization via [next/image](https://nextjs.org/docs/basic-features/image-optimization)
- Flexible data retrieval with [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- Support for tags - each unique tag will be its own page
- Projects page
- SEO friendly with RSS feed, sitemaps and more!

### Additional Features
This feature only available on this fork.

**Side note**:<br />
Not all of the added new feature is customizeable with config for now.

- Internationalization (i18n) ready
- Added Spotify integration (Now playing) to the Home page and Post area
- Added the featured images to everywhere possible
- Added new shortcodes
  - GitHub Code Embed
  - Gist Embed
  - Admonitions
  - GitHub-like Repository Card
  - Video embed support with VideoJS
  - A Discord Emote stuff (idk why)
  - Keystroke (A shortcut for multiple `<kbd>` input)
  - Custom Image with Zooming support (Medium-like)
- Route loading indicator
- Comment feature powered with GitHub Issues and Utteranc.es
- Upvote/Downvote button for posts (Disqus like)

**Removed/Disabled features**
- `Discuss on Twitter` button, changed to utterances

## Development

First, run the development server:

```bash
npm start
# or
npm run dev
```

Open [http://localhost:4500](http://localhost:4500) with your browser to see the result.
## Post

### Frontmatter

Frontmatter follows [Hugo's standards](https://gohugo.io/content-management/front-matter/).

Currently 7 fields are supported.

```
title (required)
date (required)
tags (required, can be empty array)
lastmod (optional)
draft (optional)
summary (optional)
images (optional, if none provided defaults to socialBanner in siteMetadata config)
```

Here's an example of a post's frontmatter:

```
---
title: 'Introducing Tailwind Nexjs Starter Blog'
date: '2021-01-12'
lastmod: '2021-01-18'
tags: ['next-js', 'tailwind', 'guide']
draft: false
summary: 'Looking for a performant, out of the box template, with all the best in web technology to support your blogging needs? Checkout the Tailwind Nextjs Starter Blog template.'
images: ['/static/images/canada/mountains.jpg', '/static/images/canada/toronto.jpg']
---
```

### Compose

`scripts/compose.js` can be used to easily generate a post with pre-filled front matter.

The first argument is the name of the post and the second optional argument is the extension (default to .mdx)

Example code to generate the post called "My First Post" in markdown format

```
node ./scripts/compose.js "My First Post" .md
```

This will generate `./data/blog/my-first-post.md` with pre-filled front matter.

## Deploy

**Vercel**  
The easiest way to deploy the template is to use the [Vercel Platform](https://vercel.com) from the creators of Next.js. Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
