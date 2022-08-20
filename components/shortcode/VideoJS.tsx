/* eslint-disable jsx-a11y/media-has-caption */
import { Component } from 'react';

interface VideoProps {
  src: string;
  caption?: string;
}

export default class VideoPlayer extends Component<VideoProps> {
  render() {
    return (
      <div className="flex flex-col mx-auto">
        <video
          width="auto"
          height="auto"
          playsInline
          controls
          style={{ marginTop: '0', marginBottom: '0' }}
        >
          <source src={this.props.src} type="video/mp4" />
        </video>
        {this.props.caption && (
          <figcaption style={{ alignSelf: 'center' }}>{this.props.caption}</figcaption>
        )}
      </div>
    );
  }
}
