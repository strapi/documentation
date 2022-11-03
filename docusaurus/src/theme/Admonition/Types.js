import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import { useColorMode } from '@docusaurus/theme-common';

function StrapiAdmonition(props) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark'

  return (
    // <div style={{border: 'solid red', padding: 10}}>
    //   <h5 style={{color: 'blue', fontSize: 30}}>{props.title}</h5>
    //   <div>{props.children}</div>
    // </div>
    <div
      style={isDarkMode ? {backgroundColor: '#7b79ff', borderLeftColor: '#4945ff'} : {backgroundColor: '#f0f0ff', borderLeftColor: '#4945ff'}}
      className="theme-admonition theme-admonition-caution admonition_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module alert alert--warning admonition--strapi">
      <div className="admonitionHeading_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
        <span style={isDarkMode ? {color: '#FFF8E6'} : {color: '#4945ff'}} className="admonitionIcon_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
          🤓 {props.title}
        </span>
      </div>
      <div
        className="admonitionContent_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module"
      >
        {props.children}
      </div>
    </div>
  );
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,

  // Add all your custom admonition types here...
  // You can also override the default ones if you want
  'strapi': StrapiAdmonition,
};

export default AdmonitionTypes;