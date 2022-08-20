import React from 'react';
import Image from 'next/image';
import PropType from 'prop-types';
import { useIntl } from 'react-intl';

interface UpdootTLProps {
  id: string;
  sub?: { [key: string]: unknown };
}

function Translated(props: UpdootTLProps) {
  const intl = useIntl();

  const translated = intl.formatMessage({
    id: props.id,
  });

  return <span>{translated}</span>;
}

interface UpdootButtonProps {
  namespace: string;
  id: string;
}

interface UpdootButtonState {
  loading: boolean;
  total_score: number;
  user_vote_direction: number;
  total_votes: number;
  failure: boolean;
}

class UpdootButton extends React.Component<UpdootButtonProps, UpdootButtonState> {
  API_KEY: string;

  static propTypes = {
    namespace: PropType.string.isRequired,
    id: PropType.string.isRequired,
  };

  constructor(props: UpdootButtonProps) {
    super(props);
    this.API_KEY = 'b5ab6e16ddf58617e2c7dea3abe6b8';
    this.requestAPI = this.requestAPI.bind(this);
    this.updoot = this.updoot.bind(this);
    this.state = {
      loading: true,
      total_score: 0,
      user_vote_direction: 0,
      total_votes: 0,
      failure: false,
    };
  }

  async requestAPI(method, path = '', data = null) {
    const { id, namespace } = this.props;
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
    );

    return await fetched.json();
  }

  async componentDidMount() {
    const fetched = await this.requestAPI('GET');

    let updootData;
    try {
      updootData = {
        total_score: fetched.data.attributes.total_score,
        user_vote_direction: fetched.data.attributes.user_vote_direction,
        total_votes: fetched.data.attributes.total_votes,
        loading: false,
      };
    } catch (e) {
      updootData = { failure: true };
    }

    this.setState(updootData);
  }

  async updoot(type: 'UP' | 'DOWN') {
    if (this.state.loading) {
      return;
    }
    this.setState({ loading: true });
    if (type === 'UP') {
      // Upvote
      const fetched = await this.requestAPI('PUT', '/press-up');
      this.setState({
        total_score: fetched.data.attributes.total_score,
        user_vote_direction: fetched.data.attributes.user_vote_direction,
        total_votes: fetched.data.attributes.total_votes,
      });
    } else if (type === 'DOWN') {
      // Downvote
      const fetched = await this.requestAPI('PUT', '/press-down');
      this.setState({
        total_score: fetched.data.attributes.total_score,
        user_vote_direction: fetched.data.attributes.user_vote_direction,
        total_votes: fetched.data.attributes.total_votes,
      });
    }
    this.setState({ loading: false });
  }

  render() {
    const { loading, total_score, total_votes, user_vote_direction, failure } = this.state;
    if (loading || failure) {
      return null;
    }
    let positive_vote = 0;
    let negative_vote = 0;
    if (total_score < 0) {
      negative_vote = Math.abs(total_score);
      positive_vote = total_votes + total_score;
    } else {
      negative_vote = total_score - total_votes;
      positive_vote = total_score;
    }

    const pos_vote_txt = positive_vote > 1 ? 'voteTextMultiple' : 'voteTextSingle';
    const neg_vote_txt = positive_vote > 1 ? 'voteTextMultiple' : 'voteTextSingle';

    const selectedStyles = {
      backgroundColor: '#bb7d0d66',
    };
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
            <Image
              src="/static/images/yeahbutBTTV/peepoClap.gif"
              className="!w-10 !h-10 !min-h-0 !min-w-0 focus:outline-none"
              width={40}
              height={40}
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
            <Image
              src="/static/images/yeahbutBTTV/peepoLeave.gif"
              className="focus:outline-none"
              width={40}
              height={40}
              alt="Bad"
              title="Bad Posts"
            />
            <Translated id={neg_vote_txt} sub={{ count: negative_vote.toLocaleString() }} />
          </button>
        </div>
      </div>
    );
  }
}

export default UpdootButton;
