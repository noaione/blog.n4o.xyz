/**
 * Based on remark-twemoji module
 * I dont use that because the need of jsx type :)
 * This is modified to use the shortcode version
 */

import { Literal } from 'unist'
import { Node, visit } from 'unist-util-visit'

// https://reactnativecafe.com/emojis-in-javascript/#Conclusion
const EmojiRegExp = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g

export default function TwemojiEmoteRemark() {
  function transformer(tree: Node) {
    visit<Literal>(tree, 'text', (node, index, parent) => {
      // based on disemote.ts
      const value = node.value as string
      const emoteSlices = []
      let start = 0
      let match: RegExpExecArray
      let position: number

      EmojiRegExp.lastIndex = 0
      match = EmojiRegExp.exec(value)
      while (match) {
        position = match.index

        if (typeof match[0] === 'string') {
          if (start !== position) {
            emoteSlices.push({ type: 'text', value: value.slice(start, position) })
          }
          const shouldInline = match[0].length !== match.input.length

          const newNode = {
            type: 'mdxJsxFlowElement',
            name: 'Twemoji',
            attributes: [{ type: 'mdxJsxAttribute', name: 'inline', value: shouldInline }],
            children: [{ type: 'text', value: match[0] }],
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
