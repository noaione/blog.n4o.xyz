import { durationToText } from '@/lib/utils';
import React from 'react';

export interface TimerLoaderCallback {
  pause: () => void;
  resume: () => void;
  stop: () => void;
  start: () => void;
  set: (duration: number) => void;
}
interface TimerProps {
  current: number;
  total: number;
  onFinished?: () => void;
  onMounted?: (callback: TimerLoaderCallback) => void;
}

interface TimerState {
  current: number;
}

export default class TimerLoader extends React.Component<TimerProps, TimerState> {
  timerState?: NodeJS.Timeout;

  constructor(props: TimerProps) {
    super(props);
    this.createTimerState = this.createTimerState.bind(this);
    this.stopTimerState = this.stopTimerState.bind(this);
    const { current } = props;
    this.state = {
      current,
    };
  }

  stopTimerState() {
    if (this.timerState) {
      clearInterval(this.timerState);
    }
  }

  createTimerState() {
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

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted({
        resume: () => {
          this.createTimerState();
        },
        stop: () => {
          this.stopTimerState();
          this.setState({ current: this.props.total });
        },
        pause: () => {
          this.stopTimerState();
        },
        start: () => {
          this.setState({ current: 0 });
          this.createTimerState();
        },
        set: (duration: number) => {
          this.setState({ current: duration });
        },
      });
    }
    this.createTimerState();
  }

  componentWillUnmount() {
    this.stopTimerState();
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
