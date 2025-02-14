---
title: Nuxt
displayed_sidebar: cmsSidebar
description: Integrate Strapi with Nuxt 3.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Nuxt 3

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/cms/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Nuxt 3](https://nuxtjs.org/) remains the same except that you do not fetch the same content.

## Create a Nuxt 3 app

Create a basic Nuxt 3 application with npx package runner

```bash
npx nuxi init nuxt-app
```

## Use an HTTP client

For this example we are using the awesome [@nuxt/strapi](https://strapi.nuxtjs.org/) module and Nuxt helper function [$fetch](https://nuxt.com/docs/api/utils/dollarfetch) (based on `ohmyfetch`). You may choose any of this variants.

<Tabs groupid="@nuxtjs/strapi-fetch">

<TabItem value="@nuxtjs/strapi" label="@nuxtjs/strapi">

```bash
yarn add --dev @nuxtjs/strapi
```

Add `@nuxtjs/strapi` to the module section of `nuxt.config.ts` with the following settings:

```js
modules: ['@nuxtjs/strapi'],
strapi: {
  url: 'http://localhost:1337'
},
```

</TabItem>

<TabItem value="fetch" label="fetch">

No installation needed.

</TabItem>

</Tabs>

## GET Request - get list of entities or one entity

Execute a `GET` request on the `restaurant` collection type in order to fetch your restaurants.

Be sure that you activated the `find` and `findOne` permission for the `restaurant` collection type.

<Tabs groupid="@nuxtjs/strapi-fetch">

<TabItem value="@nuxtjs/strapi" label="@nuxtjs/strapi">

`@nuxtjs/strapi` exposes composables that are auto-imported by Nuxt 3. Note that `delete` function must be renamed because it's reserved word in JavaScript.

<Request title="Example GET request with @nuxtjs/strapi">

```js
<script setup lang="ts">
import type { Restaurant } from '~/types'
const { find, findOne, create, update, delete: remove } = useStrapi()
</script>
```

```js
// Get all restaurants
const response = await find<Restaurant>('restaurants')

// Get one restaurant by id
const response = await findOne<Restaurant>("restaurants", restaurantId)
```

</Request>
</TabItem>

<TabItem value="fetch" label="fetch">

<Request title="Example GET request with $fetch">

```js
// Get all restaurants
const response = $fetch("http://localhost:1337/api/restaurants")

// Get one restaurant by id
const response = await $fetch(`http://localhost:1337/api/restaurants/${restaurantId}`)
```

</Request>
</TabItem>

</Tabs>

<Response title="Example response">

```json
// List of the restaurants
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Biscotte Restaurant",
        "description": "Welcome to Biscotte restaurant! \nRestaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
        "createdAt": "2022-10-29T09:37:55.061Z",
        "updatedAt": "2022-11-07T18:53:27.702Z",
        "publishedAt": "2022-10-29T09:47:48.782Z"
      }
    },
    {
      "id": 2,
      "attributes": {
        "name": "Dolemon Sushi",
        "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious.",
        "createdAt": "2022-10-29T09:37:55.061Z",
        "updatedAt": "2022-11-07T18:53:27.702Z",
        "publishedAt": "2022-10-29T09:47:48.782Z"
      }
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 4 }
  }
}

// One restaurant
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Biscotte Restaurant",
      "description": "Welcome to Biscotte restaurant! \nRestaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
      "createdAt": "2022-10-29T09:37:55.061Z",
      "updatedAt": "2022-11-07T18:53:27.702Z",
      "publishedAt": "2022-10-29T09:47:48.782Z"
    }
  },
  "meta": {}
}

```

</Response>

## POST Request - create new entity

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type.

<Tabs groupid="@nuxtjs/strapi-fetch">

<TabItem value="@nuxtjs/strapi" label="@nuxtjs/strapi">

<Request title="Example POST request with @nuxtjs/strapi">

```js
await create<Restaurant>("restaurants", { 
    name: restaurantName, 
    description: restaurantDescription })
```

</Request>

</TabItem>

<TabItem value="fetch" label="fetch">

<Request title="Example POST request with $fetch">

```js
await $fetch("http://localhost:1337/api/restaurants", {
    method: "POST",
    body: {
      data: {
        name: restaurantName,
        description: restaurantDescription
      }
    }
  })
```

</Request>
</TabItem>

</Tabs>

## PUT Request - update existing entity

Execute a `PUT` request on the `restaurant` collection type in order to update your restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

<Tabs groupid="@nuxtjs/strapi-fetch">

<TabItem value="@nuxtjs/strapi" label="@nuxtjs/strapi">

<Request title="Example PUT request with @nuxtjs/strapi">

```js
await update<Restaurant>("restaurants", restaurantId, { 
    name: restaurantName, 
    description: restaurantDescription })
```

</Request>
</TabItem>

<TabItem value="fetch" label="fetch">

<Request title="Example PUT request with $fetch">

```js
await $fetch(`http://localhost:1337/api/restaurants/${restaurantId}`, {
    method: "PUT",
    body: {
      data: {
        name: restaurantName,
        description: restaurantDescription
      }
    }
  })
