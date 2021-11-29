interface DatasetLineNumber {
  dataset?: {
    lineNumber?: string;
  };
}

type ExtendedNodeLine = Node & DatasetLineNumber;

export interface IHLJSOptions {
  singleLine?: boolean;
  startFrom?: number;
}

export default class LineNumbers {
  d: Document;
  TABLE_NAME: 'hljs-ln';
  LINE_NAME: 'hljs-ln-line';
  CODE_BLOCK_NAME: 'hljs-ln-code';
  NUMBERS_BLOCK_NAME: 'hljs-ln-numbers';
  NUMBER_LINE_NAME: 'hljs-ln-n';
  DATA_ATTR_NAME: 'data-line-number';
  BREAK_LINE_REGEXP: RegExp;

  constructor(d: Document) {
    this.d = d;
    (this.TABLE_NAME = 'hljs-ln'),
      (this.LINE_NAME = 'hljs-ln-line'),
      (this.CODE_BLOCK_NAME = 'hljs-ln-code'),
      (this.NUMBERS_BLOCK_NAME = 'hljs-ln-numbers'),
      (this.NUMBER_LINE_NAME = 'hljs-ln-n'),
      (this.DATA_ATTR_NAME = 'data-line-number'),
      (this.BREAK_LINE_REGEXP = /\r\n|\r|\n/g);
    this.addStyles();
  }

  addStyles() {
    console.log('lineNumbers: Injecting styles...');
    const css = this.d.createElement('style');
    css.innerHTML = this.format(
      '.{0}{border-collapse:collapse}' + '.{0} td{padding:0}' + '.{1}:before{content:attr({2})}',
      [this.TABLE_NAME, this.NUMBER_LINE_NAME, this.DATA_ATTR_NAME]
    );
    this.d.getElementsByTagName('head')[0].appendChild(css);
  }

  isHljsLnCodeDescendant(domElt: Node) {
    let curElt = domElt;
    while (curElt) {
      // @ts-ignore
      if (curElt.className && curElt.className.indexOf('hljs-ln-code') !== -1) {
        return true;
      }
      curElt = curElt.parentNode;
    }
    return false;
  }

  getHljsLnTable(hljsLnDomElt: HTMLElement) {
    let curElt = hljsLnDomElt;
    while (curElt.nodeName !== 'TABLE') {
      // @ts-ignore
      curElt = curElt.parentNode;
    }
    return curElt;
  }

  // Function to workaround a copy issue with Microsoft Edge.
  // Due to hljs-ln wrapping the lines of code inside a <table> element,
  // itself wrapped inside a <pre> element, window.getSelection().toString()
  // does not contain any line breaks. So we need to get them back using the
  // rendered code in the DOM as reference.
  edgeGetSelectedCodeLines(selection: Selection) {
    // current selected text without line breaks
    const selectionText = selection.toString();

    // get the <td> element wrapping the first line of selected code
    let tdAnchor = selection.anchorNode as ExtendedNodeLine;
    while (tdAnchor.nodeName !== 'TD') {
      tdAnchor = tdAnchor.parentNode as ExtendedNodeLine;
    }

    // get the <td> element wrapping the last line of selected code
    let tdFocus = selection.focusNode as ExtendedNodeLine;
    while (tdFocus.nodeName !== 'TD') {
      tdFocus = tdFocus.parentNode as ExtendedNodeLine;
    }

    // extract line numbers
    let firstLineNumber = parseInt(tdAnchor.dataset.lineNumber);
    let lastLineNumber = parseInt(tdFocus.dataset.lineNumber);

    // multi-lines copied case
    if (firstLineNumber != lastLineNumber) {
      let firstLineText = tdAnchor.textContent;
      let lastLineText = tdFocus.textContent;

      // if the selection was made backward, swap values
      if (firstLineNumber > lastLineNumber) {
        let tmp = firstLineNumber;
        firstLineNumber = lastLineNumber;
        lastLineNumber = tmp;
        tmp = parseInt(firstLineText);
        firstLineText = lastLineText;
        lastLineText = tmp.toString();
      }

      // discard not copied characters in first line
      while (selectionText.indexOf(firstLineText) !== 0) {
        firstLineText = firstLineText.slice(1);
      }

      // discard not copied characters in last line
      while (selectionText.lastIndexOf(lastLineText) === -1) {
        lastLineText = lastLineText.slice(0, -1);
      }

      // reconstruct and return the real copied text
      let selectedText = firstLineText;
      const hljsLnTable = this.getHljsLnTable(tdAnchor as HTMLElement);
      for (let i = firstLineNumber + 1; i < lastLineNumber; ++i) {
        const codeLineSel = this.format('.{0}[{1}="{2}"]', [
          this.CODE_BLOCK_NAME,
          this.DATA_ATTR_NAME,
          i,
        ]);
        const codeLineElt = hljsLnTable.querySelector(codeLineSel);
        selectedText += '\n' + codeLineElt.textContent;
      }
      selectedText += '\n' + lastLineText;
      return selectedText;
      // single copied line case
    } else {
      return selectionText;
    }
  }

