---
title: Authenticated request - Strapi Developer Docs
description: Learn how you can request the API of your Strapi project as an authenticated user.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/auth-request.html
---

# Authenticated request

Learn how to make API requests as an authenticated user. 

## Introduction

This guide shows you how to assign [roles and permissions](/developer-docs/latest/plugins/users-permissions.md) to multiple users and [authenticate API requests](/developer-docs/latest/plugins/users-permissions.md#authentication) with JSON Web Tokens (JWT).

To demonstrate how roles work, you will create two different roles and grant each role certain permissions. 

**Authors** can fetch, create, and update Articles; **Readers** can only fetch Articles. 

## Project Setup

To follow along, you must have a Strapi project. If you don’t have a Strapi project, run the following command: 

<code-group>

<code-block title="NPM">
```sh
npx create-strapi-app@latest my-project --quickstart
```
</code-block>

<code-block title="YARN">
```sh
yarn create strapi-app my-project --quickstart
```
</code-block>

</code-group>

After creating your Strapi project, you will be redirected to your project’s [admin panel](http://localhost:1337/admin). 

### Create a new Collection Type

Create an **Articles** collection type. 

To create a new collection:
1. In the left sidebar, select **Content-Type Builder**.
2. Select **+ Create new collection type**.
3. In the *Display Name* field, enter “Articles”. 
  a. In the *API ID (Singular)* field, enter “article”.
  b. In the *API ID (Plural)* field, enter “articles”. 
4. Select **Continue**. 
5. Select *Text*. 
6. In the *Name* field, enter “title”, select *Short text*, and select **Finish**.
7. Select **Add another field to this collection type** and select *Rich text*. 
8. In the *Name* field, enter “content” and select **Finish**.
9. Select **Save**.

With your Articles content type ready, create some sample articles: 

1. Go to *Content Manager*.
2. Under *COLLECTION TYPES*, select *Articles*. 
3. Select **+ Create new  entry**.
4. Enter a title and some sample text in the content textbox.
5. Select **Save** and then **Publish**.

### Create Roles and Permissions

Create an Author role and manage its permissions:
1. From the left sidebar, select *Settings*.
2. Under *Users & Permissions Plugin*, select *Roles*.
3. Select **+ Add new role**.
4. In the *Name* field, enter “Author” and enter a **Description** (for example, “User with author permissions”).
5. Select the *Article* content type and **Select All**.
6. Select **Save**.

Create another role called Reader by repeating the steps above, but only select **find** and **findOne** from the Article content type permissions. 

::: note
Roles are authenticated by default. 
:::

### Create users

Create **two users** with the following data.

| **User 1**   | **User Data**       |
|--------------|---------------------|
| **username** | author              |
| **email**    | author@strapi.io    |
| **password** | strapi              |
| **role**     | Author              |

| **User 2**   | **User Data**       |
|--------------|---------------------|
| **username** | reader              |
| **email**    | reader@strapi.io    |
| **password** | strapi              |
| **role**     | Reader              |

## Log in as a Reader

To log in as a user with the role of Reader, send a **POST** request to the `/api/auth/local` API route.

:::: tabs card

::: tab axios

```js
import axios from 'axios';

const { data } = await axios.post('http://localhost:1337/api/auth/local', {
  identifier: 'reader@strapi.io',
  password: 'strapi',
});

console.log(data);
```

:::

::: tab Postman

If you use **Postman**, set the **body** to **raw** and select **JSON** as your data format:

```json
{
  "identifier": "reader@strapi.io",
  "password": "strapi"
}
```

:::

::::
If your request is successful, you will receive the **user's JWT** in the `jwt` key:  

```json
{
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2OTM4MTUwLCJleHAiOjE1Nzk1MzAxNTB9.UgsjjXkAZ-anD257BF7y1hbjuY3ogNceKfTAQtzDEsU",
    "user": {
        "id": 1,
        "username": "reader",
        ...
    }
}
```

Save the `JWT` in your application or copy it to your clipboard. You will use it to make future requests. 

::: note
See the [login documentation](/developer-docs/latest/plugins/users-permissions.md#login) for more information.
:::

### Fetch articles

Fetch the Articles you created earlier by sending a **GET** request to the `/articles` route:

:::: tabs card

::: tab axios

```js
import axios from 'axios';

const { data } = await axios.get('http://localhost:1337/api/articles');

console.log(data);
```

:::

::: tab Postman

```http
GET http://localhost:1337/api/articles
```

:::

::::
Your response will return a `403 Forbidden` error. 

When a user sends an unauthorized request (a request that omits an `Authorization` header), Strapi assigns that user a [Public role](https://docs.strapi.io/developer-docs/latest/plugins/users-permissions.html#public-role) by default.

To authenticate a user’s request, use the bearer authentication scheme by including an `Authorization` header signed with the user’s JWT ( `Bearer [JWT Token]`):  

```js
import axios from 'axios';

const { data } = await axios.get('http://localhost:1337/api/articles', {
  headers: {
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2OTM4MTUwLCJleHAiOjE1Nzk1MzAxNTB9.UgsjjXkAZ-anD257BF7y1hbjuY3ogNceKfTAQtzDEsU',
  },
});

console.log(data);
```

With your bearer token included in the `Authorization` header, you will receive a `Status: 200 OK` response and a payload containing your articles. 

### Create an Article

Now, create an Article by sending a **POST** request to the `/api/articles` route: 

:::: tabs card

::: tab axios 

```js
import axios from 'axios';

const { data } = await axios.post(
      'http://localhost:1337/api/articles',
      {
        data: {
          title: 'my article',
          content: 'my super article content',
        }
      },
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2OTM4MTUwLCJleHAiOjE1Nzk1MzAxNTB9.UgsjjXkAZ-anD257BF7y1hbjuY3ogNceKfTAQtzDEsU',
        },
      }
    );

    console.log(data);
```

:::

::: tab Postman

```json
{
  "data": {
    "title": "my article",
    "content": "my super article content"
    }
}
```

:::

::::

You will receive a `403 Forbidden` response because you made this request as a user with the role Reader.

Only users with the role Author can create Articles. Sign in with the Author user credentials to receive your JWT. Then, send the **POST** request to the `/articles` endpoint by including the JWT in the `Authorization` header. 

You will receive a `200 OK` response and see your new article in the payload.
