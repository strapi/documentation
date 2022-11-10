import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import { useColorMode } from '@docusaurus/theme-common';

function StrapiAdmonition(props) {
  return (
    <div
      className="theme-admonition theme-admonition-caution admonition_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module alert alert--warning admonition--strapi">
      <div className="admonitionHeading_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module admonition__custom-title">
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

function GenericAdmonition(props) {
  return (
    <div
      className="theme-admonition theme-admonition-caution admonition_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module alert alert--warning admonition--callout">
      { props.title && <div className="admonitionHeading_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module admonition__custom-title">
          {props.title}
        </span>
      </div>}
      <div
        className="admonitionContent_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module"
      >
        {props.children}
      </div>
    </div>
  );
}

function PrerequisitesAdmonition(props) {
  return (
    <div
      className="theme-admonition theme-admonition-caution admonition_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module alert alert--warning admonition--prerequisites">
      <div className="admonitionHeading_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module">
        <span className="admonitionIcon_node_modules-@docusaurus-theme-classic-lib-theme-Admonition-Layout-styles-module admonition__custom-title">
          PREREQUISITES
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
  'callout': GenericAdmonition,
  'prerequisites': PrerequisitesAdmonition,
};

export default AdmonitionTypes;
