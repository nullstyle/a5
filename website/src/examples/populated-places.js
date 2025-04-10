import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/populated-places/app';

import {makeExample} from '../components';

class PopulatedPlacesDemo extends Component {
  static title = 'Populated Places';

  static code = `${GITHUB_TREE}/examples/website/populated-places`;

  static parameters = {};

  static renderInfo(meta) {
    return (
      <div>
        <p>Populated places across the world</p>
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

export default makeExample(PopulatedPlacesDemo); 