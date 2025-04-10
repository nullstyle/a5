import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/area/app';

import {makeExample} from '../components';

class AreaDemo extends Component {
  static title = 'Area Variance';

  static code = `${GITHUB_TREE}/examples/website/area`;

  static parameters = {};

  static renderInfo(meta) {
    return (
      <div>
        <p>Area variance</p>
      </div>
    );
  }

  render() {
    return (
      <div style={{width: '100%', height: '100%', position: 'absolute', background: '#111'}}>
        <App {...this.props} />
      </div>
    );
  }
}

export default makeExample(AreaDemo);
