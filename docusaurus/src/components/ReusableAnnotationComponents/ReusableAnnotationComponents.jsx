import React from 'react'
import { Annotation } from '../Annotation';

export function PluginsConfigurationFile() {
  return (
    <Annotation>
      <p>
        The plugins configuration file <code>config/plugins.js|ts</code>:
        <ul>
          <li>declares all plugins that are enabled,</li>
          <li>and can be used to pass additional configuration options to some plugins.</li>
        </ul>
      </p>
      <p>
        More details can be found in the <a href="/dev-docs/configurations/plugins">plugins configuration</a> documentation.
      </p>
    </Annotation>
  )
}

export function HeadlessCms() {
  return (
    <Annotation>
      <p>
        A headless CMS is a Content Management System that separates the presentation layer (i.e., the front end, where content is displayed) from the back end (where content is managed).
      </p>
      <p>
        Strapi is a headless CMS that provides:
        <ul>
          <li>a back-end server exposing an API for your content,</li>
          <li>and a graphical user interface, called the admin panel, to manage the content.</li>
        </ul>The presentation layer of your website or application powered by Strapi should be handled by another framework, not by Strapi.
      </p>
    </Annotation>
  )
}
