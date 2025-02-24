import React from 'react';
import Icon from './Icon';
import { ExternalLink } from './ExternalLink';

export default function BreakingChangeIdCard({
  plugins = false,
  codemod = false, // used when we don't have a link to the codemod code
  codemodPartly = false,
  codemodName = false,
  codemodLink = null,
  info = null,
}) {

  return (
    <div className="breaking-change-id-card">
      <div className="breaking-change-question">
        <Icon name="plug" />
        <span className="breaking-change-question__label">
          &nbsp;Is this breaking change affecting plugins?
        </span>
        {plugins
          ? <span className="breaking-change-question__answer breaking-change-question__answer--negative">Yes</span>
          : <span className="breaking-change-question__answer breaking-change-question__answer--positive">No</span>}
      </div>
      <div className="breaking-change-question">
        <Icon name="robot" />
        <span className="breaking-change-question__label">
          &nbsp;Is this breaking change automatically handled by a codemod?
        </span>
        {(codemod || codemodName) && !codemodPartly ? (
          <span className="breaking-change-question__answer breaking-change-question__answer--positive">
            Yes
          </span>
        ) : codemodPartly ? (
          <span className="breaking-change-question__answer breaking-change-question__answer--neutral">
            Partly
          </span>
        ) : (
          <span className="breaking-change-question__answer breaking-change-question__answer--negative">
            No
          </span>
        )}
      </div>

      {(codemodLink && codemodLink.length > 0 && codemodName) &&
        <span className="breaking-change-codemod-link">
          (see&nbsp;<ExternalLink to={codemodLink} text={codemodName} />)
        </span>}

      {(codemodName && codemodName.length > 0 && !codemodLink) &&
        <span className="breaking-change-codemod-link">
          (see&nbsp;<code>{codemodName}</code>)
        </span>}

      {(!codemodName && codemodLink && codemodLink.length > 0) &&
        <span className="breaking-change-codemod-link">
          (see&nbsp;<ExternalLink to={codemodLink} text="the codemod's code" />)
        </span>}

      {info && <div className="breaking-change__info"><em>{info}</em></div>}
    </div>
  );
}

