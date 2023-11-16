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
        . <span className="token comment"># root of the plugin folder</span><br/>
        ├── <a href="#">admin</a> <span className="token comment">// Front-end of your plugin.</span><br/>
        │   └── src<br />
        │       ├── <a href="#">components</a> <span className="token comment">// Contains your front-end components.</span><br/>
        │       │   ├── Initializer<br/>
        │       │   │   └── <a href="#">index.js</a> <span className="token comment">// Plugin initializer.</span><br/>
        │       │   └── PluginIcon<br/>
        │       │       └── <a href="#">index.js</a> <span className="token comment">// Contains the icon of your plugin in the main navigation.</span><br/>
        │       ├── <a href="#">pages</a> <span className="token comment">// Contains the pages of your plugin.</span><br/>
        │       │   ├── App <br />
        │       │   │   └── <a href="#">index.js</a> <span className="token comment">// Skeleton around the actual pages.</span><br/>
        │       │   └── HomePage <br />
        │       │       └── <a href="#">index.js</a> <span className="token comment">// Homepage of your plugin.</span><br/>
        │       ├── <a href="#">translations</a> <span className="token comment">// Translations files to make your plugin i18n friendly</span><br/>
        │       │   ├── <a href="#">en.json</a><br/>
        │       │   └── <a href="#">fr.json</a><br/>
        │       └── <a href="#">utils</a><br/>
        │       │   └── <a href="#">getTrad.js</a> <span className="token comment">// getTrad function to return the corresponding plugin translations</span><br/>
        │       ├── <a href="#">index.js</a> <span className="token comment">// Main configurations of your plugin.</span><br/>
        │       └── <a href="#">pluginId.js</a> <span className="token comment">// pluginId variable computed from package.json name.</span><br/>
        ├── <a href="#">server</a> <span className="token comment">// Back-end of your plugin</span><br/>
        │   ├── <a href="#">bootstrap.js</a> <span className="token comment">// Function that is called right after the plugin has registered.</span><br/>
        │   ├── <a href="#">config</a><br/>
        │   │   └── <a href="#">index.js</a> <span className="token comment">// Contains the default server configuration.</span><br/>
        │   ├── <a href="#">controllers</a><br/>
        │   │   ├── <a href="#">index.js</a> <span className="token comment">// File that loads all your controllers</span><br/>
        │   │   └── <a href="#">my-controller.js</a> <span className="token comment">// Default controller, you can rename/delete it</span><br/>
        │   ├── <a href="#">destroy.js</a> <span className="token comment">// Function that is called to clean up the plugin after Strapi instance is destroyed</span><br/>
        │   ├── <a href="#">index.js</a><br/>
        │   ├── <a href="#">register.js</a> <span className="token comment">// Function that is called to load the plugin, before bootstrap.</span><br/>
        │   ├── <a href="#">routes</a><br/>
        │   │   └── <a href="#">index.js</a> <span className="token comment">// Plugin routes, you can update/delete it</span><br/>
        │   └── <a href="#">services</a><br/>
        │       ├── <a href="#">index.js</a> <span className="token comment">// File that loads all your services</span><br/>
        │       └── <a href="#">my-service.js</a> <span className="token comment">// Default services, you can rename/delete it</span><br/>
        ├── <a href="#">strapi-admin.js</a> <span className="token comment">// Entrypoint for the admin (front-end)</span><br/>
        └── <a href="#">strapi-server.js</a> <span className="token comment">// Entrypoint for the server (back-end)</span><br/>
        ├── README.md<br />
        ├── <a href="#">package.json</a><br/>

        </code>
      </pre>

      </TabItem>

      <TabItem title="TypeScript-based projects" value="TypeScript-based projects">

      The following diagram is interactive: you can click on any file or folder name highlighted in purple to go to the corresponding documentation page.<br /><br />

      <pre className="prism-code">
        <code>
        . <span className="token comment"># root of the plugin folder</span><br/>
        ├── <a href="#">admin</a> <span className="token comment">// Front-end of your plugin.</span><br/>
        │   └── src<br />
        │       ├── <a href="#">components</a> <span className="token comment">// Contains your front-end components.</span><br/>
        │       │   ├── Initializer<br />
        │       │   │   └── <a href="#">index.tsx</a> <span className="token comment">// Plugin initializer.</span><br/>
        │       │   └── PluginIcon<br />
        │       │       └── <a href="#">index.tsx</a> <span className="token comment">// Contains the icon of your plugin in the main navigation.</span><br/>
        │       ├── <a href="#">pages</a> <span className="token comment">// Contains the pages of your plugin.</span><br/>
        │       │   ├── App <br />
        │       │   │   └── <a href="#">index.tsx</a> <span className="token comment">// Skeleton around the actual pages.</span><br/>
        │       │   └── HomePage <br />
        │       │       └── <a href="#">index.tsx</a> <span className="token comment">// Homepage of your plugin.</span><br/>
        │       ├── <a href="#">translations</a> <span className="token comment">// Translations files to make your plugin i18n friendly</span><br/>
        │       │   ├── <a href="#">en.json</a><br/>
        │       │   └── <a href="#">fr.json</a><br/>
        │       ├── <a href="#">utils</a><br/>
        │       │   └── <a href="#">getTrad.ts</a> <span className="token comment">// getTrad function to return the corresponding plugin translations</span><br/>
        │       ├── <a href="#">index.tsx</a> <span className="token comment">// Main configurations of your plugin.</span><br/>
        │       └── <a href="#">pluginId.tsx</a> <span className="token comment">// pluginId variable computed from package.json name.</span><br/>
        ├── dist <span className="token comment"># build of the backend</span><br/>
        ├── <a href="#">server</a> <span className="token comment">// Back-end of your plugin</span><br/>
        │   ├── <a href="#">config</a><br/>
        │   │   └── <a href="#">index.ts</a> <span className="token comment">// Contains the default server configuration.</span><br/>
        │   ├── <a href="#">content-types</a> <span className="token comment">// Contains the content-types of your plugin</span><br/>
        │   │   └──  <a href="#">index.ts</a> <span className="token comment">// File that loads all your controllers</span><br/>
        │   ├── <a href="#">controllers</a><br/>
        │   │   ├── <a href="#">index.ts</a> <span className="token comment">// File that loads all your controllers</span><br/>
        │   │   └── <a href="#">my-controller.ts</a> <span className="token comment">// Default controller, you can rename/delete it</span><br/>
        │   ├── <a href="#">middlewares</a><br/>
        │   │   └── <a href="#">index.tsx</a> <span className="token comment">// Plugin middlewares, you can update/delete it</span><br/>
        │   ├── <a href="#">policies</a><br/>
        │   │   └── <a href="#">index.tsx</a> <span className="token comment">// Plugin policies, you can update/delete it</span><br/>
        │   ├── <a href="#">routes</a><br/>
        │   │   └── <a href="#">index.ts</a> <span className="token comment">// Plugin routes, you can update/delete it</span><br/>
        │   └── <a href="#">services</a><br/>
        │   │   ├── <a href="#">index.ts</a> <span className="token comment">// File that loads all your services</span><br/>
        │   │   └── <a href="#">my-service.ts</a> <span className="token comment">// Default services, you can rename/delete it</span><br/>
        │   ├── <a href="#">bootstrap.ts</a> <span className="token comment">// Function that is called right after the plugin has registered.</span><br/>
        │   ├── <a href="#">destroy.ts</a> <span className="token comment">// Function that is called to clean up the plugin after Strapi instance is destroyed</span><br/>
        │   ├── <a href="#">index.ts</a><br/>
        │   └── <a href="#">register.ts</a> <span className="token comment">// Function that is called to load the plugin, before bootstrap.</span><br/>
        └── <a href="#">custom.d.ts</a> <span className="token comment">// Generated types</span><br/>
        ├── package.json<br />
        ├── README.md<br/>
        ├── <a href="#">strapi-admin.js</a> <span className="token comment">// Entrypoint for the admin (front-end)</span><br/>
        ├── <a href="#">strapi-server.js</a> <span className="token comment">// Entrypoint for the server (back-end)</span><br/>
        ├── tsconfig.json<br/>
        ├── tsconfig.server.json<br/>
        └── yarn.lock<br/>

        </code>
      </pre>

      </TabItem>
      </Tabs>
   </div>
  );
}

