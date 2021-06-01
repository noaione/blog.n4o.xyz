import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

import { getFiles } from './mdx'
import { kebabCase } from './utils'

const root = process.cwd()

export async function getAllTags(
  type,
  selectedLocale = 'en',
  locales = ['en', 'id'],
  defaultLocale = 'en'
) {
  const files = await getFiles(type, '*', locales, defaultLocale)

  let tagCount = {}
  // Iterate through each post, putting all found tags into `tags`
  files.forEach((file) => {
    const source = fs.readFileSync(path.join(root, file.file), 'utf8')
    const { data } = matter(source)
    // Check if there's locale property or no
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('locale')) {
      data.locale = file.locale
    }
    if (typeof selectedLocale === 'string' && selectedLocale !== data.locale) {
      return
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('date')) {
      data.date = file.rawDate
    }
    if (data.tags && data.draft !== true) {
      data.tags.forEach((tag) => {
        const formattedTag = kebabCase(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag]['count'] += 1
        } else {
          tagCount[formattedTag] = { count: 1, locale: data.locale }
        }
      })
    }
  })

  return tagCount
}
