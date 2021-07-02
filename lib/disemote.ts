/**
 * Based on remark-twemoji module
 * I dont use that because the need of jsx type :)
 */

import { Literal } from 'unist'
import { Node, visit } from 'unist-util-visit'
import EmojiSets from '@/components/shortcode/emote.json'

const EmojiRegExp = /:(\+1|[-\w]+):/g

export default function DisEmoteRemark() {
  function transformer(tree: Node) {
    visit<Literal>(tree, 'text', (node) => {
      const value = node.value as string
      const slices = []
      let start = 0
      let match: RegExpExecArray
      let position: number

      EmojiRegExp.lastIndex = 0
      match = EmojiRegExp.exec(value)
      while (match) {
        position = match.index

        const eIdx = EmojiSets.findIndex((e) => e.name === match[1])

        if (eIdx !== -1) {
          if (start !== position) {
            slices.push(value.slice(start, position))
          }
          const sel = EmojiSets[eIdx]

          const newNode = {
            type: 'mdxJsxFlowElement',
            name: 'img',
            attributes: [
              { type: 'mdxJsxAttribute', name: 'className', value: 'w-8 h-8 inline-block !my-2' },
              { type: 'mdxJsxAttribute', name: 'alt', value: `:${sel.name}:` },
              { type: 'mdxJsxAttribute', name: 'title', value: `:${sel.name}:` },
              { type: 'mdxJsxAttribute', name: 'src', value: sel.url },
            ],
          }
          slices.push(newNode)
          start = position + match[0].length
        } else {
          EmojiRegExp.lastIndex = position + 1
        }

        match = EmojiRegExp.exec(value)
      }

      if (slices.length > 0) {
        slices.push(value.slice(start))
        node.type = 'html'
        node.value = slices.join('')
      }
    })
  }
  return transformer
}
