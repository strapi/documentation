---
title: Sapper
displayed_sidebar: devDocsSidebar
description: Integrate Strapi with Sapper.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Sapper

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start). You should be able to consume the API by browsing the URL[ http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Sapper](https://sapper.svelte.dev) remains the same except that you do not fetch the same content.

## Create a Sapper app

First, install Degit by running `npm install -g degit` in your command-line interface (CLI).

“Degit makes copies of Git repositories and fetches the latest commit in the repository. This is a more efficient approach than using git clone, because we’re not downloading the entire Git history.”

Create a basic Sapper application using webpack:

```bash
npx degit "sveltejs/sapper-template#webpack" sapper-app
```

## Use an HTTP client

Many HTTP clients are available but in this documentation we'll use [Axios](https://github.com/axios/axios) and [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).


<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

```bash
yarn add axios
```

</TabItem>

<TabItem value="fetch" label="fetch">

No installation needed

</TabItem>

</Tabs>

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

<Request title="Example GET request with axios">

```js
import axios from 'axios';

axios.get('http://localhost:1337/api/restaurants').then(response => {
  console.log(response);
});
```
</Request>
</TabItem>

<TabItem value="fetch" label="fetch">

<Request title="Example GET request with fetch">

```js
fetch('http://localhost:1337/api/restaurants', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => response.json())
  .then(data => console.log(data));
```

</Request>
</TabItem>

</Tabs>

<Response title="Example response">

```json
[
  {
    "id": 1,
    "name": "Biscotte Restaurant",
    "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
    "created_by": {
      "id": 1,
      "firstname": "Paul",
      "lastname": "Bocuse",
      "username": null
    },
    "updated_by": {
      "id": 1,
      "firstname": "Paul",
      "lastname": "Bocuse",
      "username": null
    },
    "created_at": "2020-07-31T11:37:16.964Z",
    "updated_at": "2020-07-31T11:37:16.975Z",
    "categories": [
      {
        "id": 1,
        "name": "French Food",
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2020-07-31T11:36:23.164Z",
        "updated_at": "2020-07-31T11:36:23.172Z"
      }
    ]
  }
]
```

</Response>

### Example

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

`./src/routes/index.svelte`

```js
<script>
import { onMount } from 'svelte';
import axios from 'axios'

let restaurants = [];
let error = null

onMount(async () => {
	try {
		const res = await axios.get('http://localhost:1337/api/restaurants');
		restaurants = res.data
	} catch (e) {
		error = e
	}
});

</script>

{#if error !== null}
  {error}
{:else}
  <ul>
  {#each restaurants as restaurant}
    <li>
  		{restaurant.name}
    </li>
  {/each}
  </ul>
{/if}
```


</TabItem>

<TabItem value="fetch" label="fetch">

`./src/routes/index.svelte`

```js
<script>
import { onMount } from 'svelte';

let restaurants = [];
let error = null

onMount(async () => {
	const parseJSON = (resp) => (resp.json ? resp.json() : resp);
	const checkStatus = (resp) => {
    if (resp.status >= 200 && resp.status < 300) {
      return resp;
    }
    return parseJSON(resp).then((resp) => {
      throw resp;
    });
  };
  const headers = {
    'Content-Type': 'application/json',
  };

	try {
		const res = await fetch("http://localhost:1337/api/restaurants", {
		  method: "GET",
		  headers: {
		     'Content-Type': 'application/json'
		  },
		}).then(checkStatus)
      .then(parseJSON);
		restaurants = res
	} catch (e) {
		error = e
	}
});
</script>

{#if error !== null}
  {error}
{:else}
  <ul>
  {#each restaurants as restaurant}
    <li>
  		{restaurant.name}
    </li>
  {/each}
  </ul>
{/if}
```

</TabItem>

</Tabs>

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission fot the `category` Collection type.

In this example a `japanese` category has been created which has the id: 3.

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

<Request title="Example POST request with axios">

```js
import axios from 'axios';

axios
  .post('http://localhost:1337/api/restaurants', {
    name: 'Dolemon Sushi',
    description: 'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious',
    categories: [3],
  })
  .then(response => {
    console.log(response);
  });
```

</Request>
</TabItem>

<TabItem value="fetch" label="fetch">

<Request title="Example POST request with fetch">

```js
fetch('http://localhost:1337/api/restaurants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Dolemon Sushi',
    description: 'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious',
    categories: [3],
  }),
})
  .then(response => response.json())
  .then(data => console.log(data));
```
</Request>
</TabItem>

</Tabs>

<Response title="Example response">

```json
{
  "id": 2,
  "name": "Dolemon Sushi",
  "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
  "created_by": null,
  "updated_by": null,
  "created_at": "2020-08-04T09:57:11.669Z",
  "updated_at": "2020-08-04T09:57:11.669Z",
  "categories": [
    {
      "id": 3,
      "name": "Japanese",
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2020-07-31T11:36:23.164Z",
      "updated_at": "2020-07-31T11:36:23.172Z"
    }
  ]
}
```

</Response>

### Example

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

`./src/routes/index.svelte`

```js
<script>
import { onMount } from 'svelte';
import axios from 'axios'

let allCategories = [];
let restaurantName = "";
let restaurantDescription = "";
let restaurantCategories = [];
let error = null;

async function handleSubmit() {
	try {
		const response = await axios.post('http://localhost:1337/api/restaurants', {
			name: restaurantName,
			description: restaurantDescription,
			categories: restaurantCategories
		});
		console.log(response);
	} catch(e) {
		error = e
	}
}

onMount(async () => {
	try {
		const response = await axios.get('http://localhost:1337/api/categories');
		allCategories = response.data
	} catch(e) {
		error = e
	}
});

</script>

{#if error !== null}
  {error}
{:else}
	<label for="name">Name</label>
	<input id="name" bind:value={restaurantName} type="text" name="name">

	<label for="description">Description</label>
	<input id="description" bind:value={restaurantDescription} type="text" name="description">

	<div>
		<br />
		Select categories
		<br />
		{#each allCategories as category}
			<label>{ category.name }</label>
		  <input type="checkbox" bind:group={restaurantCategories} value={category} />
		{/each}
	</div>

	<input type="submit" value="Submit" on:click={handleSubmit} />
{/if}

```

</TabItem>

<TabItem value="fetch" label="fetch">

`./src/routes/index.svelte`

```js
<script>
import { onMount } from 'svelte';
import axios from 'axios'

let allCategories = [];
let restaurantName = "";
let restaurantDescription = "";
let restaurantCategories = [];
let error = null;

const parseJSON = (resp) => (resp.json ? resp.json() : resp);

const checkStatus = (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }
  return parseJSON(resp).then((resp) => {
    throw resp;
  });
};
const headers = {
  'Content-Type': 'application/json',
};

async function handleSubmit() {
	try {
		await fetch('http://localhost:1337/api/restaurants', {
			method: "POST",
			headers: headers,
			body: JSON.stringify({
				name: restaurantName,
				description: restaurantDescription,
				categories: restaurantCategories
			})
		})
		.then(checkStatus)
		.then(parseJSON);
	} catch (e) {
		error = e
	}
}

onMount(async () => {
	try {
		const res = await fetch("http://localhost:1337/api/categories", {
			method: "GET",
			headers: headers,
		}).then(checkStatus)
			.then(parseJSON);
			allCategories = res
	} catch (e) {
		error = e
	}
});

</script>

{#if error !== null}
  {error}
{:else}
	<label for="name">Name</label>
	<input id="name" bind:value={restaurantName} type="text" name="name">

	<label for="description">Description</label>
	<input id="description" bind:value={restaurantDescription} type="text" name="description">

	<div>
		<br />
		Select categories
		<br />
		{#each allCategories as category}
			<label>{ category.name }</label>
		  <input type="checkbox" bind:group={restaurantCategories} value={category} />
		{/each}
	</div>

	<input type="submit" value="Submit" on:click={handleSubmit} />
{/if}
```

</TabItem>

</Tabs>

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

<Request title="Example PUT request with axios">

```js
import axios from 'axios';

axios
  .put('http://localhost:1337/api/restaurants/2', {
    categories: [2],
  })
  .then(response => {
    console.log(response);
  });
```

</Request>

</TabItem>

<TabItem value="fetch" label="fetch">

<Request title="Example PUT request with fetch">

```js
fetch('http://localhost:1337/api/restaurants/2', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    categories: [2],
  }),
})
  .then(response => response.json())
  .then(data => {
    console.log(data);
  });
```
</Request>

</TabItem>

</Tabs>

<Response title="Example response">

```json
{
  "id": 2,
  "name": "Dolemon Sushi",
  "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
  "created_by": null,
  "updated_by": null,
  "created_at": "2020-08-04T10:21:30.219Z",
  "updated_at": "2020-08-04T10:21:30.219Z",
  "categories": [
    {
      "id": 2,
      "name": "Brunch",
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2020-08-04T10:24:26.901Z",
      "updated_at": "2020-08-04T10:24:26.911Z"
    }
  ]
}
```

</Response>
