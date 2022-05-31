import type { Node } from 'unist';
import { Parent, visit } from 'unist-util-visit';
import sizeOf from 'image-size';
import fs from 'fs';

export default function ImageToJSX() {
  function transformer(tree: Node) {
    visit<Node>(
      tree,
      (node: Parent): node is Parent =>
        node.type === 'paragraph' && node.children.some((n) => n.type === 'image'),
      // @ts-ignore
      (node: Parent) => {
        const imageNode = node.children.find((n) => n.type === 'image');

        // @ts-ignore
        if (fs.existsSync(`${process.cwd()}/public${imageNode.url}`)) {
          // @ts-ignore
          const dimensions = sizeOf(`${process.cwd()}/public${imageNode.url}`);

          // Convert to next/image
          (imageNode.type = 'mdxJsxFlowElement'),
            // @ts-ignore
            (imageNode.name = 'Image'),
            // @ts-ignore
            (imageNode.attributes = [
              // @ts-ignore
              { type: 'mdxJsxAttribute', name: 'alt', value: imageNode.alt },
              // @ts-ignore
              { type: 'mdxJsxAttribute', name: 'caption', value: imageNode.alt },
              // @ts-ignore
              { type: 'mdxJsxAttribute', name: 'src', value: imageNode.url },
              // @ts-ignore
              { type: 'mdxJsxAttribute', name: 'width', value: dimensions.width },
              // @ts-ignore
              { type: 'mdxJsxAttribute', name: 'height', value: dimensions.height },
            ]);

          node.type = 'div';
          node.children = [imageNode];
        }
      }
    );
  }
  return transformer;
}
