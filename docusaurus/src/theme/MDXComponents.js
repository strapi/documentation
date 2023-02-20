import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import DocCardList from '@theme/DocCardList';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Request from '../components/Request';
import Response from '../components/Response';
import ApiCall from '../components/ApiCall';
import AlphaBadge from '../components/AlphaBadge';
import BetaBadge from '../components/BetaBadge';
import GoldBadge from '../components/GoldBadge';
import Columns from '../components/Columns';
import ColumnLeft from '../components/ColumnLeft';
import ColumnRight from '../components/ColumnRight';
import FeedbackPlaceholder from '../components/FeedbackPlaceholder';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  /**
   * Components below are imported within the global scope,
   * meaning you don't have to insert the typical 'import SomeStuff from '/path/to/stuff' line
   * at the top of a Markdown file before being able to use these components
  *  — see https://docusaurus.io/docs/next/markdown-features/react#mdx-component-scope
   */
  DocCardList: DocCardList,
  Tabs: Tabs,
  TabItem: TabItem,
  Request: Request,
  Response: Response,
  ApiCall: ApiCall,
  AlphaBadge: AlphaBadge,
  BetaBadge: BetaBadge,
  GoldBadge: GoldBadge,
  Columns: Columns,
  ColumnLeft: ColumnLeft,
  ColumnRight: ColumnRight,
  FeedbackPlaceholder: FeedbackPlaceholder,
};