  initLineNumbersOnLoad(options) {
    if (this.d.readyState === 'interactive' || this.d.readyState === 'complete') {
      this.documentReady(options);
    } else {
      // TODO: Replace on useEffect
      // w.addEventListener('DOMContentLoaded', function () {
      //   documentReady(options)
      // })
    }
  }

  documentReady(options: IHLJSOptions) {
    try {
      console.info('lineNumbers: Injecting line numbering');
      const blocks = this.d.querySelectorAll('code.hljs,code.nohighlight');
      console.info(`lineNumbers: found ${blocks.length} document`);

      for (const i in blocks) {
        // eslint-disable-next-line no-prototype-builtins
        if (blocks.hasOwnProperty(i)) {
          if (!this.isPluginDisabledForBlock(blocks[i] as HTMLElement)) {
            this.lineNumbersBlock(blocks[i] as HTMLElement, options);
          }
        }
      }
    } catch (e) {
      console.error('LineNumbers error: ', e);
    }
  }

  isPluginDisabledForBlock(element: HTMLElement) {
    return element.classList.contains('nohljsln');
  }

  lineNumbersBlock(element: HTMLElement, options: IHLJSOptions) {
    if (typeof element !== 'object') return;

    this.async(() => {
      element.innerHTML = this.lineNumbersInternal(element, options);
    });
  }

  lineNumbersValue(value: string, options: IHLJSOptions) {
    if (typeof value !== 'string') return;

    const element = document.createElement('code');
    element.innerHTML = value;

    return this.lineNumbersInternal(element, options);
  }

  lineNumbersInternal(element: HTMLElement, options: IHLJSOptions) {
    const internalOptions = this.mapOptions(element, options);

    this.duplicateMultilineNodes(element);

    return this.addLineNumbersBlockFor(element.innerHTML, internalOptions);
  }

  addLineNumbersBlockFor(inputHtml: string, options: IHLJSOptions) {
    const lines = this.getLines(inputHtml);

    // if last line contains only carriage return remove it
    if (lines[lines.length - 1].trim() === '') {
      lines.pop();
    }

    if (lines.length > 1 || options.singleLine) {
      let html = '';

      for (let i = 0, l = lines.length; i < l; i++) {
        html += this.format(
          '<tr>' +
            '<td class="{0} {1}" {3}="{5}">' +
            '<div class="{2}" {3}="{5}"></div>' +
            '</td>' +
            '<td class="{0} {4}" {3}="{5}">' +
            '{6}' +
            '</td>' +
            '</tr>',
          [
            this.LINE_NAME,
            this.NUMBERS_BLOCK_NAME,
            this.NUMBER_LINE_NAME,
            this.DATA_ATTR_NAME,
            this.CODE_BLOCK_NAME,
            i + options.startFrom,
            lines[i].length > 0 ? lines[i] : ' ',
          ]
        );
      }

      return this.format('<table class="{0}">{1}</table>', [this.TABLE_NAME, html]);
    }

    return inputHtml;
  }

