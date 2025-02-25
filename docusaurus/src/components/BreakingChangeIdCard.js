import React from 'react';
import Icon from './Icon';
import { ExternalLink } from './ExternalLink';

// Reusable component to display a question and its status
const BreakingChangeQuestion = ({ iconName, question, status }) => {
  const statusMap = {
    yes: { class: 'breaking-change-question__answer--positive', text: 'Yes' },
    partly: { class: 'breaking-change-question__answer--neutral', text: 'Partly' },
    no: { class: 'breaking-change-question__answer--negative', text: 'No' }
  };
  
  const { class: statusClass, text: statusText } = statusMap[status];
  
  return (
    <div className="breaking-change-question">
      <Icon name={iconName} />
      <span className="breaking-change-question__label">
        &nbsp;{question}
      </span>
      <span className={`breaking-change-question__answer ${statusClass}`}>
        {statusText}
      </span>
    </div>
  );
};

export default function BreakingChangeIdCard({
  plugins = false,
  codemod = false,
  codemodPartly = false,
  codemodName = '',
  codemodLink = '',
  info = '',
}) {
  // Define status for each question
  const pluginsStatus = plugins ? 'yes' : 'no';
  const codemodStatus = codemodPartly ? 'partly' : ((codemod || codemodName) ? 'yes' : 'no');
  
  // Define which type of link to codemod
  let codemodLinkContent = null;
  if (codemodName && codemodLink) {
    codemodLinkContent = <ExternalLink to={codemodLink} text={codemodName} />;
  } else if (codemodName) {
    codemodLinkContent = <code>{codemodName}</code>;
  } else if (codemodLink) {
    codemodLinkContent = <ExternalLink to={codemodLink} text="the codemod's code" />;
  }
  
  return (
    <div className="breaking-change-id-card">
      <BreakingChangeQuestion 
        iconName="plug"
        question="Is this breaking change affecting plugins?"
        status={pluginsStatus}
      />
      
      <BreakingChangeQuestion 
        iconName="robot"
        question="Is this breaking change automatically handled by a codemod?"
        status={codemodStatus}
      />
      
      {codemodLinkContent && (
        <span className="breaking-change-codemod-link">
          (see&nbsp;{codemodLinkContent})
        </span>
      )}
      
      {info && (
        <div className="breaking-change__info">
          <em>{info}</em>
        </div>
      )}
    </div>
  );
}