import { isNone } from '@/lib/utils';
import React from 'react';

const GiscusConfig = {
  'data-repo': 'noaione/blog.n4o.xyz',
  'data-repo-id': 'MDEwOlJlcG9zaXRvcnkzNjUyNTI3MzE=',
  'data-category': 'Blog Comment',
  'data-category-id': 'DIC_kwDOFcVQe84B-dOB',
  'data-mapping': 'pathname',
  'data-reactions-enabled': '0',
  'data-emit-metadata': '1',
};

export default class GiscusComment extends React.Component {
  commentBox?: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.commentBox = React.createRef();
  }

  componentDidMount() {
    const scriptelem = document.createElement('script');
    const currentTheme = localStorage.getItem('theme');
    scriptelem.src = 'https://giscus.app/client.js';
    scriptelem.async = true;
    scriptelem.crossOrigin = 'anonymous';
    for (const [key, value] of Object.entries(GiscusConfig)) {
      scriptelem.setAttribute(key, value);
    }
    if (isNone(currentTheme)) {
      scriptelem.setAttribute('data-theme', 'preferred_color_scheme');
    } else {
      if (currentTheme === 'light') {
        scriptelem.setAttribute('data-theme', 'light');
      } else if (currentTheme === 'dark') {
        scriptelem.setAttribute('data-theme', 'transparent_dark');
      } else {
        scriptelem.setAttribute('data-theme', 'preferred_color_scheme');
      }
    }
    if (this.commentBox && this.commentBox.current) {
      this.commentBox.current.appendChild(scriptelem);
    }
  }

  render() {
    return <div ref={this.commentBox} className="giscus-box"></div>;
  }
}
