---
title: Requests and Responses 
description: Learn more about requests and responses for Strapi, the most popular headless CMS.

---

# Requests and Responses

The Strapi back end server is based on [Koa](https://koajs.com/). When you send requests through the [REST API](/dev-docs/api/rest), a context object (`ctx`) is passed to every element of the Strapi back end (e.g., [policies](/dev-docs/backend-customization/policies), [controllers](/dev-docs/backend-customization/controllers), [services](/dev-docs/backend-customization/services)) and contains all the request-related information and a list of values and functions useful to manage server responses.

:::info
In addition to the concepts and parameters described in the following documentation, you might find additional information in the [Koa request documentation](http://koajs.com/#request), [Koa Router documentation](https://github.com/koajs/router/blob/master/API.md) and [Koa response documentation](http://koajs.com/#response).
:::

`ctx` includes 3 main objects:

- [`ctx.request`](#ctxrequest) for information about the request sent by the client making an API request,
- [`ctx.state`](#ctxstate) for information about the state of the request within the Strapi back end,
- and [`ctx.response`](#ctxresponse) for information about the response that the server will return.

## `ctx.request`

The `ctx.request` object contains the following parameters:

| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| `ctx.request.body`| Parsed version of the body. | `Object` |
| `ctx.request.files`| Files sent with the request. | `Array` |
| `ctx.request.headers`| Headers sent with the request. | `Object` |
| `ctx.request.host`| Host part of the URL, including the port. | `String` |
| `ctx.request.hostname`| Host part of the URL, excluding the port. | `String` |
| `ctx.request.href`| Complete URL of the requested resource, including the protocol, domain, port (if specified), path, and query parameters. | `String` |
| `ctx.request.ip`| IP of the person sending the request.| `String` |
| `ctx.request.ips`| When `X-Forwarded-For` is present and `app.proxy` is enabled, an array of IPs is returned, ordered from upstream to downstream. <br /><br />For example if the value were "client, proxy1, proxy2", you would receive the `["client", "proxy1", "proxy2"]` array. | `Array` |
| `ctx.request.method`| Request method (e.g., `GET`, `POST`). | `String` |
| `ctx.request.origin`| URL part before the first `/`. | `String` |
| `ctx.request.params`| Query parameters sent in the URL.<br /><br/>For example, if the request URL includes includes something like `/restaurants?:id`, the `:id` part creates an `id` parameter accessible through `ctx.request.params.id`. | `Object` |
| `ctx.request.path`| Only the path of the requested resource, excluding the query parameters. | `String` |
| `ctx.request.protocol`| Protocol being used (e.g., `https` or `http`). | `String` |
| `ctx.request.subdomains`| Subdomains.<br /><br />For example, if the domain is `tobi.ferrets.example.com`, the value is the following array `["ferrets", "tobi"]`. | `Array` |
| `ctx.request.url`| Path and query parameters of the requested resource, excluding the protocol, domain, and port. | `String` |

<details>
<summary>Differences between protocol, origin, url, href, path, host, and hostname:</summary>

Given an API request sent to the `https://example.com:1337/api/restaurants?id=123` URL, here is what different parameters of the `ctx.request` object return:

| Parameter  | Returned value                                    |
| ---------- | ------------------------------------------------- |
| `ctx.request.href`     | `https://example.com:1337/api/restaurants?id=123` |
| `ctx.request.protocol` | `https`                                           |
| `ctx.request.host`     | `localhost:1337`                                  |
| `ctx.request.hostname` | `localhost`                                       |
| `ctx.request.origin`   | `https://example.com:1337`                          |
| `ctx.request.url`      | `/api/restaurants?id=123`                         |
| `ctx.request.path`     | `/api/restaurants`                                |

</details>

<!-- ### `ctx.request.query`
| Parameter | Description                                                                                  | Type     |
| ----------| -------------------------------------------------------------------------------------------- | -------- |
| <a name="ctx.request.query" href="#ctx.request.query" class="anchor">`ctx.request.query`<br/> `ctx.query`| [API parameters](../api/rest/parameters) can be used with the REST API to filter, sort, and paginate results and to select fields and relations to populate  | `Object` |
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
| <a name="ctx.state.info.type" href="#ctx.state.info.type" class="anchor">`ctx.state.info.type`</a>| the type of the used api | `String` | -->

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
