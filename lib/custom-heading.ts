/**
 * Based on remark-heading-id
 * With some better quirk
 */

import { Node, Parent, visit } from 'unist-util-visit'
import { kebabCase } from './utils'

export default function CustomHeadingID() {
  function transformer(tree: Node) {
    visit<Parent>(tree, 'heading', (node) => {
      const lastChild = node.children[node.children.length - 1]
      if (lastChild && lastChild.type === 'text') {
        let evalText = lastChild.value as string
        evalText = evalText.replace(/ +$/, '')
        const matched = evalText.match(/ {#([^]+?)}$/)

        if (matched) {
          const id = matched[1]
          if (id.length > 0) {
            if (!node.data) {
              node.data = {}
            }
            if (!node.data.hProperties) {
              node.data.hProperties = {}
            }

            // @ts-ignore
            node.data.id = node.data.hProperties.id = kebabCase(id)

            evalText = evalText.substring(0, matched.index)
            lastChild.value = evalText
          }
        }
      }
    })
  }
  return transformer
}
