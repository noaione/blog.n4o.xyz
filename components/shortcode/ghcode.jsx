import { renderMarkdown } from '@/lib/mdx'
import Head from 'next/head'
import React from 'react'

import remark from 'remark'
import markdown from 'remark-parse'
import html from 'remark-html'
import highlight from 'remark-highlight.js'
import LineNumbers from '@/lib/hljs-numbers'

async function getCode(user, repo, branch, path) {
  const rawFile = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`
  const resp = await fetch(rawFile)
  return [resp.ok, resp.ok ? await resp.text() : `${resp.status} - ${resp.statusText}`]
}

function isNullUndef(data) {
  if (typeof data === 'undefined' || data === null) {
    return true
  }
  return false
}

async function renderCodeContents(codeContents) {
  const result = await remark().use(markdown).use(highlight).use(html).process(codeContents)
  return result.toString()
}

class GHCodeEmbed extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rendered: undefined,
      finalUrl: this.props.fileUrl,
    }
  }

  async componentDidMount() {
    let { startLine, endLine, codeContents, fileUrl } = this.props
    const codeTextSplit = codeContents.split('\n')
    let endLineText = ''
    if (endLine === -1) {
      endLine = codeTextSplit.length
    } else {
      endLineText = `-L${endLine}`
    }
    if (startLine === endLine) {
      endLineText = ''
    }
    // If the start line is bigger than the total file line, only print out the last line
    if (startLine > codeTextSplit.length) {
      startLine = endLine = codeTextSplit.length
      endLineText = ''
    }

    fileUrl += `#L${startLine}${endLineText}`

    const wrapped =
      '```' +
      this.props.lang +
      '\n' +
      codeTextSplit.slice(startLine - 1, endLine).join('\n') +
      '\n```'

    const rendered = await renderCodeContents(wrapped)

    const HLJSNum = new LineNumbers(document)
    this.setState({ finalUrl: fileUrl, rendered }, () => {
      HLJSNum.documentReady({
        startFrom: startLine > 0 ? Number.parseInt(startLine) : 1,
        singleLine: true,
      })
    })

    document.addEventListener('copy', (ev) => {
      let selection = window.getSelection()
      if (HLJSNum.isHljsLnCodeDescendant(selection.anchorNode)) {
        let selText
        if (window.navigator.userAgent.indexOf('Edge') !== -1) {
          selText = HLJSNum.edgeGetSelectedCodeLines(selection)
        } else {
          selText = selection.toString()
        }
        ev.clipboardData.setData('text/plain', selText)
        ev.preventDefault()
      }
    })
  }

  render() {
    const { codeContents, fileUrl, rawFileUrl, lang, branchName, startLine, endLine } = this.props
    const tabSize = this.props.tabSize ?? 4
    let fileName = this.props.fileName

    if (!this.state.rendered) {
      return null
    }

    if (['master', 'main'].indexOf(branchName.toLowerCase()) === -1) {
      let branchExt = `@${branchName}`
      // https://docs.github.com/en/github/getting-started-with-github/github-glossary#commit-id
      if (branchName.length === 40) {
        branchExt = branchExt.slice(0, 8)
      }
      fileName += branchExt
    }

    return (
      <>
        <Head>
          <style>
            {`
            .ghcode-embed-contents > pre {
              width: 100% !important;
              margin: 0.25rem !important;
              border-radius: 0.375rem 0.375rem 0 0 !important;
              padding-left: 0.25rem !important;
              padding-right: 0.25rem !important;
            }

            .hljs-ln {
              margin: 0 !important
            }

            .hljs-ln > tbody > tr {
              border-bottom: 0 !important
            }

            .hljs-ln-numbers {
              text-align: right;
              color: #ccc;
              vertical-align: top;
              padding-right: 0.75rem !important;

              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }

            .hljs-ln-code {
              padding-left: 0.5rem !important;
            }

            .hljs-ln td {
              padding-bottom: 0.1rem !important;
              padding-top: 0.1rem !important;
              font-size: 12.5px;
            }
          `}
          </style>
        </Head>
        <div style={{ margin: '1em 0' }} className="file-container">
          <div
            className="code-pre-contents"
            style={{
              whiteSpace: 'pre-wrap',
              tabSize: `${tabSize}`,
              wordBreak: 'break-all',
              wordWrap: 'break-word',
            }}
          >
            <code
              className="p-4 flex ghcode-embed-contents"
              style={{
                backgroundColor: '#262626',
                borderRadius: '0.375rem 0.375rem 0 0',
                borderWidth: '1px 1px 0px',
              }}
              dangerouslySetInnerHTML={{ __html: this.state.rendered }}
            />
          </div>
          <div className="file-meta">
            <a
              target="_blank"
              href={rawFileUrl}
              className="font-semibold no-underline border-0 text-gray-600 dark:text-white"
              rel="noopener noreferrer"
              style={{ float: 'right' }}
            >
              view raw{' '}
            </a>
            <a
              target="_blank"
              className="font-semibold no-underline border-0 text-gray-600 dark:text-white"
              href={this.state.finalUrl}
              rel="noopener noreferrer"
            >
              {fileName}
            </a>{' '}
            hosted <span className="hide-in-phone">with ❤ </span>by{' '}
            <a
              className="font-semibold no-underline border-0 text-gray-600 dark:text-white"
              target="_blank"
              href="github.com"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </>
    )
  }
}

