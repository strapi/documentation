import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';

function StrapiAdmonition(props) {
  return (
    // <div style={{border: 'solid red', padding: 10}}>
    //   <h5 style={{color: 'blue', fontSize: 30}}>{props.title}</h5>
    //   <div>{props.children}</div>
    // </div>
    <div style={{backgroundColor: '#f0f0ff', borderLeftColor: '#4945ff'}} class="theme-admonition theme-admonition-caution admonition_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module alert alert--warning admonition--strapi">
      <div class="admonitionHeading_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
        <span style={{color: '#4945ff'}} class="admonitionIcon_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
          🤓 {props.title}
        </span>
      </div>
      <div class="admonitionContent_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
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