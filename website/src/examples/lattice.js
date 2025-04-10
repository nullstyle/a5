import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/lattice/app';

import {makeExample} from '../components';

class LatticeDemo extends Component {
  static title = 'Lattice';

  static code = `${GITHUB_TREE}/examples/website/lattice`;

  static parameters = {};

  static renderInfo(meta) {
    return (
      <div>
        <p>A5 Lattice Explorer</p>
        <p>Shows the relationship between the triangles in the A5 lattice and the pentagon tiling and how they are indexed by the Hilbert curve.</p>
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

export default makeExample(LatticeDemo);
