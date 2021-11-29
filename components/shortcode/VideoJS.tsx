/* eslint-disable jsx-a11y/media-has-caption */
import { string } from 'prop-types';
import { Component } from 'react';
import videojs, { VideoJsPlayer } from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoProps {
  src: string;
  caption?: string;
}

export default class VideoPlayer extends Component<VideoProps> {
  player?: VideoJsPlayer;
  videoNode?: HTMLVideoElement;

  static propTypes = {
    src: string.isRequired,
    caption: string,
  };

  componentDidMount() {
    this.player = videojs(this.videoNode, { fluid: true, controls: true, preload: 'no' });
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div className="flex flex-col mx-auto">
        <div data-vjs-player>
          <video
            ref={(node) => (this.videoNode = node)}
            className="video-js vjs-fluid"
            width="auto"
            height="auto"
            style={{ marginTop: '0', marginBottom: '0' }}
          >
            <source src={this.props.src} type="video/mp4" />
            <p className="vjs-no-js">
              To view this video please enable JavaScript, and consider upgrading to a web browser
              that
              <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noreferrer">
                supports HTML5 video
              </a>
            </p>
          </video>
        </div>
        {this.props.caption && (
          <figcaption style={{ alignSelf: 'center' }}>{this.props.caption}</figcaption>
        )}
      </div>
    );
  }
}
