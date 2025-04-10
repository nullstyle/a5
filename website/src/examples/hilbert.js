import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/hilbert/app';

import {makeExample} from '../components';

class HilbertDemo extends Component {
  static title = 'Hilbert Curve';

  static code = `${GITHUB_TREE}/examples/website/hilbert`;

  static parameters = {};

  static renderInfo(meta) {
    return (
      <div>
        <p>Illustration of Hilbert curve across all the cells on the globe</p>
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

export default makeExample(HilbertDemo); 