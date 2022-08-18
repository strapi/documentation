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

::: NOTE 
Roles are authenticated by default. 
:::

### Create users

Create **two users** with the following data.

**User 1**

- **username**: author
- **email**: author@strapi.io
- **password**: strapi
- **role**: Author

**User 2**

- **username**: reader
- **email**: reader@strapi.io
- **password**: strapi
- **role**: Reader

## Login as a Reader

To log in as a user with the role of Reader, you must send a **POST** request to the following API route: `/api/auth/local`.

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

The API response contains the **user's JWT** in the `jwt` key.

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

::: NOTE
See the [login documentation](/developer-docs/latest/plugins/users-permissions.md#login) for more information.
:::

### Fetch articles

Fetch the Articles you created earlier by sending a **GET** request to the `/articles` route:

:::: tabs card

::: axios

```js
import axios from 'axios';

const { data } = await axios.get('http://localhost:1337/api/articles');

console.log(data);
```

:::

::: Postman

:::

::::

Here you should receive a **403 error** because you are not allowed, as Public user, to access to the **articles**.

You should use the `JWT` in the request to say that you can access to this data as **Reader user**.

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

And tada you have access to the data.

### Create an Article

To do so, you will have to request the `/api/articles` route in **POST**.

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

If you request this as a **Reader user**, you will receive a **403 error**. It's because the **Reader role** does not have access to the create function of the **Article** Content Type.

To fix that you will have to login with the **Author user** and use its `JWT` into the request to create an **Article**.

With that done, you will be able to create an **Article**.
