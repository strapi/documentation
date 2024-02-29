import React from 'react'

export default function InteractiveProjectStructure() {
  return (
    <div className="project-structure">
      <pre className="prism-code">
        <code>
        . <span className="token comment"># root of the project</span><br/>
        ├──── config<br/>
        │     ├ <a href="/dev-docs/configurations/api">api.js|ts</a><br/>
        │     ├ <a href="/dev-docs/configurations/admin-panel">admin.js|ts</a><br/>
        │     ├ <a href="/dev-docs/configurations/cron">cron-tasks.js|ts</a><br/>
        │     ├ <a href="/dev-docs/configurations/database#database-configuration">database.js|ts</a><br/>
        │     ├ <a href="/dev-docs/configurations/features">features.js|ts</a><br/>
        │     ├ <a href="/dev-docs/configurations/middlewares">middlewares.js|ts</a><br/>
        │     ├ <a href="/dev-docs/configurations/plugins">plugins.js|ts</a><br/>
        │     └ <a href="/dev-docs/configurations/server#server-configuration">server.js|ts</a><br/>
        </code>
      </pre>

   </div>
  );
}

