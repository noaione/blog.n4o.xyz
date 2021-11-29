import { Parent, visit } from 'unist-util-visit';

export default function RemarkCodeTitles() {
  function transformer(tree: Parent) {
    // @ts-ignore
    visit<Parent>(tree, 'code', (node, index) => {
      // @ts-ignore
      const nodeLang = (node.lang as string) || '';
      let language = '';
      let title = '';

      if (nodeLang.includes(':')) {
        language = nodeLang.slice(0, nodeLang.search(':'));
        title = nodeLang.slice(nodeLang.search(':') + 1, nodeLang.length);
      }

      if (!title) {
        return;
      }

      const className = 'remark-code-title';

      const titleNode = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: className }],
        children: [{ type: 'text', value: title }],
        data: { _xdmExplicitJsx: true },
      };

      tree.children.splice(index, 0, titleNode);
      // @ts-ignore
      node.lang = language;
    });
  }
  return transformer;
}
