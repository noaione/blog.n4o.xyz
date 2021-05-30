export default class LineNumbers {
  constructor(d) {
    this.d = d
    ;(this.TABLE_NAME = 'hljs-ln'),
      (this.LINE_NAME = 'hljs-ln-line'),
      (this.CODE_BLOCK_NAME = 'hljs-ln-code'),
      (this.NUMBERS_BLOCK_NAME = 'hljs-ln-numbers'),
      (this.NUMBER_LINE_NAME = 'hljs-ln-n'),
      (this.DATA_ATTR_NAME = 'data-line-number'),
      (this.BREAK_LINE_REGEXP = /\r\n|\r|\n/g)
    this.addStyles()
  }

  addStyles() {
    console.log('lineNumbers: Injecting styles...')
    let css = this.d.createElement('style')
    css.type = 'text/css'
    css.innerHTML = this.format(
      '.{0}{border-collapse:collapse}' + '.{0} td{padding:0}' + '.{1}:before{content:attr({2})}',
      [this.TABLE_NAME, this.NUMBER_LINE_NAME, this.DATA_ATTR_NAME]
    )
    this.d.getElementsByTagName('head')[0].appendChild(css)
  }

  isHljsLnCodeDescendant(domElt) {
    let curElt = domElt
    while (curElt) {
      if (curElt.className && curElt.className.indexOf('hljs-ln-code') !== -1) {
        return true
      }
      curElt = curElt.parentNode
    }
    return false
  }

  getHljsLnTable(hljsLnDomElt) {
    let curElt = hljsLnDomElt
    while (curElt.nodeName !== 'TABLE') {
      curElt = curElt.parentNode
    }
    return curElt
  }

  // Function to workaround a copy issue with Microsoft Edge.
  // Due to hljs-ln wrapping the lines of code inside a <table> element,
  // itself wrapped inside a <pre> element, window.getSelection().toString()
  // does not contain any line breaks. So we need to get them back using the
  // rendered code in the DOM as reference.
  edgeGetSelectedCodeLines(selection) {
    // current selected text without line breaks
    let selectionText = selection.toString()

    // get the <td> element wrapping the first line of selected code
    let tdAnchor = selection.anchorNode
    while (tdAnchor.nodeName !== 'TD') {
      tdAnchor = tdAnchor.parentNode
    }

    // get the <td> element wrapping the last line of selected code
    let tdFocus = selection.focusNode
    while (tdFocus.nodeName !== 'TD') {
      tdFocus = tdFocus.parentNode
    }

    // extract line numbers
    let firstLineNumber = parseInt(tdAnchor.dataset.lineNumber)
    let lastLineNumber = parseInt(tdFocus.dataset.lineNumber)

    // multi-lines copied case
    if (firstLineNumber != lastLineNumber) {
      let firstLineText = tdAnchor.textContent
      let lastLineText = tdFocus.textContent

      // if the selection was made backward, swap values
      if (firstLineNumber > lastLineNumber) {
        let tmp = firstLineNumber
        firstLineNumber = lastLineNumber
        lastLineNumber = tmp
        tmp = firstLineText
        firstLineText = lastLineText
        lastLineText = tmp
      }

      // discard not copied characters in first line
      while (selectionText.indexOf(firstLineText) !== 0) {
        firstLineText = firstLineText.slice(1)
      }

      // discard not copied characters in last line
      while (selectionText.lastIndexOf(lastLineText) === -1) {
        lastLineText = lastLineText.slice(0, -1)
      }

      // reconstruct and return the real copied text
      let selectedText = firstLineText
      let hljsLnTable = this.getHljsLnTable(tdAnchor)
      for (var i = firstLineNumber + 1; i < lastLineNumber; ++i) {
        let codeLineSel = this.format('.{0}[{1}="{2}"]', [
          this.CODE_BLOCK_NAME,
          this.DATA_ATTR_NAME,
          i,
        ])
        let codeLineElt = hljsLnTable.querySelector(codeLineSel)
        selectedText += '\n' + codeLineElt.textContent
      }
      selectedText += '\n' + lastLineText
      return selectedText
      // single copied line case
    } else {
      return selectionText
    }
  }

  initLineNumbersOnLoad(options) {
    if (this.d.readyState === 'interactive' || this.d.readyState === 'complete') {
      this.documentReady(options)
    } else {
      // TODO: Replace on useEffect
      // w.addEventListener('DOMContentLoaded', function () {
      //   documentReady(options)
      // })
    }
  }

  documentReady(options) {
    try {
      console.info('lineNumbers: Injecting line numbering')
      let blocks = this.d.querySelectorAll('code.hljs,code.nohighlight')
      console.info(`lineNumbers: found ${blocks.length} document`)

      for (let i in blocks) {
        // eslint-disable-next-line no-prototype-builtins
        if (blocks.hasOwnProperty(i)) {
          if (!this.isPluginDisabledForBlock(blocks[i])) {
            this.lineNumbersBlock(blocks[i], options)
          }
        }
      }
    } catch (e) {
      console.error('LineNumbers error: ', e)
    }
  }

  isPluginDisabledForBlock(element) {
    return element.classList.contains('nohljsln')
  }

  lineNumbersBlock(element, options) {
    if (typeof element !== 'object') return

    this.async(() => {
      element.innerHTML = this.lineNumbersInternal(element, options)
    })
  }

  lineNumbersValue(value, options) {
    if (typeof value !== 'string') return

    let element = document.createElement('code')
    element.innerHTML = value

    return this.lineNumbersInternal(element, options)
  }

  lineNumbersInternal(element, options) {
    let internalOptions = this.mapOptions(element, options)

    this.duplicateMultilineNodes(element)

    return this.addLineNumbersBlockFor(element.innerHTML, internalOptions)
  }

  addLineNumbersBlockFor(inputHtml, options) {
    let lines = this.getLines(inputHtml)

    // if last line contains only carriage return remove it
    if (lines[lines.length - 1].trim() === '') {
      lines.pop()
    }

    if (lines.length > 1 || options.singleLine) {
      let html = ''

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
        )
      }

      return this.format('<table class="{0}">{1}</table>', [this.TABLE_NAME, html])
    }

    return inputHtml
  }

  /**
   * @param {HTMLElement} element Code block.
   * @param {Object} options External API options.
   * @returns {Object} Internal API options.
   */
  mapOptions(element, options) {
    options = options || {}
    return {
      singleLine: this.getSingleLineOption(options),
      startFrom: this.getStartFromOption(element, options),
    }
  }

  getSingleLineOption(options) {
    let defaultValue = false
    if (options.singleLine) {
      return options.singleLine
    }
    return defaultValue
  }

  getStartFromOption(element, options) {
    let defaultValue = 1
    let startFrom = defaultValue

    if (isFinite(options.startFrom)) {
      startFrom = options.startFrom
    }

    // can be overridden because local option is priority
    let value = this.getAttribute(element, 'data-ln-start-from')
    if (value !== null) {
      startFrom = this.toNumber(value, defaultValue)
    }

    return startFrom
  }

  /**
   * Recursive method for fix multi-line elements implementation in highlight.js
   * Doing deep passage on child nodes.
   * @param {HTMLElement} element
   */
  duplicateMultilineNodes(element) {
    let nodes = element.childNodes
    for (let node in nodes) {
      // eslint-disable-next-line no-prototype-builtins
      if (nodes.hasOwnProperty(node)) {
        let child = nodes[node]
        if (this.getLinesCount(child.textContent) > 0) {
          if (child.childNodes.length > 0) {
            this.duplicateMultilineNodes(child)
          } else {
            this.duplicateMultilineNode(child.parentNode)
          }
        }
      }
    }
  }

  /**
   * Method for fix multi-line elements implementation in highlight.js
   * @param {HTMLElement} element
   */
  duplicateMultilineNode(element) {
    let className = element.className

    if (!/hljs-/.test(className)) return

    let lines = this.getLines(element.innerHTML)
    let result = ''

    for (let i = 0; i < lines.length; i++) {
      let lineText = lines[i].length > 0 ? lines[i] : ' '
      result += this.format('<span class="{0}">{1}</span>\n', [className, lineText])
    }

    element.innerHTML = result.trim()
  }

  getLines(text) {
    if (text.length === 0) return []
    return text.split(this.BREAK_LINE_REGEXP)
  }

  getLinesCount(text) {
    return (text.trim().match(this.BREAK_LINE_REGEXP) || []).length
  }

  ///
  /// HELPERS
  ///

  async(func) {
    setTimeout(func, 0)
  }

  /**
   * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
   * @param {string} format
   * @param {array} args
   */
  format(format, args) {
    return format.replace(/\{(\d+)\}/g, function (m, n) {
      return args[n] !== undefined ? args[n] : m
    })
  }

  /**
   * @param {HTMLElement} element Code block.
   * @param {String} attrName Attribute name.
   * @returns {String} Attribute value or empty.
   */
  getAttribute(element, attrName) {
    return element.hasAttribute(attrName) ? element.getAttribute(attrName) : null
  }

  /**
   * @param {String} str Source string.
   * @param {Number} fallback Fallback value.
   * @returns Parsed number or fallback value.
   */
  toNumber(str, fallback) {
    if (!str) return fallback
    var number = Number(str)
    return isFinite(number) ? number : fallback
  }
}
