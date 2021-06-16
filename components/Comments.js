import React from 'react'

class UtterancesComments extends React.Component {
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
    return <div ref={this.commentBox} className="comments-box"></div>
  }
}

export default UtterancesComments
