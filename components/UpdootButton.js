import React from 'react'
import Image from 'next/image'
import PropType from 'prop-types'
import { useIntl } from 'react-intl'

function Translated(props) {
  const intl = useIntl()

  const translated = intl.formatMessage(
    {
      id: props.id,
    },
    props.sub
  )

  return <span>{translated}</span>
}

Translated.propTypes = {
  id: PropType.string.isRequired,
  sub: PropType.object,
}

class UpdootButton extends React.Component {
  constructor(props) {
    super(props)
    this.API_KEY = 'b5ab6e16ddf58617e2c7dea3abe6b8'
    this.requestAPI = this.requestAPI.bind(this)
    this.updoot = this.updoot.bind(this)
    this.state = {
      loading: true,
      total_score: 0,
      user_vote_direction: 0,
      total_votes: 0,
    }
  }

  async requestAPI(method, path = '', data = null) {
    const { id, namespace } = this.props
    const fetched = await fetch(
      `https://api.lyket.dev/v1/updown-buttons/${namespace}/${id}${path}`,
      {
        method: method,
        body: data === null ? undefined : data,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.API_KEY}`,
        },
      }
    )

    return await fetched.json()
  }

  async componentDidMount() {
    const fetched = await this.requestAPI('GET')

    this.setState({
      total_score: fetched.data.attributes.total_score,
      user_vote_direction: fetched.data.attributes.user_vote_direction,
      total_votes: fetched.data.attributes.total_votes,
      loading: false,
    })
  }

  async updoot(type) {
    if (this.loading) {
      return
    }
    this.setState({ loading: true })
    if (type === 'UP') {
      // Upvote
      const fetched = await this.requestAPI('PUT', '/press-up')
      this.setState({
        total_score: fetched.data.attributes.total_score,
        user_vote_direction: fetched.data.attributes.user_vote_direction,
        total_votes: fetched.data.attributes.total_votes,
      })
    } else if (type === 'DOWN') {
      // Downvote
      const fetched = await this.requestAPI('PUT', '/press-down')
      this.setState({
        total_score: fetched.data.attributes.total_score,
        user_vote_direction: fetched.data.attributes.user_vote_direction,
        total_votes: fetched.data.attributes.total_votes,
      })
    }
    this.setState({ loading: false })
  }

  render() {
    const { loading, total_score, total_votes, user_vote_direction } = this.state
    let positive_vote = 0
    let negative_vote = 0
    if (total_score < 0) {
      negative_vote = Math.abs(total_score)
      positive_vote = total_votes + total_score
    } else {
      negative_vote = total_score - total_votes
      positive_vote = total_score
    }

    const pos_vote_txt = positive_vote > 1 ? 'voteTextMultiple' : 'voteTextSingle'
    const neg_vote_txt = positive_vote > 1 ? 'voteTextMultiple' : 'voteTextSingle'

    const selectedStyles = {
      backgroundColor: '#bb7d0d66',
    }
    return (
      <div className="flex flex-col justify-center">
        <div className="text-center mb-2">
          <Translated id="voteInfo" />
        </div>
        <div className="flex flex-row justify-center gap-2">
          <button
            className={`p-1 rounded focus:outline-none flex flex-col items-center ${
              loading ? 'cursor-not-allowed' : ''
            }`}
            onClick={() => this.updoot('UP')}
            disabled={loading}
            style={user_vote_direction > 0 ? selectedStyles : null}
          >
            <img
              className="w-10 h-10 focus:outline-none"
              src="/static/images/yeahbutBTTV/peepoClap.gif"
              alt="Good"
              title="Good Posts"
            />
            <Translated id={pos_vote_txt} sub={{ count: positive_vote.toLocaleString() }} />
          </button>
          <button
            className={`p-1 rounded focus:outline-none flex flex-col items-center ${
              loading ? 'cursor-not-allowed' : ''
            }`}
            onClick={() => this.updoot('DOWN')}
            disabled={loading}
            style={user_vote_direction < 0 ? selectedStyles : null}
          >
            <img
              className="w-10 h-10 focus:outline-none"
              src="/static/images/yeahbutBTTV/peepoLeave.gif"
              alt="Bad"
              title="Bad Posts"
            />
            <Translated id={neg_vote_txt} sub={{ count: negative_vote.toLocaleString() }} />
          </button>
        </div>
      </div>
    )
  }
}

UpdootButton.propTypes = {
  namespace: PropType.string.isRequired,
  id: PropType.string.isRequired,
}

export default UpdootButton
