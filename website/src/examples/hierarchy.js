import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/hierarchy/app';

import {makeExample} from '../components';

class HierarchyDemo extends Component {
  static title = 'Hierarchy';

  static code = `${GITHUB_TREE}/examples/website/hierarchy`;

  static parameters = {};

  static renderInfo(meta) {
    return (
      <div>
        <p>A visualization of the A5 pentagon hierarchy on a globe.</p>
        <p>Zooming in/out on the page will change the resolution level of the pentagon at the center of the map.</p>
        <p>Click any location on the globe to see the pentagon hierarchy at that location.</p>
        <p>Notice how cells at similar locations have similar cell ids.</p>
      </div>
    );
  }

  render() {
    const {Component, ...otherProps} = this.props;
    return <App {...otherProps} />;
  }
}

export default makeExample(HierarchyDemo); 