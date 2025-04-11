import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/golf/app';

import {makeExample} from '../components';

class GolfDemo extends Component {
  static title = 'Golf Ball Dimples';

  static code = `${GITHUB_TREE}/examples/website/golf`;

  static parameters = {};

  static renderInfo(meta) {
    return (
      <div>
        <p>Golf ball dimple layout using A5 pentagonal tiling.</p>
        <p>240 equal area dimples, distributed on the surface of a sphere.</p>
        <p>Production golf balls typically have 300-400 dimples, but they vary in size</p>
        <p>Background texture: <a href="https://polyhaven.org/a/spruit_sunrise">Spruit Sunrise</a></p>
      </div>
    );
  }

  render() {
    const isMobile = window.innerWidth < 480 || window.innerHeight < 480;
    return (
      <div style={{width: '100%', height: '100%', position: 'absolute', background: '#111'}}>
        <App {...this.props} useHD={!isMobile} />
      </div>
    );
  }
}

export default makeExample(GolfDemo); 