/**
 * Based on remark-heading-id
 * With some better quirk
 */

const visit = require('unist-util-visit')

const kebabCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('-')

module.exports = () => {
  function transformer(tree) {
    visit(tree, 'heading', (node) => {
      let lastChild = node.children[node.children.length - 1]
      if (lastChild && lastChild.type === 'text') {
        let string = lastChild.value.replace(/ +$/, '')
        let matched = string.match(/ {#([^]+?)}$/)

        if (matched) {
          let id = matched[1]
          if (id.length > 0) {
            if (!node.data) {
              node.data = {}
            }
            if (!node.data.hProperties) {
              node.data.hProperties = {}
            }
            node.data.id = node.data.hProperties.id = kebabCase(id)

            string = string.substring(0, matched.index)
            lastChild.value = string
          }
        }
      }
    })
  }
  return transformer
}
