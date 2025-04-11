// A5
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) A5 contributors

import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Banner, BannerContainer, HeroExampleContainer, ProjectName, GetStartedLink} from './styled';
import styled from 'styled-components';
import {isMobile} from '../common';

const EventBlocker = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(200, 0, 0, 0.5);
  pointer-events: none;
  z-index: 0;
  ${isMobile} {
    pointer-events: auto;
  }
`;

export default function renderPage({HeroExample, children}) {
  const {siteConfig} = useDocusaurusContext();

  // Note: The Layout "wrapper" component adds header and footer etc
  return (
    <>
      <EventBlocker />
      <Banner>
        <HeroExampleContainer>{HeroExample && <HeroExample />}</HeroExampleContainer>
        <BannerContainer>
          <ProjectName>{siteConfig.title}</ProjectName>
          <p>{siteConfig.tagline}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <GetStartedLink href="./docs/">INTRODUCTION</GetStartedLink>
            <GetStartedLink href="./examples/">EXAMPLES</GetStartedLink>
          </div>
        </BannerContainer>
      </Banner>
      {children}
    </>
  );
}
