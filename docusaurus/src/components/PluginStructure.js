import React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

export default function InteractivePluginStructure() {
  return (
    <div className="project-structure">
      <Tabs>
        <TabItem value="js" label="JavaScript-based plugins">

        The following diagram is interactive: you can click on any file or folder name highlighted in purple to go to the corresponding documentation page.<br /><br />

      <pre className="prism-code">
        <code>
        . <span className="token comment"># root of the plugin folder (e.g., /src/plugins/my-plugin)</span><br/>
        ├── <a href="#">admin</a> <span className="token comment"># Admin panel part of your plugin.</span><br/>
        │   └── src<br />
        │       ├── <a href="#">components</a> <span className="token comment"># Contains your front-end components</span><br/>
        │       │   ├── Initializer<br/>
        │       │   │   └── <a href="#">index.js</a> <span className="token comment"># Plugin initializer</span><br/>
        │       │   └── PluginIcon<br/>
        │       │       └── <a href="#">index.js</a> <span className="token comment"># Contains the icon of your plugin in the main navigation</span><br/>
        │       ├── <a href="#">pages</a> <span className="token comment"># Contains the pages of your plugin</span><br/>
        │       │   ├── App <br />
        │       │   │   └── <a href="#">index.js</a> <span className="token comment"># Skeleton around the actual pages</span><br/>
        │       │   └── HomePage <br />
        │       │       └── <a href="#">index.js</a> <span className="token comment"># Homepage of your plugin</span><br/>
        │       ├── <a href="#">translations</a> <span className="token comment"># Translations files to make your plugin i18n-friendly</span><br/>
        │       │   ├── <a href="#">en.json</a><br/>
        │       │   └── <a href="#">fr.json</a><br/>
        │       └── <a href="#">utils</a><br/>
        │       │   └── <a href="#">getTrad.js</a> <span className="token comment"># getTrad function to return the corresponding plugin translations</span><br/>
        │       ├── <a href="#">index.js</a> <span className="token comment"># Main setup of your plugin, used to register elements in the admin panel</span><br/>
        │       └── <a href="#">pluginId.js</a> <span className="token comment"># pluginId variable computed from package.json name</span><br/>
        ├── node_modules<br />
        ├── <a href="#">server</a> <span className="token comment"># Back-end part of your plugin</span><br/>
        │   ├── <a href="#">config</a><br/>
        │   │   └── <a href="#">index.js</a> <span className="token comment"># Contains the default server configuration</span><br/>
        │   ├── <a href="#">content-types</a> <span className="token comment"># Content-types specific to your plugin</span><br/>
        │   │   └── <a href="#">index.js</a> <span className="token comment"># Loads all the plugin's content-types</span><br />
        │   ├── <a href="#">controllers</a> <span className="token comment"># Controllers specific to your plugin</span><br />
        │   │   ├── <a href="#">index.js</a> <span className="token comment"># Loads all the plugin's controllers</span><br/>
        │   │   └── <a href="#">my-controller.js</a> <span className="token comment"># Custom controller example. You can rename it or delete it.</span><br/>
        │   ├── <a href="#">middlewares</a> <span className="token comment"># Middlewares specific to your plugin</span><br/>
        │   │   └── <a href="#">index.js</a> <span className="token comment"># Loads all the plugin's middlewares</span><br />
        │   ├── <a href="#">policies</a> <span className="token comment"># Policies specific to your plugin</span><br />
        │   │   └── <a href="#">index.js</a> <span className="token comment"># Loads all the plugin's policies</span><br />
        │   ├── <a href="#">routes</a> <span className="token comment"># Routes specific to your plugin</span><br/>
        │   │   └── <a href="#">index.js</a> <span className="token comment"># Contains an example route for the my-controller custom controller example</span><br/>
        │   └── <a href="#">services</a> <span className="token comment"># Services specific to your plugin</span> <br/>
        │   │   ├── <a href="#">index.js</a> <span className="token comment"># Loads all the plugin's services</span><br/>
        │   │   └── <a href="#">my-service.js</a> <span className="token comment"># Custom service example. You can rename it or delete it.</span><br/>
        │   ├── <a href="#">bootstrap.js</a> <span className="token comment"># Function that is called right after the plugin has registered</span><br/>
        │   ├── <a href="#">destroy.js</a> <span className="token comment"># Function that is called to clean up the plugin after Strapi instance is destroyed</span><br/>
        │   ├── <a href="#">index.js</a> <span className="token comment"># Loads the code for all the server elements</span> <br />
        │   └── <a href="#">register.js</a> <span className="token comment"># Function that is called to load the plugin, before bootstrap.</span><br/>
        ├── package.json<br />
        ├── README.md<br />
        ├── <a href="#">strapi-admin.js</a> <span className="token comment"># Entrypoint for the admin panel (front-end)</span><br/>
        └── <a href="#">strapi-server.js</a> <span className="token comment"># Entrypoint for the server (back-end)</span><br/>

        </code>
      </pre>

      </TabItem>

      <TabItem title="TypeScript-based projects" value="TypeScript-based plugins">

      The following diagram is interactive: you can click on any file or folder name highlighted in purple to go to the corresponding documentation page.<br /><br />

      <pre className="prism-code">
        <code>
        . <span className="token comment"># root of the plugin folder (e.g., /src/plugins/my-plugin)</span><br/>
        ├── <a href="#">admin</a> <span className="token comment"># Admin panel part of your plugin.</span><br/>
        │   └── src<br />
        │       ├── <a href="#">components</a> <span className="token comment"># Contains your front-end components</span><br/>
        │       │   ├── Initializer<br/>
        │       │   │   └── <a href="#">index.tsx</a> <span className="token comment"># Plugin initializer</span><br/>
        │       │   └── PluginIcon<br/>
        │       │       └── <a href="#">index.tsx</a> <span className="token comment"># Contains the icon of your plugin in the main navigation</span><br/>
        │       ├── <a href="#">pages</a> <span className="token comment"># Contains the pages of your plugin</span><br/>
        │       │   ├── App <br />
        │       │   │   └── <a href="#">index.tsx</a> <span className="token comment"># Skeleton around the actual pages</span><br/>
        │       │   └── HomePage <br />
        │       │       └── <a href="#">index.tsx</a> <span className="token comment"># Homepage of your plugin</span><br/>
        │       ├── <a href="#">translations</a> <span className="token comment"># Translations files to make your plugin i18n-friendly</span><br/>
        │       │   ├── <a href="#">en.json</a><br/>
        │       │   └── <a href="#">fr.json</a><br/>
        │       └── <a href="#">utils</a><br/>
        │       │   └── <a href="#">getTrad.ts</a> <span className="token comment"># getTrad function to return the corresponding plugin translations</span><br/>
        │       ├── <a href="#">index.tsx</a> <span className="token comment"># Main setup of your plugin, used to register elements in the admin panel</span><br/>
        │       └── <a href="#">pluginId.tsx</a> <span className="token comment"># pluginId variable computed from package.tsxon name</span><br/>
        ├── dist <span className="token comment"># Build of the backend</span><br/>
        ├── node_modules<br />
        ├── <a href="#">server</a> <span className="token comment"># Back-end part of your plugin</span><br/>
        │   ├── <a href="#">config</a><br/>
        │   │   └── <a href="#">index.ts</a> <span className="token comment"># Contains the default server configuration</span><br/>
        │   ├── <a href="#">content-types</a> <span className="token comment"># Content-types specific to your plugin</span><br/>
        │   │   └── <a href="#">index.ts</a> <span className="token comment"># Loads all the plugin's content-types</span><br />
        │   ├── <a href="#">controllers</a> <span className="token comment"># Controllers specific to your plugin</span><br />
        │   │   ├── <a href="#">index.ts</a> <span className="token comment"># Loads all the plugin's controllers</span><br/>
        │   │   └── <a href="#">my-controller.ts</a> <span className="token comment"># Custom controller example. You can rename it or delete it.</span><br/>
        │   ├── <a href="#">middlewares</a> <span className="token comment"># Middlewares specific to your plugin</span><br/>
        │   │   └── <a href="#">index.ts</a> <span className="token comment"># Loads all the plugin's middlewares</span><br />
        │   ├── <a href="#">policies</a> <span className="token comment"># Policies specific to your plugin</span><br />
        │   │   └── <a href="#">index.ts</a> <span className="token comment"># Loads all the plugin's policies</span><br />
        │   ├── <a href="#">routes</a> <span className="token comment"># Routes specific to your plugin</span><br/>
        │   │   └── <a href="#">index.ts</a> <span className="token comment"># Contains an example route for the my-controller custom controller example</span><br/>
        │   └── <a href="#">services</a> <span className="token comment"># Services specific to your plugin</span> <br/>
        │   │   ├── <a href="#">index.ts</a> <span className="token comment"># Loads all the plugin's services</span><br/>
        │   │   └── <a href="#">my-service.ts</a> <span className="token comment"># Custom service example. You can rename it or delete it.</span><br/>
        │   ├── <a href="#">bootstrap.ts</a> <span className="token comment"># Function that is called right after the plugin has registered</span><br/>
        │   ├── <a href="#">destroy.ts</a> <span className="token comment"># Function that is called to clean up the plugin after Strapi instance is destroyed</span><br/>
        │   ├── <a href="#">index.ts</a> <span className="token comment"># Loads the code for all the server elements</span> <br />
        │   └── <a href="#">register.ts</a> <span className="token comment"># Function that is called to load the plugin, before bootstrap.</span><br/>
        ├── <a href="#">custom.d.ts</a> <span className="token comment"># Generated types</span><br/>
        ├── package.json<br />
        ├── README.md<br />
        ├── <a href="#">strapi-admin.js</a> <span className="token comment"># Entrypoint for the admin (front-end)</span><br/>
        ├── <a href="#">strapi-server.js</a> <span className="token comment"># Entrypoint for the server (back-end)</span><br/>
        ├── tsconfig.json <span className="token comment"># TypeScript compiler options for the admin panel part</span><br />
        └── tsconfig.server.json <span className="token comment"># TypeScript compiler options for the server part</span><br />
        </code>
      </pre>

      </TabItem>
      </Tabs>
   </div>
  );
}

