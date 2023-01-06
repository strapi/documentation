---
title: Get started with React - Strapi Developer Docs
description: Build powerful applications using Strapi, the leading open-source headless cms and React.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/content-api/integrations/react.html
---

# Getting Started with React

!!!include(developer-docs/latest/developer-resources/content-api/snippets/integration-guide-not-updated.md)!!!

This integration guide is following the [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have fully completed its "Hands-on" path, and therefore can consume the API by browsing this [url](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [React](https://reactjs.org/) remains the same except that you will not fetch the same content.

## Create a React app

Create a basic React application using [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html).


<code-group>

<code-block title="NPM">
```sh
npx create-react-app react-app
```
</code-block>

<code-block title="YARN">
```sh
yarn create react-app react-app
```
</code-block>

</code-group>

## Use an HTTP client

Many HTTP clients are available but in this documentation we'll use [Axios](https://github.com/axios/axios) and [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

:::: tabs card

::: tab axios

```bash
yarn add axios
```

:::

::: tab fetch

No installation needed

:::

::::

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type

::::: tabs card

:::: tab axios

::: request Example GET request with axios
```js
import axios from 'axios';

axios.get('http://localhost:1337/api/restaurants').then(response => {
  console.log(response);
});
```
:::

::::

:::: tab fetch

::: request Example GET request with fetch
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
:::

::::

:::response Example response

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
:::


### Example

:::: tabs card

::: tab axios

`./src/App.js`

```js
import axios from 'axios';
import { useEffect, useState } from 'react';

const App = () => {
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:1337/api/restaurants')
      .then(({ data }) => setRestaurants(data))
      .catch((error) => setError(error))
  }, [])

  if (error) {
    // Print errors if any
    return <div>An error occured: {error.message}</div>;
  }

  return (
    <div className="App">
      <ul>
        {restaurants.map(({ id, name }) => <li key={id}>{name}</li>)}
      </ul>
    </div>
  );
};

export default App;
```

:::

::: tab fetch

`./src/App.js`

```js
import { useEffect, useState } from 'react';

// Parses the JSON returned by a network request
const parseJSON = (resp) => (resp.json ? resp.json() : resp);

// Checks if a network request came back fine, and throws an error if not
const checkStatus = (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }

  return parseJSON(resp).then(resp => {
    throw resp;
  });
};

const headers = { 'Content-Type': 'application/json' };

const App = () => {
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch('http://localhost:1337/api/restaurants', { headers, method: 'GET' })
      .then(checkStatus)
      .then(parseJSON)
      .then(({ data }) => setRestaurants(data))
      .catch((error) => setError(error))
  }, [])

  if (error) {
    // Print errors if any
    return <div>An error occured: {error.message}</div>;
  }

  return (
    <div className="App">
      <ul>
        {restaurants.map(({ id, name }) => <li key={id}>{name}</li>)}
      </ul>
    </div>
  );
};

export default App;
```

:::

::::

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission fot the `category` Collection type.

In this example a `japanese` category has been created which has the id: 3.

::::: tabs card

:::: tab axios

::: request Example POST request with axios
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
:::

::::

:::: tab fetch

::: request Example POST request with fetch
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
:::

::::
:::::

::: response Example response
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
:::

### Example

:::: tabs card

::: tab axios

`./src/App.js`

```js
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const Checkbox = ({ category, isChecked, onAddCategory, onRemoveCategory }) => (
  <div key={category.id}>
    <label htmlFor={category.id}>{category.name}</label>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={isChecked ? onAddCategory : onRemoveCategory}
      name="categories"
      id={category.id}
    />
  </div>
);

const App = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [error, setError] = useState(null);
  const [modifiedData, setModifiedData] = useState({ categories: [], description: '', name: '' });

  const handleInputChange = useCallback(({ target: { name, value } }) => {
    setModifiedData((prevData) => ({ ...prevData, [name]: value }));
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios
      .post("http://localhost:1337/api/restaurants", modifiedData)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        setError(error);
      });
  };

  useEffect(() => {
    axios
      .get('http://localhost:1337/api/categories')
      .then(({ data }) => setAllCategories(data))
      .catch((error) => setError(error))
  }, [])

  if (error) {
    // Print errors if any
    return <div>An error occured: {error.message}</div>;
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <h3>Restaurants</h3>
        <br />
        <label>
          Name:
          <input
            type="text"
            name="name"
            onChange={handleInputChange}
            value={modifiedData.name}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="description"
            onChange={handleInputChange}
            value={modifiedData.description}
          />
        </label>
        <div>
          <br />
          <b>Select categories</b>
          {allCategories.map((category) => (
            <Checkbox
              category={category}
              isChecked={modifiedData.categories.includes(category.id)}
              onAddCategory={() =>
                setModifiedData((prevData) => ({
                  ...prevData,
                  categories: [...prevData.categories, category.id],
                }))
              }
              onRemoveCategory={() =>
                setModifiedData((prevData) => ({
                  ...prevData,
                  categories: prevData.categories.filter(
                    (id) => id !== category.id
                  ),
                }))
              }
            />
          ))}
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
```

:::

::: tab fetch

`./src/App.js`

```js
import { useCallback, useEffect, useState } from 'react';

// Parses the JSON returned by a network request
const parseJSON = (resp) => (resp.json ? resp.json() : resp);

// Checks if a network request came back fine, and throws an error if not
const checkStatus = (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }

  return parseJSON(resp).then(resp => {
    throw resp;
  });
};

const headers = { 'Content-Type': 'application/json' };

const Checkbox = ({ category, isChecked, onAddCategory, onRemoveCategory }) => (
  <div key={category.id}>
    <label htmlFor={category.id}>{category.name}</label>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={isChecked ? onAddCategory : onRemoveCategory}
      name="categories"
      id={category.id}
    />
  </div>
);

const App = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [error, setError] = useState(null);
  const [modifiedData, setModifiedData] = useState({ categories: [], description: '', name: '' });

  const handleInputChange = useCallback(({ target: { name, value } }) => {
    setModifiedData((prevData) => ({ ...prevData, [name]: value }));
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios
      .post("http://localhost:1337/api/restaurants", modifiedData)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        setError(error);
      });
  };

  useEffect(() => {
    fetch('http://localhost:1337/api/categories', { headers, method: 'GET' })
      .then(checkStatus)
      .then(parseJSON)
      .then(({ data }) => setAllCategories(data))
      .catch((error) => setError(error))
  }, [])

  if (error) {
    // Print errors if any
    return <div>An error occured: {error.message}</div>;
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <h3>Restaurants</h3>
        <br />
        <label>
          Name:
          <input
            type="text"
            name="name"
            onChange={handleInputChange}
            value={modifiedData.name}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="description"
            onChange={handleInputChange}
            value={modifiedData.description}
          />
        </label>
        <div>
          <br />
          <b>Select categories</b>
          {allCategories.map((category) => (
            <Checkbox
              category={category}
              isChecked={modifiedData.categories.includes(category.id)}
              onAddCategory={() =>
                setModifiedData((prevData) => ({
                  ...prevData,
                  categories: [...prevData.categories, category.id],
                }))
              }
              onRemoveCategory={() =>
                setModifiedData((prevData) => ({
                  ...prevData,
                  categories: prevData.categories.filter(
                    (id) => id !== category.id
                  ),
                }))
              }
            />
          ))}
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
```

:::

::::

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

::::: tabs card

We consider that the id of your restaurant is `2`, and the id of your category is `2`.

:::: tab axios

::: request Example PUT request with axios

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

:::
::::

:::: tab fetch

::: request Example PUT request with fetch
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
:::
::::
:::::

:::response Example response
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
:::


## Starter

- [React Blog starter](https://github.com/strapi/strapi-starter-react-blog)

## Conclusion

Here is how to request your collection types in Strapi using React. When you create a collection type or a single type you will have a certain number of REST API endpoints available to interact with.

We just used the GET, POST and PUT methods here but you can [get one entry](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#get-an-entry), and [delete](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#delete-an-entry) an entry too. Learn more about [API Endpoints](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#endpoints).
