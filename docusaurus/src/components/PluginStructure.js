import React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

export default function InteractivePluginStructure() {
  return (
    <div className="project-structure">
      <Tabs>
        <TabItem value="js" label="JavaScript-based plugins">

          The following diagram is interactive: you can click on any file or folder name highlighted in purple to go to the corresponding documentation section.<br /><br />

          <pre className="prism-code">
            <code>
            . <span className="token comment"># root of the plugin folder (e.g., /src/plugins/my-plugin)</span><br/>
            ├── <a href="/dev-docs/plugins/admin-panel-api">admin</a> <span className="token comment"># Admin panel part of your plugin.</span><br/>
            │   └── src<br />
            │       ├── components <span className="token comment"># Contains your front-end components</span><br/>
            │       │   ├── Initializer.jsx <span className="token comment"># Plugin initializer</span><br/>
            │       │   └── PluginIcon.jsx <span className="token comment"># Contains the icon of your plugin in the main navigation</span><br/>
            │       ├── pages <span className="token comment"># Contains the pages of your plugin</span><br/>
            │       │   ├── App.jsx <span className="token comment"># Skeleton around the actual pages</span><br/>
            │       │   └── HomePage.jsx <span className="token comment"># Homepage of your plugin</span><br/>
            │       ├── translations <span className="token comment"># Translations files to make your plugin i18n-friendly</span><br/>
            │       │   ├── en.json<br/>
            │       ├── utils<br/>
            │       │   └── getTranslations.js <span className="token comment"># getTranslations function to return the corresponding plugin translations</span><br/>
            │       ├── index.js <span className="token comment"># Main setup of your plugin, used to register elements in the admin panel</span><br/>
            │       └── pluginId.js <span className="token comment"># pluginId variable computed from package.json name</span><br/>
            ├── node_modules<br />
            ├── <a href="/dev-docs/plugins/server-api">server</a> <span className="token comment"># Back-end part of your plugin</span><br/>
            │   ├── <a href="/dev-docs/plugins/server-api#configuration">config</a><br/>
            │   │   └── index.js <span className="token comment"># Contains the default server configuration</span><br/>
            │   ├── <a href="/dev-docs/plugins/server-api#content-types">content-types</a> <span className="token comment"># Content-types specific to your plugin</span><br/>
            │   │   └── index.js <span className="token comment"># Loads all the plugin's content-types</span><br />
            │   ├── <a href="/dev-docs/plugins/server-api#controllers">controllers</a> <span className="token comment"># Controllers specific to your plugin</span><br />
            │   │   ├── index.js <span className="token comment"># Loads all the plugin's controllers</span><br/>
            │   │   └── my-controller.js <span className="token comment"># Custom controller example. You can rename it or delete it.</span><br/>
            │   ├── <a href="/dev-docs/plugins/server-api#middlewares">middlewares</a> <span className="token comment"># Middlewares specific to your plugin</span><br/>
            │   │   └── index.js <span className="token comment"># Loads all the plugin's middlewares</span><br />
            │   ├── <a href="/dev-docs/plugins/server-api#policies">policies</a> <span className="token comment"># Policies specific to your plugin</span><br />
            │   │   └── index.js <span className="token comment"># Loads all the plugin's policies</span><br />
            │   ├── <a href="/dev-docs/plugins/server-api#routes">routes</a> <span className="token comment"># Routes specific to your plugin</span><br/>
            │   │   └── index.js <span className="token comment"># Contains an example route for the my-controller custom controller example</span><br/>
            │   ├── <a href="/dev-docs/plugins/server-api#services">services</a> <span className="token comment"># Services specific to your plugin</span> <br/>
            │   │   ├── index.js <span className="token comment"># Loads all the plugin's services</span><br/>
            │   │   └── service.js <span className="token comment"># Custom service example. You can rename it or delete it.</span><br/>
            │   ├── <a href="/dev-docs/plugins/server-api#bootstrap">bootstrap.js</a> <span className="token comment"># Function that is called right after the plugin has registered</span><br/>
            │   ├── <a href="/dev-docs/plugins/server-api#destroy">destroy.js</a> <span className="token comment"># Function that is called to clean up the plugin after Strapi instance is destroyed</span><br/>
            │   ├── index.js <span className="token comment"># Loads the code for all the server elements</span> <br />
            │   └── <a href="/dev-docs/plugins/server-api#register">register.js</a> <span className="token comment"># Function that is called to load the plugin, before bootstrap.</span><br/>
            ├── package.json<br />
            ├── README.md<br />
            └── <a href="/dev-docs/plugins/server-api">strapi-server.js</a> <span className="token comment"># Entrypoint for the server (back end)</span><br/>

            </code>
          </pre>

        </TabItem>

        <TabItem title="TypeScript-based projects" value="TypeScript-based plugins">

          The following diagram is interactive: you can click on any file or folder name highlighted in purple to go to the corresponding documentation section.<br /><br />

          <pre className="prism-code">
            <code>
            . <span className="token comment"># root of the plugin folder (e.g., /src/plugins/my-plugin)</span><br/>
            ├── <a href="/dev-docs/plugins/admin-panel-api">admin</a> <span className="token comment"># Admin panel part of your plugin.</span><br/>
            │   └── src<br />
            │       ├── components <span className="token comment"># Contains your front-end components</span><br/>
            │       │   ├── Initializer.tsx <span className="token comment"># Plugin initializer</span><br/>
            │       │   └── PluginIcon.tsx <span className="token comment"># Contains the icon of your plugin in the main navigation</span><br/>
            │       ├── pages <span className="token comment"># Contains the pages of your plugin</span><br/>
            │       │   ├── App.tsx <span className="token comment"># Skeleton around the actual pages</span><br/>
            │       │   └── HomePage.tsx <span className="token comment"># Homepage of your plugin</span><br/>
            │       ├── translations <span className="token comment"># Translations files to make your plugin i18n-friendly</span><br/>
            │       │   ├── en.json<br/>
            │       ├── utils<br/>
            │       │   └── getTranslations.ts <span className="token comment"># getTranslations function to return the corresponding plugin translations</span><br/>
            │       ├── index.tsx <span className="token comment"># Main setup of your plugin, used to register elements in the admin panel</span><br/>
            │       └── pluginId.tsx <span className="token comment"># pluginId variable computed from package.tsxon name</span><br/>
            ├── dist <span className="token comment"># Build of the backend</span><br/>
            ├── node_modules<br />
            ├── <a href="/dev-docs/plugins/server-api">server</a> <span className="token comment"># Back-end part of your plugin</span><br/>
            │   └── src<br />
            │       ├── <a href="/dev-docs/plugins/server-api#configuration">config</a><br/>
            │       │   └── index.ts <span className="token comment"># Contains the default server configuration</span><br/>
            │       ├── <a href="/dev-docs/plugins/server-api#content-types">content-types</a> <span className="token comment"># Content-types specific to your plugin</span><br/>
            │       │   └── index.ts <span className="token comment"># Loads all the plugin's content-types</span><br />
            │       ├── <a href="/dev-docs/plugins/server-api#controllers">controllers</a> <span className="token comment"># Controllers specific to your plugin</span><br />
            │       │   ├── index.ts <span className="token comment"># Loads all the plugin's controllers</span><br/>
            │       │   └── controller.ts <span className="token comment"># Custom controller example. You can rename it or delete it.</span><br/>
            │       ├── <a href="/dev-docs/plugins/server-api#middlewares">middlewares</a> <span className="token comment"># Middlewares specific to your plugin</span><br/>
            │       │   └── index.ts <span className="token comment"># Loads all the plugin's middlewares</span><br />
            │       ├── <a href="/dev-docs/plugins/server-api#policies">policies</a> <span className="token comment"># Policies specific to your plugin</span><br />
            │       │   └── index.ts <span className="token comment"># Loads all the plugin's policies</span><br />
            │       ├── <a href="/dev-docs/plugins/server-api#routes">routes</a> <span className="token comment"># Routes specific to your plugin</span><br/>
            │       │   └── index.ts <span className="token comment"># Contains an example route for the my-controller custom controller example</span><br/>
            │       ├── <a href="/dev-docs/plugins/server-api#services">services</a> <span className="token comment"># Services specific to your plugin</span> <br/>
            │       │   ├── index.ts <span className="token comment"># Loads all the plugin's services</span><br/>
            │       │   └── service.ts <span className="token comment"># Custom service example. You can rename it or delete it.</span><br/>
            │       ├── <a href="/dev-docs/plugins/server-api#bootstrap">bootstrap.ts</a> <span className="token comment"># Function that is called right after the plugin has registered</span><br/>
            │       ├── <a href="/dev-docs/plugins/server-api#register">destroy.ts</a> <span className="token comment"># Function that is called to clean up the plugin after Strapi instance is destroyed</span><br/>
            │       ├── index.ts <span className="token comment"># Loads the code for all the server elements</span> <br />
            │       └── <a href="/dev-docs/plugins/server-api#register">register.ts</a> <span className="token comment"># Function that is called to load the plugin, before bootstrap.</span><br/>
            ├── custom.d.ts <span className="token comment"># Generated types</span><br/>
            ├── package.json<br />
            ├── README.md<br />
            ├── <a href="/dev-docs/plugins/server-api">strapi-server.js</a> <span className="token comment"># Entrypoint for the server (back end)</span><br/>
            ├── tsconfig.json <span className="token comment"># TypeScript compiler options for the admin panel part</span><br />
            └── tsconfig.server.json <span className="token comment"># TypeScript compiler options for the server part</span><br />
            </code>
          </pre>

        </TabItem>
      </Tabs>
   </div>
  );
}

