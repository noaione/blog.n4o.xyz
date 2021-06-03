/**
 * Based on remark-twemoji module
 * I dont use that because the need of jsx type :)
 */

const visit = require('unist-util-visit')

const emojiSets = require('../components/shortcode/emote')

const EmojiRegExp = /:(\+1|[-\w]+):/g

module.exports = () => {
  function transformer(tree) {
    visit(tree, 'text', (node) => {
      const { value } = node
      const slices = []
      let start = 0
      let match
      let position
      EmojiRegExp.lastIndex = 0
      match = EmojiRegExp.exec(value)
      while (match) {
        position = match.index

        const eIdx = emojiSets.findIndex((e) => e.name === match[1])

        if (eIdx !== -1) {
          if (start !== position) {
            slices.push(value.slice(start, position))
          }
          const sel = emojiSets[eIdx]

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

      if (slices.length) {
        slices.push(value.slice(start))
        node.type = 'html'
        node.value = slices.join('')
      }
    })
  }

  return transformer
}
