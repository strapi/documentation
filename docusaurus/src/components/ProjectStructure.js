import React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

export default function InteractiveProjectStructure() {
  return (
    <div className="project-structure">
      <Tabs>
        <TabItem label="TypeScript-based projects" value="ts">

          The following diagram is interactive: you can click on any file or folder name highlighted in purple to go to the corresponding documentation page.<br /><br />

          <pre className="prism-code">
            <code>
          . <span className="token comment"># root of the application</span><br/>

          ├──── .strapi <span className="token comment"># auto-generated folder — do not update manually</span><br/>
          │     └──── client <span className="token comment"># files used by bundlers to render the application</span><br/>
          │           ├ index.html <br/>
          │           └ app.js <br/>
          ├──── .tmp<br/>
          ├──── config <span className="token comment"># API configurations</span><br/>
          │     ├ <a href="/cms/configurations/admin-panel">admin.ts</a><br/>
          │     ├ <a href="/cms/configurations/api">api.ts</a><br/>
          │     ├ <a href="/cms/configurations/cron">cron-tasks.ts</a> <span className="token comment"># optional, only if you created CRON tasks</span><br/>
          │     ├ <a href="/cms/configurations/database#database-configuration">database.ts</a><br/>
          │     ├ <a href="/cms/configurations/middlewares">middlewares.ts</a><br/>
          │     ├ <a href="/cms/configurations/plugins">plugins.ts</a><br/>
          │     └ <a href="/cms/configurations/server#server-configuration">server.ts</a><br/>
          ├──── database<br/>
          │     └──── migrations<br/>
          ├──── dist <span className="token comment"># build of the backend</span><br/>
          │     └──── build <span className="token comment"># build of the admin panel</span><br/>
          ├──── node_modules # <span className="token comment">npm packages used by the project</span><br/>
          ├──── <a href="/cms/configurations/public-assets">public</a> <span className="token comment"># files accessible to the outside world</span><br/>
          │     ├──── uploads<br/>
          │     └ robots.txt<br/>
          ├──── src<br/>
          │     ├──── admin <span className="token comment"># admin customization files</span><br/>
          │     │     ├──── <a href="/cms/admin-panel-customization#extension">extensions</a> <span className="token comment"># optional, files to extend the admin panel</span><br/>
          │     │     ├──── <a href="/cms/admin-panel-customization/options">app.example.tsx</a><br/>
          │     │     ├──── <a href="/cms/admin-panel-customization#webpack-configuration">webpack.config.example.js</a><br/>
          |     |     ├──── tsconfig.json<br/>
          │     ├──── api <span className="token comment"># business logic of the project split into subfolders per API</span><br/>
          │     │     └──── (api-name)<br/>
          │     │           ├──── <a href="/cms/backend-customization/models">content-types</a><br/>
          │     │           │     └──── (content-type-name)<br/>
          │     │           │           ├ <a href="/cms/backend-customization/models#lifecycle-hooks">lifecycles.ts</a><br/>
          │     │           │           └ <a href="/cms/backend-customization/models#model-schema">schema.json</a><br/>
          │     │           ├──── <a href="/cms/backend-customization/controllers">controllers</a><br/>
          │     │           ├──── <a href="/cms/backend-customization/middlewares">middlewares</a><br/>
          │     │           ├──── <a href="/cms/backend-customization/policies">policies</a><br/>
          │     │           ├──── <a href="/cms/backend-customization/routes">routes</a><br/>
          │     │           ├──── <a href="/cms/backend-customization/services">services</a><br/>
          │     │           └ index.ts<br/>
          │     ├──── <a href="/cms/backend-customization/models">components</a><br/>
          │     │     └──── (category-name)<br/>
          │     │           ├ (componentA).json<br/>
          │     │           └ (componentB).json<br/>
          │     ├──── <a href="/cms/plugins-development/plugins-extension">extensions</a> <span className="token comment"># files to extend installed plugins</span><br/>
          │     │     └──── (plugin-to-be-extended)<br/>
          │     │           ├──── content-types<br/>
          │     │           │     └──── (content-type-name)<br/>
          │     │           │           └ schema.json<br/>
          │     │           └ <a href="/cms/plugins/server-api">strapi-server.js</a><br/>
          │     ├──── <a href="/cms/configurations/middlewares">middlewares</a><br/>
          │     │     └──── (middleware-name)<br/>
          │     │           ├ defaults.json<br/>
          │     │           └ index.ts<br/>
          │     ├──── <a href="/cms/plugins/developing-plugins">plugins</a> <span className="token comment"># local plugins files</span><br/>
          │     │     └──── (plugin-name)<br/>
          │     │           ├──── admin<br/>
          │     │           │     └──── src<br/>
          │     │           │           └ <a href="/cms/plugins/admin-panel-api">index.tsx</a><br/>
          │     │           │           └ pluginId.ts<br/>
          │     │           ├──── <a href="/cms/plugins/server-api">server</a><br/>
          │     │           │     ├──── <a href="/cms/plugins/server-api#content-types">content-types</a><br/>
          │     │           │     ├──── <a href="/cms/ns/server-api#controllers">controllers</a><br/>
          │     │           │     └──── <a href="/cms/plugins/server-api#policies">policies</a><br/>
          │     │           ├ package.json<br/>
          │     │           ├ <a href="/cms/plugins/admin-panel-api">strapi-admin.js</a><br/>
          │     │           └ <a href="/cms/plugins/server-api">strapi-server.js</a><br/>
          │     ├─── <a href="/cms/backend-customization/policies">policies</a><br/><br/>
          │     └ index.ts <span className="token comment"># include register(), bootstrap() and destroy() functions</span><br/>
          ├──── <a href="/cms/typescript/development#generate-typings-for-content-types-schemas">types</a><br/>
          │     └──── generated<br/>
          │           ├ components.d.ts <span className="token comment"># generated types for your components</span><br/>
          │           └ contentTypes.d.ts <span className="token comment"># generated types for content-types</span><br/>
          ├ .env<br/>
          ├ .strapi-updater.json <span className="token comment"># used to track if users need to update their application</span><br/>
          ├ <a href="/cms/admin-panel-customization#favicon">favicon.png</a><br/>
          ├ package.json<br/>
          └ tsconfig.json<br/>

            </code>
          </pre>

        </TabItem>

        <TabItem value="js" label="JavaScript-based projects">

          The following diagram is interactive: you can click on any file or folder name highlighted in purple to go to the corresponding documentation page.<br /><br />

        <pre className="prism-code">
          <code>
        . <span className="token comment"># root of the application</span><br/>

        ├──── .strapi <span className="token comment"># auto-generated folder — do not update manually</span><br/>
        │     └──── client <span className="token comment"># files used by bundlers to render the application</span><br/>
        │           ├ index.html <br/>
        │           └ app.js <br/>
        ├──── .tmp<br/>
        ├──── <a href="/cms/admin-panel-customization#build">build</a> <span className="token comment"># build of the admin panel</span><br/>
        ├──── config <span className="token comment"># API configurations</span><br/>
        │     ├ <a href="/cms/gurations/admin-panel">admin.js</a><br/>
        │     ├ <a href="/cms/configurations/api">api.js</a><br/>
        │     ├ <a href="/cms/gurations/cron">cron-tasks.ts</a> <span className="token comment"># optional, only if you created CRON tasks</span><br/>
        │     ├ <a href="/cms/configurations/database#database-configuration">database.js</a><br/>
        │     ├ <a href="/cms/configurations/middlewares">middlewares.js</a><br/>
        │     ├ <a href="/cms/configurations/plugins">plugins.js</a><br/>
        │     └ <a href="/cms/configurations/server#server-configuration">server.js</a><br/>
        ├──── database<br/>
        │     └──── migrations<br/>
        ├──── node_modules <span className="token comment"># npm packages used by the project</span><br/>
        ├──── <a href="/cms/configurations/public-assets">public</a> <span className="token comment"># files accessible to the outside world</span><br/>
        │     └──── uploads<br/>
        ├──── src<br/>
        │     ├──── admin <span className="token comment"># admin customization files</span><br/>
        │           ├──── <a href="/cms/admin-panel-customization#extension">extensions</a> <span className="token comment"># optional, files to extend the admin panel</span><br/>
        │     │     ├ <a href="/cms/admin-panel-customization/options">app.js</a><br/>
        │     │     └ <a href="/cms/admin-panel-customization#webpack-configuration">webpack.config.js</a><br/>
        │     ├──── api <span className="token comment"># business logic of the project split into subfolders per API</span><br/>
        │     │     └──── (api-name)<br/>
        │     │           ├──── <a href="/cms/backend-customization/models">content-types</a><br/>
        │     │           │     └──── (content-type-name)<br/>
        │     │           │           └ <a href="/cms/backend-customization/models#lifecycle-hooks">lifecycles.js</a><br/>
        │     │           │           └ <a href="/cms/backend-customization/models#model-schema">schema.json</a><br/>
        │     │           ├──── <a href="/cms/backend-customization/controllers">controllers</a><br/>
        │     │           ├──── <a href="/cms/backend-customization/middlewares">middlewares</a><br/>
        │     │           ├──── <a href="/cms/backend-customization/policies">policies</a><br/>
        │     │           ├──── <a href="/cms/backend-customization/routes">routes</a><br/>
        │     │           ├──── <a href="/cms/backend-customization/services">services</a><br/>
        │     │           └ index.js<br/>
        │     ├──── <a href="/cms/backend-customization/models">components</a><br/>
        │     │     └──── (category-name)<br/>
        │     │           ├ (componentA).json<br/>
        │     │           └ (componentB).json<br/>
        │     ├──── <a href="/cms/plugins-development/plugins-extension">extensions</a> <span className="token comment"># files to extend installed plugins</span><br/>
        │     │     └──── (plugin-to-be-extended)<br/>
        │     │           ├──── content-types<br/>
        │     │           │     └──── (content-type-name)<br/>
        │     │           │           └ schema.json<br/>
        │     │           └ <a href="/cms/plugins/server-api">strapi-server.js</a><br/>
        │     ├──── <a href="/cms/configurations/middlewares">middlewares</a><br/>
        │     │     └──── (middleware-name).js<br/>
        │     ├──── <a href="/cms/plugins/developing-plugins">plugins</a> <span className="token comment"># local plugins files</span><br/>
        │     │     └──── (plugin-name)<br/>
        │     │           ├──── admin<br/>
        │     │           │     └──── src<br/>
        │     │           │           └ <a href="/cms/plugins/admin-panel-api">index.js</a><br/>
        │     │           ├──── <a href="/cms/plugins/server-api">server</a><br/>
        │     │           │     ├──── <a href="/cms/plugins/server-api#content-types">content-types</a><br/>
        │     │           │     ├──── <a href="/cms/plugins/server-api#controllers">controllers</a><br/>
        │     │           │     └──── <a href="/cms/plugins/server-api#policies">policies</a><br/>
        │     │           ├ package.json<br/>
        │     │           ├ <a href="/cms/plugins/admin-panel-api">strapi-admin.js</a><br/>
        │     │           └ <a href="/cms/plugins/server-api">strapi-server.js</a><br/>
        │     ├─── <a href="/cms/backend-customization/policies">policies</a><br/>
        │     └ <a href="/cms/configurations/functions">index.js</a> <span className="token comment"># include register(), bootstrap() and destroy() functions</span><br/>
        ├ <a href="/cms/configurations/environment">.env</a><br/>
        ├ <a href="/cms/admin-panel-customization#favicon">favicon.png</a><br/>
        └ package.json<br/>
          </code>
        </pre>

        </TabItem>

      </Tabs>
   </div>
  );
}

