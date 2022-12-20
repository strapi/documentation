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
      │     ├ <a href="/dev-docs/configurations/cronjobs.html">cron-tasks.js</a><br/>
      │     ├ <a href="/dev-docs/configurations/databases.html#database-configuration">database.js</a><br/>
      │     ├ <a href="/dev-docs/configurations/middlewares.html">middlewares.js</a><br/>
      │     ├ <a href="/dev-docs//configurations/plugins.html">plugins.js</a><br/>
      │     └ <a href="/dev-docs/configurations/server.html#server-configuration">server.js</a><br/>
      ├──── database<br/>
      │     └──── migrations<br/>
      ├──── node_modules <span class="token comment"># npm packages used by the project</span><br/>
      ├──── <a href="/dev-docs/configurations/public-assets.html">public</a> <span class="token comment"># files accessible to the outside world</span><br/>
      │     └──── uploads<br/>
      ├──── src<br/>
      │     ├──── admin <span class="token comment"># admin customization files</span><br/>
      │           ├──── <a href="/dev-docs/admin-panel-customization.html#extension">extensions</a> <span class="token comment"># files to extend the admin panel</span><br/>
      │     │     ├ <a href="/dev-docs//admin-panel-customization.html#configuration-options">app.js</a>
      │     │     └ <a href="/dev-docs//admin-panel-customization.html#webpack-configuration">webpack.config.js</a>
      │     ├──── api <span class="token comment"># business logic of the project split into subfolders per API</span>
      │     │     └──── (api-name)
      │     │           ├──── <a href="/dev-docs/backend-customization/models.html">content-types</a>
      │     │           │     └──── (content-type-name)
      │     │           │           └ <a href="/dev-docs/backend-customization/models.html#lifecycle-hooks">lifecycles.js</a>
      │     │           │           └ <a href="/dev-docs/backend-customization/models.html#model-schema">schema.json</a>
      │     │           ├──── <a href="/dev-docs/backend-customization/controllers.html">controllers</a>
      │     │           ├──── <a href="/dev-docs/setup-deployment-guides/configurations/optional/middlewares.html">middlewares</a>
      │     │           ├──── <a href="/dev-docs/backend-customization/policies.html">policies</a>
      │     │           ├──── <a href="/dev-docs/backend-customization/routes.html">routes</a>
      │     │           ├──── <a href="/dev-docs/backend-customization/services.html">services</a>
      │     │           └ index.js
      │     ├──── <a href="/dev-docs/backend-customization/models.html">components</a>
      │     │     └──── (category-name)
      │     │           ├ (componentA).json
      │     │           └ (componentB).json
      │     ├──── <a href="/developer-docs/plugins-extension.html">extensions</a> <span class="token comment"># files to extend installed plugins</span>
      │     │     └──── (plugin-to-be-extended)
      │     │           ├──── content-types
      │     │           │     └──── (content-type-name)
      │     │           │           └ schema.json
      │     │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
      │     ├──── <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.html">middlewares</a>
      │     │     └──── (middleware-name).js
      │     ├──── <a href="/developer-docs/latest/development/plugins-development.html">plugins</a> <span class="token comment"># local plugins files</span>
      │     │     └──── (plugin-name)
      │     │           ├──── admin
      │     │           │     └──── src
      │     │           │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html">index.js</a>
      │     │           ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">server</a>
      │     │           │     ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#content-types">content-types</a>
      │     │           │     ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#controllers">controllers</a>
      │     │           │     └──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#policies">policies</a>
      │     │           ├ package.json
      │     │           ├ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html">strapi-admin.js</a>
      │     │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
      │     ├─── <a href="/developer-docs/latest/development/backend-customization/policies.html">policies</a>
      │     └ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.html">index.js</a> <span class="token comment"># include register(), bootstrap() and destroy() functions</span>
      ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html">.env</a>
      └ package.json
        </code>
      </pre>

      </TabItem>

      <TabItem title="TypeScript-based projects" value="TypeScript-based projects">

      <pre>
        <code>
      . <span class="token comment"># root of the application</span>

      ├──── .cache <span class="token comment"># files used to build the admin panel</span>
      ├──── .tmp
      ├──── config <span class="token comment"># API configurations</span>
      │     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/api.html">api.ts</a>
      │     ├  <a href="/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.html">admin.ts</a>
      │     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.html">cron-tasks.ts</a>
      │     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html#database-configuration">database.ts</a>
      │     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html">middlewares.ts</a>
      │     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.html">plugins.ts</a>
      │     └ <a href="/developer-docs/latest/setup-deployment-guides/configurations/required/server.html#server-configuration">server.ts</a>
      ├──── database
      │     └──── migrations
      ├──── dist <span class="token comment"># build of the backend</span>
      │     └──── build <span class="token comment"># build of the admin panel</span>
      ├──── node_modules # <span class="token comment">npm packages used by the project</span>
      ├──── <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.html">public</a> <span class="token comment"># files accessible to the outside world</span>
      │     └──── uploads
      ├──── src
      │     ├──── admin <span class="token comment"># admin customization files</span>
      │           ├──── <a href="/developer-docs/latest/development/admin-customization.html#extension">extensions</a> <span class="token comment"># files to extend the admin panel</span>
      │     │     ├ <a href="/developer-docs/latest/development/admin-customization.html#configuration-options">app.example.tsx</a>
      │     │     └ <a href="/developer-docs/latest/development/admin-customization.html#webpack-configuration">webpack.config.ts</a>
      |     |     └ tsconfig.json
      │     ├──── api <span class="token comment"># business logic of the project split into subfolders per API</span>
      │     │     └──── (api-name)
      │     │          <a href="/developer-docs/latest/development/backend-customization/models.html">content-types</a>
      │     │           │     └──── (content-type-name)
      │     │           │           └ <a href="/developer-docs/latest/development/backend-customization/models.html#lifecycle-hooks">lifecycles.s</a>
      │     │           │           └ <a href="/developer-docs/latest/development/backend-customization/models.html#model-schema">schema.json</a>
      │     │           ├──── <a href="/developer-docs/latest/development/backend-customization/controllers.html">controllers</a>
      │     │           ├──── <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.html">middlewares</a>
      │     │           ├──── <a href="/developer-docs/latest/development/backend-customization/policies.html">policies</a>
      │     │           ├──── <a href="/developer-docs/latest/development/backend-customization/routes.html">routes</a>
      │     │           ├──── <a href="/developer-docs/latest/development/backend-customization/services.html">services</a>
      │     │           └ index.ts
      │     │
      │     ├──── <a href="/developer-docs/latest/development/backend-customization/models.html">components</a>
      │     │     └──── (category-name)
      │     │           ├ (componentA).json
      │     │           └ (componentB).json
      │     ├──── <a href="/developer-docs/latest/development/plugins-extension.html">extensions</a> <span class="token comment"># files to extend installed plugins</span>
      │     │     └──── (plugin-to-be-extended)
      │     │           ├──── content-types
      │     │           │     └──── (content-type-name)
      │     │           │           └ schema.json
      │     │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
      │     ├──── <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.html">middlewares</a>
      │     │     └──── (middleware-name)
      │     │           ├ defaults.json
      │     │           └ index.ts
      │     ├──── <a href="/developer-docs/latest/development/plugins-development.html">plugins</a> <span class="token comment"># local plugins files</span>
      │     │     └──── (plugin-name)
      │     │           ├──── admin
      │     │           │     └──── src
      │     │           │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html">index.tsx</a>
      │     │           │           └ pluginId.ts
      │     │           ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">server</a>
      │     │           │     ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#content-types">content-types</a>
      │     │           │     ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#controllers">controllers</a>
      │     │           │     └──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#policies">policies</a>
      │     │           ├ package.json
      │     │           ├ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html">strapi-admin.js</a>
      │     │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
      │     ├─── policies
      │     └ index.ts <span class="token comment"># include register(), bootstrap() and destroy() functions</span>
      ├ .env
      ├ tsconfig.json
      └ package.json

        </code>
      </pre>

      </TabItem>
      </Tabs>
   </div>
  );
}
 