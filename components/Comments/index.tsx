import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'next/router'
import { WithRouterProps } from 'next/dist/client/with-router'

import GiscusComment from './Giscus'
import UtterancesComment from './Utterances'
import UpdootButton from '../UpdootButton'

function generateID(slug: string, locale: string, defaultLocale: string) {
  if (locale === defaultLocale) {
    return slug
  }
  return slug + '-' + locale
}

export type AvailableCommentProvider = 'utterances' | 'giscus'

interface CommentsProps extends WithRouterProps {
  slug: string
  disableComment?: boolean
  useComment?: AvailableCommentProvider
}

class CommentsBox extends React.Component<CommentsProps> {
  static propTypes = {
    slug: PropTypes.string.isRequired,
  }

  render() {
    const { router, slug, disableComment, useComment } = this.props
    const voteID = generateID(slug, router.locale, router.defaultLocale)

    if (disableComment) {
      return <UpdootButton id={voteID} namespace="blogpost" />
    }

    if (useComment === 'utterances') {
      return (
        <>
          <UpdootButton id={voteID} namespace="blogpost" />
          <UtterancesComment />
        </>
      )
    }

    return (
      <>
        <UpdootButton id={voteID} namespace="blogpost" />
        <GiscusComment />
      </>
    )
  }
}

export default withRouter(CommentsBox)