```

</Request>
</TabItem>

</Tabs>


## DELETE Request - delete existing entity

Execute a `DELETE` request on the `restaurant` collection type in order to delete your restaurant.

Be sure that you activated the `delete` permission for the `restaurant` collection type.

<Tabs groupid="@nuxtjs/strapi-fetch">

<TabItem value="@nuxtjs/strapi" label="@nuxtjs/strapi">

<Request title="Example DELETE request with @nuxtjs/strapi">

```js
await remove<Restaurant>("restaurants", restaurantId);
```

</Request>
</TabItem>

<TabItem value="fetch" label="fetch">

<Request title="Example DELETE request with $fetch">

```js
await $fetch(`http://localhost:1337/api/restaurants/${restaurantId}`, {
    method: 'DELETE'
  })
```

</Request>
</TabItem>

</Tabs>

### Example

Consider an example of a simple CRUD Nuxt application that implements the functions described above.

<Tabs groupid="@nuxtjs/strapi-fetch">

<TabItem value="@nuxtjs/strapi" label="@nuxtjs/strapi">

`./pages/index.vue`

```html
<template>
  <div>
    <ul>
      <li v-for="restaurant in restaurants?.data" :key="restaurant.id">
        {{ restaurant.attributes.name }}
        <button @click="$router.push(`${$route.path}/restaurant/${restaurant.id}`)">Edit</button>
        <button @click="deleteRestaurant(restaurant.id)">Delete</button>
      </li>
    </ul>
    
    <nuxt-link :to="`${$route.path}/restaurant/create`">Create</nuxt-link>
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/types'
const { find, delete: remove } = useStrapi() // delete is keyword in JS, must not be used
const { data: restaurants, refresh } = await useAsyncData(
  'restaurants',
  () => find<Restaurant>('restaurants')
)

const deleteRestaurant = async (restaurantId: number) => {
  await remove<Restaurant>("restaurants", restaurantId);
  refresh()
};
</script>
```

`./pages/restaurant/create.vue`

```html
<template>
  <div>
    <div><input type="text" v-model="name" /></div>
    <div><textarea v-model="description"></textarea></div>
    <button @click="createRestaurant();$router.go(-1)">Create</button>
    <button @click="$router.go(-1)">Cancel</button>
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from "~/types"
const { create } = useStrapi()
const name = ref("")
const description = ref("")
const createRestaurant = async () => {
  await create<Restaurant>("restaurants", { 
    name: name.value,
    description: description.value
  })
</script>
```

`./pages/restaurant/[id].vue`

```html
<template>
  <div>
    <div><input type="text" v-model="name" /></div>
    <div><textarea v-model="description"></textarea></div>
    <button @click="updateRestaurant();$router.go(-1)">Update</button>
    <button @click="$router.go(-1)">Cancel</button>
    {{ restaurant }}
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/types'
const { findOne, update } = useStrapi()
const route = useRoute()
const restaurantId: number = +route.params.id // cast to number
const response = await findOne<Restaurant>("restaurants", restaurantId)
const name = ref(response.data.attributes.name)
const description = ref(response.data.attributes.description)
const updateRestaurant = async () => {
  await update<Restaurant>("restaurants", restaurantId, { 
    name: name.value,
    description: description.value
  })
}
</script>
```

</TabItem>

<TabItem value="fetch" label="fetch">

`./pages/index.vue`

```html
<template>
  <div>
    <ul>
      <li v-for="restaurant in restaurants.data" :key="restaurant.id">
        {{ restaurant.attributes.name }}
        <button @click="$router.push(`${$route.path}/restaurant/${restaurant.id}`)">Edit</button>
        <button @click="deleteRestaurant(restaurant.id)">Delete</button>
      </li>
    </ul>
    <div v-else>Loading...</div>
    <nuxt-link :to="`${$route.path}/restaurant/create`">Create</nuxt-link>
  </div>
</template>

<script setup>
const { data: restaurants, refresh } = await useAsyncData(
  'restaurants', 
  () => $fetch("http://localhost:1337/api/restaurants")
)

const deleteRestaurant = async (restaurantId) => {
  await $fetch(`http://localhost:1337/api/restaurants/${restaurantId}`, {
    method: 'DELETE'
  })
  refresh()
}
</script>
```

`./pages/restaurant/create.vue`

```html
<template>
  <div>
    <div><input type="text" v-model="restaurant.name" /></div>
    <div><textarea v-model="restaurant.description"></textarea></div>
    <button @click="createRestaurant();$router.go(-1)">Create</button>
    <button @click="$router.go(-1)">Cancel</button>
    {{ restaurant }}
  </div>
</template>
  
<script setup>
const restaurant = ref({ name: "", description: "" })
const createRestaurant = async () => {
  await $fetch("http://localhost:1337/api/restaurants", {
    method: "POST",
    body: {
      data: {
        name: restaurant.value.name,
        description: restaurant.value.description
      }
    }
  })
}
</script>
```

`./pages/restaurant/[id].vue`

```html
<template>
  <div>
    <div><input type="text" v-model="restaurant.name" /></div>
    <div><textarea v-model="restaurant.description"></textarea></div>
    <button @click="updateRestaurant();$router.go(-1)">Update</button>
    <button @click="$router.go(-1)">Cancel</button>
    {{ restaurant }}
  </div>
</template>
  
<script setup>
const route = useRoute()
const response = await $fetch(`http://localhost:1337/api/restaurants/${route.params.id}`)
const restaurant = ref(response.data.attributes)
const updateRestaurant = async () => {
  await $fetch(`http://localhost:1337/api/restaurants/${route.params.id}`, {
    method: "PUT",
    body: {
      data: {
        name: restaurant.value.name,
        description: restaurant.value.description
      }
    }
  })
}
</script>
```

</TabItem>

</Tabs>
