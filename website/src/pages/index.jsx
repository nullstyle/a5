// A5
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) A5 contributors

import React from 'react';
import {Home} from '../components';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styled from 'styled-components';
import Layout from '@theme/Layout';

import HeroExample from '../examples/home-demo';

const FeatureImage = styled.div`
  position: absolute;
  height: 100%;
  width: 50%;
  top: 0;
  right: 0;
  z-index: -1;
  border-top: solid 200px transparent;
  background-image: url(${props => props.src});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right top;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const TextContainer = styled.div`
  max-width: 800px;
  padding: 64px 112px;
  width: 70%;
  font-size: 14px;

  h2 {
    font: bold 32px/48px;
    margin: 24px 0 16px;
    position: relative;
  }
  h3 {
    font: bold 16px/24px;
    margin: 16px 0 0;
    position: relative;
  }
  h3 > img {
    position: absolute;
    top: 0;
    width: 20px;
    left: -30px;
  }
  hr {
    border: none;
    background: #e1e8f0;
    height: 1px;
    margin: 24px 0 0;
    width: 32px;
    height: 2px;
  }
  @media screen and (max-width: 768px) {
    max-width: 100%;
    width: 100%;
    padding: 48px 48px 48px 80px;
  }
`;

export default function IndexPage() {
  const baseUrl = useBaseUrl('/');

  return (
    <Layout title="Home" description="A5 tiling system">
      <Home HeroExample={HeroExample}>
        <div style={{position: 'relative'}}>
          <FeatureImage src={`${baseUrl}images/maps.jpg`} />
          <TextContainer>
            <h3>
              <img src={`${baseUrl}images/pentagon.svg`} />Pentagonal Discrete Global Grid System
            </h3>
            <p>
              A5 is a DGGS that is designed to be used as a global geospatial index.
              It is the pentagonal equivalent of other DDGSs, like <a href="http://s2geometry.io/">S2</a> or <a href="https://h3geo.org/">H3</a>.
            </p>

            <h3>
              <img src={`${baseUrl}images/pentagon.svg`} />Uniform Cell Sizes with Minimal Distortion
            </h3>
            <p>
              Compared to other DDGSs, where cell size at a given resolution varies by a factor of 2,
              A5 cells vary by only 2% at a given resolution.
            </p>

            <h3>
              <img src={`${baseUrl}images/pentagon.svg`} />Compact Representation
            </h3>
            <p>
              A5 cells are stored as a 64-bit integers, with a maximum resolution of less than 1cm<sup>2</sup>.
            </p>
          </TextContainer>
        </div>
      </Home>
    </Layout>
  );
}
