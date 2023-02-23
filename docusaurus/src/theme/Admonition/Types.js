import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import CustomAdmonition from './CustomAdmonition';

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,

  // Overrides
  'note': CustomAdmonition,
  'tip': CustomAdmonition,
  'info': CustomAdmonition,
  'caution': CustomAdmonition,
  'danger': CustomAdmonition,

  // All custom admonition types here...
  'callout': CustomAdmonition,
  'prerequisites': CustomAdmonition,
  'strapi': CustomAdmonition,
};

export default AdmonitionTypes;
