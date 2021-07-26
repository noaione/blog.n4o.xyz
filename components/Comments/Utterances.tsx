import React from 'react'

export default class UtterancesComment extends React.Component {
  commentBox?: React.RefObject<HTMLDivElement>

  constructor(props) {
    super(props)
    this.commentBox = React.createRef()
  }

  componentDidMount() {
    const scriptelem = document.createElement('script')
    scriptelem.src = 'https://utteranc.es/client.js'
    scriptelem.async = true
    scriptelem.crossOrigin = 'anonymous'
    scriptelem.setAttribute('repo', 'noaione/blog.n4o.xyz')
    scriptelem.setAttribute('issue-term', 'pathname')
    scriptelem.setAttribute('label', '💬 Blog Comment')
    scriptelem.setAttribute('theme', 'preferred-color-scheme')
    if (this.commentBox && this.commentBox.current) {
      this.commentBox.current.appendChild(scriptelem)
    }
  }

  render() {
    return <div ref={this.commentBox} className="utterances-box"></div>
  }
}
