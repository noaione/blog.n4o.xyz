import { durationToText } from '@/lib/utils';
import React from 'react';

interface TimerProps {
  current: number;
  total: number;
  onFinished?: () => void;
}

interface TimerState {
  current: number;
}

export default class TimerLoader extends React.Component<TimerProps, TimerState> {
  timerState?: NodeJS.Timeout;

  constructor(props: TimerProps) {
    super(props);
    const { current } = props;
    this.state = {
      current,
    };
  }

  componentDidMount() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const outerThis = this;
    this.timerState = setInterval(() => {
      this.setState(
        (prev) => ({ current: prev.current + 1 }),
        () => {
          if (outerThis.state.current >= outerThis.props.total) {
            if (this.timerState) {
              clearInterval(this.timerState);
            }
            if (outerThis.props && typeof outerThis.props.onFinished === 'function') {
              outerThis.props.onFinished();
            }
          }
        }
      );
    }, 1000);
  }

  componentWillUnmount() {
    if (this.timerState) {
      clearInterval(this.timerState);
    }
  }

  render() {
    let { current } = this.state;
    const { total } = this.props;
    if (current >= total && this.timerState) {
      clearInterval(this.timerState);
      current = total;
    }

    return (
      <span>
        {durationToText(current)}/{durationToText(total)}
      </span>
    );
  }
}
