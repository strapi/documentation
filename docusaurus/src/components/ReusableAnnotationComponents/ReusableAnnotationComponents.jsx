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
        More details can be found in the <a href="/cms/configurations/plugins">plugins configuration</a> documentation.
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

export function DocumentDefinition() {
  return (
    <Annotation>
      <p>
        A document in Strapi 5 is an API-only concept which represents all the variations of content (for different locales, for the draft and published versions) for a given entry found in the Content Manager.
      </p>
      <p>
        More details can be found in the <a href="/cms/api/document">Documents</a> introduction.
      </p>
    </Annotation>
  )
}

export function Codemods() {
  return (
    <Annotation>
      <p>
        Codemods are automated tools used for large-scale code modifications, especially useful for refactoring, adapting to API changes, or applying coding style updates. They enable precise and programmable alterations to source code.
      </p>
    </Annotation>
  )
}

export function NamingConventions() {
  return (
    <Annotation> 
      Programming uses several naming conventions to format identifiers:
      <ul>
        <li>kebab-case: lowercase words separated by hyphens (e.g., <code>my-component-name</code>)</li>
        <li>camelCase: first word lowercase, subsequent words capitalized (e.g., <code>>myComponentName</code>)</li>
        <li>PascalCase: all words capitalized (e.g., <code>MyComponentName</code>)</li>
        <li>snake_case: lowercase words separated by underscores (e.g., <code>my_component_name</code>)</li>
        <li>SCREAMING_SNAKE_CASE: uppercase words separated by underscores (e.g., `<code>MY_COMPONENT_NAME</code>)</li>
      </ul>
    </Annotation>
  )
}
        
