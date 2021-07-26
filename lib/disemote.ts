/**
 * Based on remark-twemoji module
 * I dont use that because the need of jsx type :)
 */

import { Literal } from 'unist'
import { Node, visit } from 'unist-util-visit'
import EmojiSets from '@/components/shortcode/emote.json'

const EmojiRegExp = /:(\+1|[-\w]+):/g

export function LegacyDisEmote() {
  function transformer(tree: Node) {
    visit<Literal>(tree, 'text', (node) => {
      const value = node.value as string
      const slices = []
      let start = 0
      let match: RegExpExecArray
      let position: number
      EmojiRegExp.lastIndex = 0
      match = EmojiRegExp.exec(value as string)

      while (match) {
        position = match.index
        const eIdx = EmojiSets.findIndex((e) => e.name === match[1])
        if (eIdx !== -1) {
          if (start !== position) {
            slices.push(value.slice(start, position))
          }
          const sel = EmojiSets[eIdx]

          const newNode = {
            type: 'html',
            value: `<img
              class="w-8 h-8 inline-block !my-2"
              alt=":${sel.name}:"
              title=":${sel.name}:"
              src="${sel.url}"
            />`,
          }
          slices.push(newNode.value)
          start = position + match[0].length
        } else {
          EmojiRegExp.lastIndex = position + 1
        }

        match = EmojiRegExp.exec(value)
      }

      if (slices.length > 0) {
        slices.push(value.slice(start))
        node.value = slices.join('')
        node.type = 'html'
      }
    })
  }

  return transformer
}

export default function DisEmoteRemark() {
  function transformer(tree: Node) {
    visit<Literal>(tree, 'text', (node, index, parent) => {
      const value = node.value as string
      const emoteSlices = []
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
            emoteSlices.push({ type: 'text', value: value.slice(start, position) })
          }
          const sel = EmojiSets[eIdx]
          const shouldInline = match[0].length !== match.input.length

          const newNode = {
            type: 'mdxJsxFlowElement',
            name: 'DEmote',
            attributes: [{ type: 'mdxJsxAttribute', name: 'inline', value: shouldInline }],
            children: [{ type: 'text', value: sel.name }],
          }
          emoteSlices.push(newNode)
          start = position + match[0].length
        } else {
          EmojiRegExp.lastIndex = position + 1
        }

        match = EmojiRegExp.exec(value)
      }

      if (emoteSlices.length > 0) {
        emoteSlices.push({ type: 'text', value: value.slice(start) })
        parent.children = emoteSlices
      }
    })
  }
  return transformer
}
