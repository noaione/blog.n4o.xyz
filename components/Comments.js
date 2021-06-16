import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'next/router'

import UpdootButton from './UpdootButton'

function generateID(slug, locale, defaultLocale) {
  if (locale === defaultLocale) {
    return slug
  }
  return slug + '-' + locale
}
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
    const { router, slug } = this.props
    const voteID = generateID(slug, router.locale, router.defaultLocale)

    return (
      <>
        <UpdootButton id={voteID} namespace="blogpost" />
        <div ref={this.commentBox} className="comments-box"></div>
      </>
    )
  }
}

UtterancesComments.propTypes = {
  slug: PropTypes.string.isRequired,
}

export default withRouter(UtterancesComments)
