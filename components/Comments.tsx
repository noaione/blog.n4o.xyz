import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'next/router'
import { WithRouterProps } from 'next/dist/client/with-router'

import UpdootButton from './UpdootButton'

function generateID(slug: string, locale: string, defaultLocale: string) {
  if (locale === defaultLocale) {
    return slug
  }
  return slug + '-' + locale
}

interface CommentsProps extends WithRouterProps {
  slug: string;
}

class UtterancesComments extends React.Component<CommentsProps> {
  commentBox?: React.RefObject<HTMLDivElement>;

  static propTypes = {
    slug: PropTypes.string.isRequired,
  }

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

export default withRouter(UtterancesComments)