  /**
   * @param {HTMLElement} element Code block.
   * @param {Object} options External API options.
   * @returns {Object} Internal API options.
   */
  mapOptions(element: HTMLElement, options: IHLJSOptions): IHLJSOptions {
    options = options || {};
    return {
      singleLine: this.getSingleLineOption(options),
      startFrom: this.getStartFromOption(element, options),
    };
  }

  getSingleLineOption(options: IHLJSOptions): boolean {
    const defaultValue = false;
    if (options.singleLine) {
      return options.singleLine;
    }
    return defaultValue;
  }

  getStartFromOption(element: HTMLElement, options: IHLJSOptions): number {
    const defaultValue = 1;
    let startFrom = defaultValue;

    if (isFinite(options.startFrom)) {
      startFrom = options.startFrom;
    }

    // can be overridden because local option is priority
    const value = this.getAttribute(element, 'data-ln-start-from');
    if (value !== null) {
      startFrom = this.toNumber(value, defaultValue);
    }

    return startFrom;
  }

  /**
   * Recursive method for fix multi-line elements implementation in highlight.js
   * Doing deep passage on child nodes.
   * @param {HTMLElement} element
   */
  duplicateMultilineNodes(element: HTMLElement) {
    const nodes = element.childNodes;
    for (const node in nodes) {
      // eslint-disable-next-line no-prototype-builtins
      if (nodes.hasOwnProperty(node)) {
        const child = nodes[node];
        if (this.getLinesCount(child.textContent) > 0) {
          if (child.childNodes.length > 0) {
            this.duplicateMultilineNodes(child as HTMLElement);
          } else {
            this.duplicateMultilineNode(child.parentNode as HTMLElement);
          }
        }
      }
    }
  }

  /**
   * Method for fix multi-line elements implementation in highlight.js
   * @param {HTMLElement} element
   */
  duplicateMultilineNode(element: HTMLElement) {
    const className = element.className;

    if (!/hljs-/.test(className)) return;

    const lines = this.getLines(element.innerHTML);
    let result = '';

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i].length > 0 ? lines[i] : ' ';
      result += this.format('<span class="{0}">{1}</span>\n', [className, lineText]);
    }

    element.innerHTML = result.trim();
  }

  getLines(text: string) {
    if (text.length === 0) return [];
    return text.split(this.BREAK_LINE_REGEXP);
  }

  getLinesCount(text: string) {
    return (text.trim().match(this.BREAK_LINE_REGEXP) || []).length;
  }

  ///
  /// HELPERS
  ///

  async<T = () => void>(func: T) {
    // @ts-ignore
    setTimeout(func, 0);
  }

  /**
   * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
   * @param {string} format
   * @param {array} args
   */
  format(format: string, args: unknown[]) {
    return format.replace(/\{(\d+)\}/g, (m, n) => {
      const sel = args[n];
      if (typeof sel === 'string') {
        return sel;
      } else if (typeof sel === 'number') {
        return sel.toString();
      } else if (typeof sel === 'object') {
        return sel.toString();
      } else if (typeof sel === 'boolean') {
        return sel ? 'true' : 'false';
      } else if (typeof sel === 'function') {
        try {
          return sel(m);
        } catch {
          return m;
        }
      }
      return m;
    });
  }

  /**
   * @param {HTMLElement} element Code block.
   * @param {String} attrName Attribute name.
   * @returns {String} Attribute value or empty.
   */
  getAttribute(element: HTMLElement, attrName: string) {
    return element.hasAttribute(attrName) ? element.getAttribute(attrName) : null;
  }

  /**
   * @param {String} str Source string.
   * @param {Number} fallback Fallback value.
   * @returns Parsed number or fallback value.
   */
  toNumber(str: string, fallback: number) {
    if (!str) return fallback;
    const number = Number(str);
    return isFinite(number) ? number : fallback;
  }
}
