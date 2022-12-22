import React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

export default function InteractiveProjectStructure() {
  return (
    <div className="project-structure">
      <Tabs>
        <TabItem value="js" label="JavaScript">

        
      <pre>
        <code>
      . <span class="token comment"># root of the application</span><br/>

      ├──── .cache <span class="token comment"># files used to build the admin panel</span><br/>
      ├──── .tmp<br/>
      ├──── <a href="/dev-docs/admin-panel-customization.html#build">build</a> <span class="token comment"># build of the admin panel</span><br/>
      ├──── config <span class="token comment"># API configurations</span><br/>
      │     ├ <a href="/dev-docs/configurations/api.html">api.js</a><br/>
      │     ├ <a href="/dev-docs/configurations/admin-panel.html">admin.js</a><br/>
      │     ├ <a href="/dev-docs/configurations/cron.html">cron-tasks.js</a><br/>
      │     ├ <a href="/dev-docs/configurations/database.html#database-configuration">database.js</a><br/>
      │     ├ <a href="/dev-docs/configurations/middlewares.html">middlewares.js</a><br/>
      │     ├ <a href="/dev-docs/configurations/plugins.html">plugins.js</a><br/>
      │     └ <a href="/dev-docs/configurations/server.html#server-configuration">server.js</a><br/>
      ├──── database<br/>
      │     └──── migrations<br/>
      ├──── node_modules <span class="token comment"># npm packages used by the project</span><br/>
      ├──── <a href="/dev-docs/configurations/public-assets.html">public</a> <span class="token comment"># files accessible to the outside world</span><br/>
      │     └──── uploads<br/>
      ├──── src<br/>
      │     ├──── admin <span class="token comment"># admin customization files</span><br/>
      │           ├──── <a href="/dev-docs/admin-panel-customization.html#extension">extensions</a> <span class="token comment"># files to extend the admin panel</span><br/>
      │     │     ├ <a href="/dev-docs/admin-panel-customization.html#configuration-options">app.js</a><br/>
      │     │     └ <a href="/dev-docs/admin-panel-customization.html#webpack-configuration">webpack.config.js</a><br/>
      │     ├──── api <span class="token comment"># business logic of the project split into subfolders per API</span><br/>
      │     │     └──── (api-name)<br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/models.html">content-types</a><br/>
      │     │           │     └──── (content-type-name)
      │     │           │           └ <a href="/dev-docs/backend-customization/models.html#lifecycle-hooks">lifecycles.js</a><br/>
      │     │           │           └ <a href="/dev-docs/backend-customization/models.html#model-schema">schema.json</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/controllers.html">controllers</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/middlewares.html">middlewares</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/policies.html">policies</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/routes.html">routes</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/services.html">services</a><br/>
      │     │           └ index.js<br/>
      │     ├──── <a href="/dev-docs/backend-customization/models.html">components</a><br/>
      │     │     └──── (category-name)<br/>
      │     │           ├ (componentA).json<br/>
      │     │           └ (componentB).json<br/>
      │     ├──── <a href="/dev-docs/plugins-extension.html">extensions</a> <span class="token comment"># files to extend installed plugins</span><br/>
      │     │     └──── (plugin-to-be-extended)<br/>
      │     │           ├──── content-types<br/>
      │     │           │     └──── (content-type-name)<br/>
      │     │           │           └ schema.json<br/>
      │     │           └ <a href="/dev-docs/api/plugins/server-api.html">strapi-server.js</a><br/>
      │     ├──── <a href="/dev-docs/configurations/middlewares.html">middlewares</a><br/>
      │     │     └──── (middleware-name).js<br/>
      │     ├──── <a href="/dev-docs/plugins-development.html">plugins</a> <span class="token comment"># local plugins files</span><br/>
      │     │     └──── (plugin-name)<br/>
      │     │           ├──── admin<br/>
      │     │           │     └──── src<br/>
      │     │           │           └ <a href="/dev-docs/api/plugins/admin-panel-api.html">index.js</a><br/>
      │     │           ├──── <a href="/dev-docs/api/plugins/server-api.html">server</a><br/>
      │     │           │     ├──── <a href="/dev-docs/api/plugins/server-api.html#content-types">content-types</a><br/>
      │     │           │     ├──── <a href="/dev-docs/api/plugins/server-api.html#controllers">controllers</a><br/>
      │     │           │     └──── <a href="/dev-docs/api/plugins/server-api.html#policies">policies</a><br/>
      │     │           ├ package.json<br/>
      │     │           ├ <a href="/dev-docs/api/plugins/admin-panel-api.html">strapi-admin.js</a><br/>
      │     │           └ <a href="/dev-docs/api/plugins/server-api.html#">strapi-server.js</a><br/>
      │     ├─── <a href="/dev-docs/backend-customization/policies.html">policies</a><br/>
      │     └ <a href="/dev-docs/configurations/functions.html">index.js</a> <span class="token comment"># include register(), bootstrap() and destroy() functions</span><br/>
      ├ <a href="/dev-docs/configurations/environment.html">.env</a><br/>
      └ package.json<br/>
        </code>
      </pre>

      </TabItem>

      <TabItem title="TypeScript-based projects" value="TypeScript-based projects">

      <pre>
        <code>
      . <span class="token comment"># root of the application</span><br/>

      ├──── .cache <span class="token comment"># files used to build the admin panel</span><br/>
      ├──── .tmp<br/>
      ├──── config <span class="token comment"># API configurations</span><br/>
      │     ├ <a href="/dev-docs/configurations/api.html">api.ts</a><br/>
      │     ├  <a href="/dev-docs/configurations/admin-panel.html">admin.ts</a><br/>
      │     ├ <a href="/dev-docs/configurations/cron.html">cron-tasks.ts</a><br/>
      │     ├ <a href="/dev-docs/configurations/database.html#database-configuration">database.ts</a><br/>
      │     ├ <a href="/dev-docs/configurations/middlewares.html">middlewares.ts</a><br/>
      │     ├ <a href="/dev-docs/configurations/plugins.html">plugins.ts</a><br/>
      │     └ <a href="/dev-docs/configurations/server.html#server-configuration">server.ts</a><br/>
      ├──── database<br/>
      │     └──── migrations<br/>
      ├──── dist <span class="token comment"># build of the backend</span><br/>
      │     └──── build <span class="token comment"># build of the admin panel</span><br/>
      ├──── node_modules # <span class="token comment">npm packages used by the project</span><br/>
      ├──── <a href="/dev-docs/configurations/public-assets.html">public</a> <span class="token comment"># files accessible to the outside world</span><br/>
      │     └──── uploads<br/>
      ├──── src<br/>
      │     ├──── admin <span class="token comment"># admin customization files</span><br/>
      │           ├──── <a href="/dev-docs/latest/development/admin-customization.html#extension">extensions</a> <span class="token comment"># files to extend the admin panel</span><br/>
      │     │     ├ <a href="/dev-docs/latest/development/admin-customization.html#configuration-options">app.example.tsx</a><br/>
      │     │     └ <a href="/dev-docs/latest/development/admin-customization.html#webpack-configuration">webpack.config.ts</a><br/>
      |     |     └ tsconfig.json<br/>
      │     ├──── api <span class="token comment"># business logic of the project split into subfolders per API</span><br/>
      │     │     └──── (api-name)<br/>
      │     │          <a href="/dev-docs/backend-customization/models.html">content-types</a><br/>
      │     │           │     └──── (content-type-name)<br/>
      │     │           │           └ <a href="/dev-docs/backend-customization/models.html#lifecycle-hooks">lifecycles.s</a><br/>
      │     │           │           └ <a href="/dev-docs/backend-customization/models.html#model-schema">schema.json</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/controllers.html">controllers</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/middlewares.html">middlewares</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/policies.html">policies</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/routes.html">routes</a><br/>
      │     │           ├──── <a href="/dev-docs/backend-customization/services.html">services</a><br/>
      │     │           └ index.ts<br/>
      │     │
      │     ├──── <a href="/dev-docs/backend-customization/models.html">components</a><br/>
      │     │     └──── (category-name)<br/>
      │     │           ├ (componentA).json<br/>
      │     │           └ (componentB).json<br/>
      │     ├──── <a href="/dev-docs/plugins-extension.html">extensions</a> <span class="token comment"># files to extend installed plugins</span><br/>
      │     │     └──── (plugin-to-be-extended)<br/>
      │     │           ├──── content-types<br/>
      │     │           │     └──── (content-type-name)<br/>
      │     │           │           └ schema.json<br/>
      │     │           └ <a href="/dev-docs/api/server-api.html">strapi-server.js</a><br/>
      │     ├──── <a href="/dev-docs/configurations/middlewares.html">middlewares</a><br/>
      │     │     └──── (middleware-name)<br/>
      │     │           ├ defaults.json<br/>
      │     │           └ index.ts<br/>
      │     ├──── <a href="/dev-docs/plugins-development.html">plugins</a> <span class="token comment"># local plugins files</span><br/>
      │     │     └──── (plugin-name)<br/>
      │     │           ├──── admin<br/>
      │     │           │     └──── src<br/>
      │     │           │           └ <a href="/dev-docs/api/admin-panel-api.html">index.tsx</a><br/>
      │     │           │           └ pluginId.ts<br/>
      │     │           ├──── <a href="/dev-docs/api/server-api.html">server</a><br/>
      │     │           │     ├──── <a href="/dev-docs/api/server-api.html#content-types">content-types</a><br/>
      │     │           │     ├──── <a href="/dev-docs/api/server-api.html#controllers">controllers</a><br/>
      │     │           │     └──── <a href="/dev-docs/api/server-api.html#policies">policies</a><br/>
      │     │           ├ package.json<br/>
      │     │           ├ <a href="/dev-docs/api/admin-panel-api.html">strapi-admin.js</a><br/>
      │     │           └ <a href="/dev-docs/api/server-api.html">strapi-server.js</a><br/>
      │     ├─── policies<br/>
      │     └ index.ts <span class="token comment"># include register(), bootstrap() and destroy() functions</span><br/>
      ├ .env<br/>
      ├ tsconfig.json<br/>
      └ package.json<br/>

        </code>
      </pre>

      </TabItem>
      </Tabs>
   </div>
  );
}
 
