---
title: Next.js
displayed_sidebar: cmsSidebar
description: Integrate Strapi with Next.js.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Next.js

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Next.js](https://nextjs.org/) remains the same except that you do not fetch the same content.

## Create a Next.js app

Create a basic Next.js application.

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn create next-app nextjs-app
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npx create-next-app nextjs-ap
```

</TabItem>

</Tabs>

## Use an HTTP client

Many HTTP clients are available but in this documentation we'll use [Axios](https://github.com/axios/axios) and [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

```bash
yarn add axios
```

</TabItem>

<TabItem value="fetch" label="fetch">

```bash
No installation needed.

```

</TabItem>

</Tabs>

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

<Request title="Example GET request with axios">

```js
import axios from 'axios';

axios.get('http://localhost:1337/api/restaurants').then(response => {
  console.log(response.data);
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
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Biscotte Restaurant",
        "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
        "createdAt": "2022-07-31T09:14:12.569Z",
        "updatedAt": "2022-07-31T09:14:12.569Z",
        "publishedAt": "2022-07-31T09:14:12.569Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

</Response>

### Example

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

`./pages/index.js`

```js
import axios from 'axios';

const Home = ({ restaurants, error }) => {
  if (error) {
    return <div>An error occured: {error.message}</div>;
  }
  return (
    <ul>
      {restaurants.data.map(restaurant => (
        <li key={restaurant.id}>{restaurant.attributes.Name}</li>
      ))}
    </ul>
  );
};

Home.getInitialProps = async ctx => {
  try {
    const res = await axios.get('http://localhost:1337/api/restaurants');
    const restaurants = res.data;
    return { restaurants };
  } catch (error) {
    return { error };
  }
};

export default Home;
```

</TabItem>

<TabItem value="fetch" label="fetch">

`./pages/index.js`

```js
const Home = ({ restaurants, error }) => {
  if (error) {
    return <div>An error occured: {error.message}</div>;
  }
  return (
    <ul>
      {restaurants.data.map(restaurant => (
        <li key={restaurant.id}>{restaurant.attributes.Name}</li>
      ))}
    </ul>
  );
};
Home.getInitialProps = async ctx => {
  try {
    // Parses the JSON returned by a network request
    const parseJSON = resp => (resp.json ? resp.json() : resp);
    // Checks if a network request came back fine, and throws an error if not
    const checkStatus = resp => {
      if (resp.status >= 200 && resp.status < 300) {
        return resp;
      }

      return parseJSON(resp).then(resp => {
        throw resp;
      });
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const restaurants = await fetch('http://localhost:1337/api/restaurants', {
      method: 'GET',
      headers,
    })
      .then(checkStatus)
      .then(parseJSON);

    return { restaurants };
  } catch (error) {
    return { error };
  }
};

export default Home;
```

</TabItem>

</Tabs>

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission for the `category` Collection type.
Add the `?populate=categories` query parameter to return categories with the response.

In this example a `japanese` category has been created which has the id: 3.

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

<Request title="Example POST request with axios">

```js
import axios from 'axios';

axios
  .post('http://localhost:1337/api/restaurants/?populate=categories', {
    data: {
      name: 'Dolemon Sushi',
      description:
        'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious',
      categories: [3],
    },
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
fetch('http://localhost:1337/api/restaurants/?populate=categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      name: 'Dolemon Sushi',
      description:
        'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious',
      categories: [3],
    },
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
  "data": {
    "id": 2,
    "attributes": {
      "name": "Dolemon Sushi",
      "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
      "createdAt": "2022-07-31T09:14:12.569Z",
      "updatedAt": "2022-07-31T09:14:12.569Z",
      "publishedAt": "2022-07-31T09:14:12.566Z",
      "categories": {
        "data": [
          {
            "id": 3,
            "attributes": {
              "name": "Japanese",
              "createdAt": "2022-07-31T10:49:03.933Z",
              "updatedAt": "2022-07-31T10:49:04.893Z",
              "publishedAt": "2022-07-31T10:49:04.890Z"
            }
          }
        ]
      }
    }
  },
  "meta": {}
}
```

</Response>

### Example

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

`./pages/index.js`

```js
import { useState } from 'react';
import axios from 'axios';

const Home = ({ allCategories, errorCategories }) => {
  const [modifiedData, setModifiedData] = useState({
    name: '',
    description: '',
    categories: [],
  });
  const [errorRestaurants, setErrorRestaurants] = useState(null);

  const handleChange = ({ target: { name, value } }) => {
    setModifiedData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:1337/api/restaurants', {
        data: modifiedData,
      });
      console.log(response);
    } catch (error) {
      setErrorRestaurants(error);
    }
  };

  const renderCheckbox = category => {
    const { categories } = modifiedData;
    const isChecked = categories.includes(category.id);
    const handleCheckboxChange = () => {
      if (!categories.includes(category.id)) {
        handleChange({ target: { name: 'categories', value: categories.concat(category.id) } });
      } else {
        handleChange({
          target: { name: 'categories', value: categories.filter(v => v !== category.id) },
        });
      }
    };
    return (
      <div key={category.id}>
        <label htmlFor={category.id}>{category.attributes.Name}</label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          name="categories"
          id={category.id}
        />
      </div>
    );
  };
  if (errorCategories) {
    return <div>An error occured (categories): {errorCategories.message}</div>;
  }
  if (errorRestaurants) {
    return <div>An error occured (restaurants): {errorRestaurants.message}</div>;
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Restaurants</h3>
        <br />
        <label>
          Name:
          <input type="text" name="name" value={modifiedData.name} onChange={handleChange} />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={modifiedData.description}
            onChange={handleChange}
          />
        </label>
        <div>
          <br />
          <b>Select categories</b>
          <br />
          {allCategories.data.map(renderCheckbox)}
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

Home.getInitialProps = async ctx => {
  try {
    const res = await axios.get('http://localhost:1337/api/categories');
    const allCategories = res.data;
    return { allCategories };
  } catch (errorCategories) {
    return { errorCategories };
  }
};

export default Home;
```

</TabItem>

<TabItem value="fetch" label="fetch">

`./pages/index.js`

```js
import { useState } from 'react';

// Parses the JSON returned by a network request
const parseJSON = resp => (resp.json ? resp.json() : resp);
// Checks if a network request came back fine, and throws an error if not
const checkStatus = resp => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }
  return parseJSON(resp).then(resp => {
    throw resp;
  });
};
const headers = {
  'Content-Type': 'application/json',
};

const Home = ({ allCategories, errorCategories }) => {
  const [modifiedData, setModifiedData] = useState({
    name: '',
    description: '',
    categories: [],
  });
  const [errorRestaurants, setErrorRestaurants] = useState(null);

  const handleChange = ({ target: { name, value } }) => {
    setModifiedData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:1337/api/restaurants', {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: modifiedData }),
      })
        .then(checkStatus)
        .then(parseJSON);
    } catch (error) {
      setErrorRestaurants(error);
    }
  };

  const renderCheckbox = category => {
    const { categories } = modifiedData;
    const isChecked = categories.includes(category.id);
    const handleCheckboxChange = () => {
      if (!categories.includes(category.id)) {
        handleChange({ target: { name: 'categories', value: categories.concat(category.id) } });
      } else {
        handleChange({
          target: { name: 'categories', value: categories.filter(v => v !== category.id) },
        });
      }
    };
    return (
      <div key={category.id}>
        <label htmlFor={category.id}>{category.attributes.Name}</label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          name="categories"
          id={category.id}
        />
      </div>
    );
  };

  if (errorCategories) {
    return <div>An error occured (categories): {errorCategories.message}</div>;
  }
  if (errorRestaurants) {
    return <div>An error occured (restaurants): {errorRestaurants.message}</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Restaurants</h3>
        <br />
        <label>
          Name:
          <input type="text" name="name" value={modifiedData.name} onChange={handleChange} />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={modifiedData.description}
            onChange={handleChange}
          />
        </label>
        <div>
          <br />
          <b>Select categories</b>
          <br />
          {allCategories.data.map(renderCheckbox)}
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

Home.getInitialProps = async ctx => {
  try {
    const allCategories = await fetch('http://localhost:1337/api/categories', {
      method: 'GET',
      headers,
    })
      .then(checkStatus)
      .then(parseJSON);
    return { allCategories };
  } catch (errorCategories) {
    return { errorCategories };
  }
};
export default Home;
```


</TabItem>

</Tabs>

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

We consider that the id of your restaurant is `2`.
and the id of your category is `2`.

<Tabs groupId="axios-fetch">

<TabItem value="axios" label="axios">

<Request title="Example PUT request with axios">

```js
import axios from 'axios';

axios
  .put('http://localhost:1337/api/restaurants/2/?populate=categories', {
    data: {
      categories: [2],
    },
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
fetch('http://localhost:1337/api/restaurants/2/?populate=categories', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      categories: [2],
    },
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
  "data": {
    "id": 2,
    "attributes": {
      "name": "Dolemon Sushi",
      "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
      "createdAt": "2022-07-31T09:14:12.569Z",
      "updatedAt": "2022-07-31T11:17:31.598Z",
      "publishedAt": "2022-07-31T09:14:12.566Z",
      "categories": {
        "data": [
          {
            "id": 2,
            "attributes": {
              "name": "Brunch",
              "createdAt": "2022-07-30T09:23:57.857Z",
              "updatedAt": "2022-07-30T09:26:37.236Z",
              "publishedAt": "2022-07-30T09:26:37.233Z"
            }
          }
        ]
      }
    }
  },
  "meta": {}
}
```

</Response>
