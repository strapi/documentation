import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
/** Import built-in Docusaurus components at the global level
 * so we don't have to re-import them in every file
 */
import DocCardList from '@theme/DocCardList';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
// Import custom components, globally as well
import Request from '../components/Request';
import Response from '../components/Response';
import ApiCall from '../components/ApiCall';
import Columns from '../components/Columns';
import ColumnLeft from '../components/ColumnLeft';
import ColumnRight from '../components/ColumnRight';
import FeedbackPlaceholder from '../components/FeedbackPlaceholder';
import CustomDocCard from '../components/CustomDocCard';
import CustomDocCardsWrapper from '../components/CustomDocCardsWrapper';
import ExpandableDocCardsWrapper from '../components/ExpandableDocCardsWrapper';
import { InteractiveQueryBuilder } from '../components/InteractiveQueryBuilder/InteractiveQueryBuilder';
import { AlphaBadge, BetaBadge, FeatureFlagBadge, EnterpriseBadge, GrowthBadge, SsoBadge, CloudEssentialBadge, CloudProBadge, CloudScaleBadge, NewBadge, UpdatedBadge, VersionBadge } from '../components/Badge';
import { SideBySideColumn, SideBySideContainer } from '../components';
import ThemedImage from '@theme/ThemedImage';
import {
  MultiLanguageSwitcher,
  MultiLanguageSwitcherRequest,
  MultiLanguageSwitcherResponse,
} from '../components/MultiLanguageSwitcher';
import { Annotation } from '../components/Annotation';
import SubtleCallout from '../components/SubtleCallout';
import { PluginsConfigurationFile, HeadlessCms, DocumentDefinition, Codemods } from '../components/ReusableAnnotationComponents/ReusableAnnotationComponents';
import Icon from '../components/Icon';
import Guideflow from '../components/Guideflow';
import { ExternalLink } from '../components/ExternalLink';
import BreakingChangeIdCard from '../components/BreakingChangeIdCard';
import MermaidWithFallback from '../components/MermaidWithFallback.js';
import IdentityCard, { IdentityCardItem } from '../components/IdentityCard';

export default {
  // Re-use the default mapping
  ...MDXComponents,

  /**
   * Components below are imported within the global scope,
   * meaning you don't have to insert the typical 'import SomeStuff from '/path/to/stuff' line
   * at the top of a Markdown file before being able to use these components
   *  — see https://docusaurus.io/docs/next/markdown-features/react#mdx-component-scope
   */
  DocCardList,
  Tabs,
  TabItem,
  Request,
  Response,
  ApiCall,
  AlphaBadge,
  BetaBadge,
  FeatureFlagBadge,
  EnterpriseBadge,
  GrowthBadge,
  SsoBadge,
  NewBadge,
  UpdatedBadge,
  CloudEssentialBadge,
  CloudProBadge,
  CloudScaleBadge,
  VersionBadge,
  Columns,
  ColumnLeft,
  ColumnRight,
  FeedbackPlaceholder,
  CustomDocCard,
  CustomDocCardsWrapper,
  ExpandableDocCardsWrapper,
  InteractiveQueryBuilder,
  SubtleCallout,
  ThemedImage,
  MermaidWithFallback,
  SideBySideColumn,
  SideBySideContainer,
  MultiLanguageSwitcher,
  MultiLanguageSwitcherRequest,
  MultiLanguageSwitcherResponse,
  Guideflow,
  Annotation,
  Icon,
  ExternalLink,
  BreakingChangeIdCard,
  IdentityCard,
  IdentityCardItem,
  /**
   * Reusable annotation components go below👇
   */
  PluginsConfigurationFile,
  HeadlessCms,
  DocumentDefinition,
  Codemods,
};