export default class GitHubCode extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      codeContents: '',
      isFailed: false,
    }
  }

  async componentDidMount() {
    const userName = this.props.user
    const repoName = this.props.repo
    const branch = this.props.branch ?? 'master'
    const path = this.props.filepath
    if (isNullUndef(userName) || isNullUndef(repoName) || isNullUndef(path)) {
      this.setState({
        loaded: true,
        isFailed: true,
        codeContents: 'Missing metadata needed to render code embed',
      })
      return
    }

    const [isOk, codeContents] = await getCode(userName, repoName, branch, path)
    if (isOk) {
      this.setState({ loaded: true, codeContents })
    } else {
      this.setState({ loaded: true, isFailed: true, codeContents })
    }
  }

  render() {
    if (!this.state.loaded) {
      return null
    }

    const userName = this.props.user
    const repoName = this.props.repo
    const branch = this.props.branch ?? 'master'
    const path = this.props.filepath

    let tabSize = this.props.tabsize || 4
    tabSize = isNaN(parseInt(tabSize)) ? 4 : parseInt(tabSize)
    let lineStart = this.props.lineStart
    let lineEnd = this.props.lineEnd
    lineStart = isNaN(parseInt(lineStart)) ? -1 : parseInt(lineStart)
    lineEnd = isNaN(parseInt(lineEnd)) ? -1 : parseInt(lineEnd)

    const splitPath = path.split('/')

    if (lineStart !== -1) {
      if (lineStart > lineEnd && lineEnd !== -1) {
        // Make sure end line is not bigger than start line, if it's set the end same as the start.
        lineEnd = lineStart
      }
    } else if (lineEnd !== -1 && lineStart === -1) {
      lineStart = 1
    }

    const fileName = splitPath[splitPath.length - 1]
    let fileExt = fileName.split('.')[fileName.split('.').length - 1]

    const fileUrl = `https://github.com/${userName}/${repoName}/blob/${branch}/${path}`
    const rawFile = `https://raw.githubusercontent.com/${userName}/${repoName}/${branch}/${path}`

    fileExt = this.state.isFailed ? 'plaintext' : fileExt

    return (
      <>
        <Head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark.min.css"
          />
        </Head>
        <div className="w-full">
          <GHCodeEmbed
            codeContents={this.state.codeContents}
            fileName={fileName}
            fileUrl={fileUrl}
            rawFileUrl={rawFile}
            lang={fileExt}
            branchName={branch}
            startLine={lineStart}
            endLine={lineEnd}
            tabSize={tabSize}
          />
        </div>
      </>
    )
  }
}
