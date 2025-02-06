import React from 'react'

export default function InteractiveProjectStructure() {
  return (
    <div className="project-structure">
      <pre className="prism-code">
        <code>
        . <span className="token comment"># root of the project</span><br/>
        ├──── config<br/>
        │     ├ <a href="/cms/configurations/api">api.js|ts</a><br/>
        │     ├ <a href="/cms/configurations/admin-panel">admin.js|ts</a><br/>
        │     ├ <a href="/cms/configurations/cron">cron-tasks.js|ts</a><br/>
        │     ├ <a href="/cms/configurations/database#database-configuration">database.js|ts</a><br/>
        │     ├ <a href="/cms/configurations/features">features.js|ts</a><br/>
        │     ├ <a href="/cms/configurations/middlewares">middlewares.js|ts</a><br/>
        │     ├ <a href="/cms/configurations/plugins">plugins.js|ts</a><br/>
        │     └ <a href="/cms/configurations/server#server-configuration">server.js|ts</a><br/>
        </code>
      </pre>

   </div>
  );
}

