---
title: Requests and Responses 
description: Learn more about requests and responses for Strapi, the most popular headless CMS.

---

import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'

# Requests & Responses

<FeedbackCallout components={props.components}/>

## Requests

The context object (`ctx`) contains all the requests related information. They are accessible through `ctx.request`, from [controllers](/dev-docs/backend-customization/controllers.md) and [policies](/dev-docs/backend-customization/policies.md).

Strapi passes the `body` on `ctx.request.body`, `query` on `ctx.request.query`, `params` on `ctx.request.params` and `files` through `ctx.request.files`

For more information, please refer to the [Koa request documentation](http://koajs.com/#request) and [Koa Router documentation](https://github.com/koajs/router/blob/master/API.md).

## Responses

The context object (`ctx`) contains a list of values and functions useful to manage server responses. They are accessible through `ctx.response`, from [controllers](/dev-docs/backend-customization/controllers.md) and [policies](/dev-docs/backend-customization/policies.md).

For more information, please refer to the [Koa response documentation](http://koajs.com/#response).

## CTX Table

### `ctx`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx" href="#ctx" class="anchor">`ctx`</a> | Ctx is the context object that is given to every layer within strapi         | `Object` |

### `ctx.request`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
|  <a name="ctx.request" href="#ctx.request" class="anchor">`ctx.request`</a>| The request you got from the client that did an api request. | `Object` |
| <a name="ctx.request.body" href="#ctx.request.body" class="anchor">`ctx.request.body`</a>| Parsed version of the body | `Object` |
| <a name="ctx.request.params" href="#ctx.request.params" class="anchor">`ctx.request.params`</a>| The params send in the url. Example `/${info.pluralName}/:id` then the `:id` part would create a param named id. To get the example parm you would do `ctx.request.params.id`. | `Object` |
| <a name="ctx.request.files" href="#ctx.request.files" class="anchor">`ctx.request.files`</a>| the files send with the request. | `Array` |
| <a name="ctx.request.headers" href="#ctx.request.headers" class="anchor">`ctx.request.headers`</a>| All headers send with the request. | `Object` |
| <a name="ctx.request.url" href="#ctx.request.url" class="anchor">`ctx.request.url`</a>| Gives you back the url from the first `/`. | `String` |
| <a name="ctx.request.origin" href="#ctx.request.origin" class="anchor">`ctx.request.origin`</a>| Gives you back the url without the / and everything behind it. | `String` |
| <a name="ctx.request.href" href="#ctx.request.href" class="anchor">`ctx.request.href`</a>| Gives you back the full url excluding the params. | `String` |
| <a name="ctx.request.method" href="#ctx.request.method" class="anchor">`ctx.request.method`</a>| Gives you back the method examples of methods are `GET` or `POST`. | `String` |
| <a name="ctx.request.path" href="#ctx.request.path" class="anchor">`ctx.request.path`</a>| Gives you back the full url. | `String` |
| <a name="ctx.request.host" href="#ctx.request.host" class="anchor">`ctx.request.host`</a>| Only gives the host part of the url. | `String` |
| <a name="ctx.request.host" href="#ctx.request.host" class="anchor">`ctx.request.host`</a>| Only gives the host part of the url without the port | `String` |
| <a name="ctx.request.host" href="#ctx.request.host" class="anchor">`ctx.request.host`</a>| Protocol being used examples: `https` or `http`. | `String` |
| <a name="ctx.request.ips" href="#ctx.request.ips" class="anchor">`ctx.request.ips`</a>| When `X-Forwarded-For` is present and app.proxy is enabled an array of these ips is returned, ordered from upstream -> downstream. For example if the value were "client, proxy1, proxy2", you would receive the array ["client", "proxy1", "proxy2"]. | `Array` |
| <a name="ctx.request.ips" href="#ctx.request.ip" class="anchor">`ctx.request.ip`</a>| IP of the person who send the request.| `String` |
| <a name="ctx.request.subdomains" href="#ctx.request.subdomains" class="anchor">`ctx.request.subdomains`</a>| For example, if the domain is "tobi.ferrets.example.com": it is ["ferrets", "tobi"]. | `Array` |

### `ctx.request.query`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.request.query" href="#ctx.request.query" class="anchor">`ctx.request.query`<br/> `ctx.query`</a>| [API parameters](../api/rest/parameters) can be used with the REST API to filter, sort, and paginate results and to select fields and relations to populate  | `Object` |
| <a name="ctx.request.query.sort" href="#ctx.request.query.sort" class="anchor">`ctx.request.query.sort` </a> | [Sort the response](/dev-docs/api/rest/sort-pagination.md#sorting) | `String` <br/>`Array` |
| <a name="ctx.request.query.filters" href="#ctx.request.query.filters" class="anchor">`ctx.request.query.filters`</a>          | [Filter the response](/dev-docs/api/rest/filters-locale-publication#filtering) | `Object`        |
| <a name="ctx.request.query.populate" href="#ctx.request.query.populate" class="anchor">`ctx.request.query.populate` </a>         |  [Populate relations, components, or dynamic zones](/dev-docs/api/rest/populate-select#population) | `String` <br/> `Object` |
| <a name="ctx.request.query.fields" href="#ctx.request.query.fields" class="anchor">`ctx.request.query.fields` </a>           | [Select only specific fields to display](/dev-docs/api/rest/populate-select#field-selection) | `Array`         |
| <a name="ctx.request.query.pagination" href="#ctx.request.query.pagination" class="anchor">`ctx.request.query.pagination` </a>       |  [Page through entries](/dev-docs/api/rest/sort-pagination.md#pagination) | `Object`       |
| <a name="ctx.request.query.publicationState" href="#ctx.request.query.publicationState" class="anchor">`ctx.request.query.publicationState`  </a>| [Select the Draft & Publish state](/dev-docs/api/rest/filters-locale-publication#publication-state)<br/><br/>Only accepts the following values:<ul><li>`live`(default)</li><li>`preview`</li></ul> | `String`        |
| <a name="ctx.request.query.locale" href="#ctx.request.query.locale" class="anchor">`ctx.request.query.locale`  </a>          | [Select one or multiple locales](/dev-docs/api/rest/filters-locale-publication#locale) | `String` <br/> `Array`  |

### `ctx.response`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.response" href="#ctx.response" class="anchor">`ctx.response` </a>| The response the server will give back | `Object` |
| <a name="ctx.response.body" href="#ctx.response.body" class="anchor">`ctx.response.body` </a>| The body of the response | `Any` |
| <a name="ctx.response.status" href="#ctx.response.status" class="anchor">`ctx.response.status`</a> | the status code of the response | `Integer` |
| <a name="ctx.response.message" href="#ctx.response.message" class="anchor">`ctx.response.message` </a>| Get response status message. By default, response.message is associated with response.status. | `String` |
| <a name="ctx.response.header" href="#ctx.response.header" class="anchor">`ctx.response.header` <br/> `ctx.response.headers` </a>| The headers of the response | `Object` |
| <a name="ctx.response.length" href="#ctx.response.length" class="anchor">`ctx.response.length` </a>| Return response Content-Length as a number when present, or deduce from ctx.body when possible, or undefined. | `Integer` |
| <a name="ctx.response.redirect" href="#ctx.response.redirect" class="anchor">`ctx.response.redirect` </a>| `ctx.response.redirect(url, [alt])` Perform a [302] redirect to url. The string "back" is special-cased to provide Referrer support, when Referrer is not present alt or "/" is used. Example: `ctx.response.redirect('back', '/index.html');` | `Function` |
| <a name="ctx.response.attachment" href="#ctx.response.attachment" class="anchor">`ctx.response.attachment` </a>| `ctx.response.attachment([filename], [options])`
Set Content-Disposition to "attachment" to signal the client to prompt for download. Optionally specify the filename of the download and some [options](https://github.com/jshttp/content-disposition#options). | `Function` |
| <a name="ctx.response.type" href="#ctx.response.type" class="anchor">`ctx.response.type`</a>| Get response Content-Type void of parameters such as "charset". | `String` |
| <a name="ctx.response.lastModified" href="#ctx.response.lastModified" class="anchor">`ctx.response.lastModified`</a>| Return the Last-Modified header as a Date, if it exists. | `DateTime` |
| <a name="ctx.response.etag" href="#ctx.response.etag" class="anchor">`ctx.response.etag`</a>| Set the ETag of a response including the wrapped "s. Note that there is no corresponding response.etag getter. | `String` |

### `ctx.state`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.state" href="#ctx.state" class="anchor">`ctx.state` </a>| the strapi state of the request | `Object` |
| <a name="ctx.state.isAuthenticated" href="#ctx.state.isAuthenticated" class="anchor">`ctx.state.isAuthenticated`</a>| Tells you if the current user is authenticated in any way | `Boolean` |

### `ctx.state.user`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.state.user" href="#ctx.state.user" class="anchor">`ctx.state.user`</a>| Normal user object where all fields are there but only role relation is populated | `Object` |
| <a name="ctx.state.user.role" href="#ctx.state.user.role" class="anchor">`ctx.state.user.role`</a>| The users role | `Object` |

### `ctx.state.auth`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.state.auth" href="#ctx.state.auth" class="anchor">`ctx.state.auth`</a>| the auth object | `Object` |
| <a name="ctx.state.auth.strateg" href="#ctx.state.auth.strateg" class="anchor">`ctx.state.auth.strategy`</a>| the object of the currently used strategy | `Object` |
| <a name="ctx.state.auth.strategy.name" href="#ctx.state.auth.strategy.name" class="anchor">`ctx.state.auth.strategy.name`</a>| the name of the currently used strategy | `String` |

### `ctx.state.route`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.state.route" href="#ctx.state.route" class="anchor"> `ctx.state.route`</a>| the object with all the information of the current route | `Object` |
| <a name="ctx.state.route.method" href="#ctx.state.route.method" class="anchor"> `ctx.state.route.method`</a>| method of the current route | `String` |
| <a name="ctx.state.route.path" href="#ctx.state.route.path" class="anchor">`ctx.state.route.path`</a>| path of the current route | `String` |
| <a name="ctx.state.route.config" href="#ctx.state.route.config" class="anchor">`ctx.state.route.config`</a>| All configuration of the route | `Object` |

### `ctx.state.info`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.state.info" href="#ctx.state.info" class="anchor">`ctx.state.info`</a>| The info object | `Object` |
| <a name="ctx.state.info.apiName" href="#ctx.state.info.apiName" class="anchor">`ctx.state.info.apiName`</a>| The name of the used api  | `String` |
| <a name="ctx.state.info.type" href="#ctx.state.info.type" class="anchor">`ctx.state.info.type`</a>| the type of the used api | `String` |

## Accessing the request context anywhere

:::callout ✨ New in v4.3.9
The `strapi.requestContext` works with Strapi v4.3.9+.
:::

Strapi exposes a way to access the current request context from anywhere in the code (e.g. lifecycle functions).

You can access the request as follows:

```js
const ctx = strapi.requestContext.get();
```

You should only use this inside of functions that will be called in the context of an HTTP request.

```js
// correct

const service = {
  myFunction() {
    const ctx = strapi.requestContext.get();
    console.log(ctx.state.user);
  },
};

// incorrect
const ctx = strapi.requestContext.get();

const service = {
  myFunction() {
    console.log(ctx.state.user);
  },
};
```

**Example:**

```js title="./api/test/content-types/article/lifecycles.js"

module.exports = {
  beforeUpdate() {
    const ctx = strapi.requestContext.get();

    console.log('User info in service: ', ctx.state.user);
  },
};
```

:::note
Strapi uses a Node.js feature called [AsyncLocalStorage](https://nodejs.org/docs/latest-v16.x/api/async_context.html#class-asynclocalstorage) to make the context available anywhere.
:::
