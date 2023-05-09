import React, { useState } from 'react';
import { javascript as codeMirrorExtensionJS } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';

export function InteractiveQueryBuilder({
  endpoint: rawEndpoint = '/api/books',
  initial: rawInitial = '',
  ...rest
}) {
  const [code, setCode] = useState(rawInitial);
  const [endpoint, setEndpoint] = useState(rawEndpoint);

  return (
    <div>
      <div>
        <input
          type="url"
          value={endpoint}
          onChange={(event) => setEndpoint(event?.target?.value || '')}
          placeholder="Endpoint"
        />
      </div>
      <div style={{ margin: '16px 0' }}>
        <CodeMirror
          height="200px"
          extensions={[codeMirrorExtensionJS()]}
          theme="dark"
          {...rest}
          value={code}
          onChange={(newCode) => setCode(newCode)}
        />
      </div>
      <div>
        {`${endpoint}${(code && endpoint) ? '?' : ''}`}
      </div>
    </div>
  );
}
