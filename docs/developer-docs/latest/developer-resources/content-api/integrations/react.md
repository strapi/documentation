---
title: Get started with React - Strapi Developer Documentation
description: Build powerful applications using Strapi, the leading open-source headless cms and React.
---

# Getting Started with React

This integration guide is following the [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have fully completed its "Hands-on" path, and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [React](https://reactjs.org/) remains the same except that you will not fetch the same content.

## Create a React app

Create a basic React application using [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html).

:::: tabs

::: tab yarn

```bash
yarn create react-app react-app
```

:::

::: tab npx

```bash
npx create-react-app react-app
```

:::

::::

## Use an HTTP client

Many HTTP clients are available but in this documentation we'll use [Axios](https://github.com/axios/axios) and [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

:::: tabs

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

Execute a `GET` request on the `restaurant` Collection Type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` Collection Type

:::: tabs

::: tab axios

_Request_

```js
import axios from 'axios';

axios.get('http://localhost:1337/restaurants').then(response => {
  console.log(response);
});
```

:::

::: tab fetch

_Request_

```js
fetch('http://localhost:1337/restaurants', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => response.json())
  .then(data => console.log(data));
```

:::

_Response_

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

::::

### Example

:::: tabs

::: tab axios

`./src/App.js`

```js
import React from 'react';
import axios from 'axios';

class App extends React.Component {
  // State of your application
  state = {
    restaurants: [],
    error: null,
  };

  // Fetch your restaurants immediately after the component is mounted
  componentDidMount = async () => {
    try {
      const response = await axios.get('http://localhost:1337/restaurants');
      this.setState({ restaurants: response.data });
    } catch (error) {
      this.setState({ error });
    }
  };

  render() {
    const { error, restaurant } = this.state;

    // Print errors if any
    if (error) {
      return <div>An error occured: {error.message}</div>;
    }

    return (
      <div className="App">
        <ul>
          {this.state.restaurants.map(restaurant => (
            <li key={restaurant.id}>{restaurant.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
```

:::

::: tab fetch

`./src/App.js`

```js
import React from 'react';

class App extends React.Component {
  // State of your application
  state = {
    restaurants: [],
    error: null,
  };

  // Fetch your restaurants immediately after the component is mounted
  componentDidMount = async () => {
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

    try {
      const restaurants = await fetch('http://localhost:1337/restaurants', {
        method: 'GET',
        headers: headers,
      })
        .then(checkStatus)
        .then(parseJSON);
      this.setState({ restaurants });
    } catch (error) {
      this.setState({ error });
    }
  };

  render() {
    const { error, restaurant } = this.state;

    // Print errors if any
    if (error) {
      return <div>An error occured: {error.message}</div>;
    }

    return (
      <div className="App">
        <ul>
          {this.state.restaurants.map(restaurant => (
            <li key={restaurant.id}>{restaurant.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
```

:::

::::

## POST Request your collection type

Execute a `POST` request on the `restaurant` Collection Type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` Collection Type and the `find` permission fot the `category` Collection type.

In this example a `japanese` category has been created which has the id: 3.

:::: tabs

::: tab axios

_Request_

```js
import axios from 'axios';

axios
  .post('http://localhost:1337/restaurants', {
    name: 'Dolemon Sushi',
    description: 'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious',
    categories: [3],
  })
  .then(response => {
    console.log(response);
  });
```

:::

::: tab fetch

_Request_

```js
fetch('http://localhost:1337/restaurants', {
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

_Response_

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

::::

### Example

:::: tabs

::: tab axios

`./src/App.js`

```js
import React from 'react';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);

    // State of your application
    this.state = {
      modifiedData: {
        name: '',
        description: '',
        categories: [],
      },
      allCategories: [],
      error: null,
    };
  }

  // Fetch your categories immediately after the component is mounted
  componentDidMount = async () => {
    try {
      const response = await axios.get('http://localhost:1337/categories');
      this.setState({ allCategories: response.data });
    } catch (error) {
      this.setState({ error });
    }
  };

  handleInputChange = ({ target: { name, value } }) => {
    this.setState(prev => ({
      ...prev,
      modifiedData: {
        ...prev.modifiedData,
        [name]: value,
      },
    }));
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:1337/restaurants',
        this.state.modifiedData
      );
      console.log(response);
    } catch (error) {
      this.setState({ error });
    }
  };

  renderCheckbox = category => {
    const {
      modifiedData: { categories },
    } = this.state;
    const isChecked = categories.includes(category.id);
    const handleChange = () => {
      if (!categories.includes(category.id)) {
        this.handleInputChange({
          target: { name: 'categories', value: categories.concat(category.id) },
        });
      } else {
        this.handleInputChange({
          target: {
            name: 'categories',
            value: categories.filter(v => v !== category.id),
          },
        });
      }
    };

    return (
      <div key={category.id}>
        <label htmlFor={category.id}>{category.name}</label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          name="categories"
          id={category.id}
        />
      </div>
    );
  };

  render() {
    const { error, allCategories, modifiedData } = this.state;

    // Print errors if any
    if (error) {
      return <div>An error occured: {error.message}</div>;
    }

    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <h3>Restaurants</h3>
          <br />
          <label>
            Name:
            <input
              type="text"
              name="name"
              onChange={this.handleInputChange}
              value={modifiedData.name}
            />
          </label>
          <label>
            Description:
            <input
              type="text"
              name="description"
              onChange={this.handleInputChange}
              value={modifiedData.description}
            />
          </label>
          <div>
            <br />
            <b>Select categories</b>
            {allCategories.map(this.renderCheckbox)}
          </div>
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default App;
```

:::

::: tab fetch

`./src/App.js`

```js
import React from 'react';

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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modifiedData: {
        name: '',
        description: '',
        categories: [],
      },
      allCategories: [],
      error: null,
    };
  }

  componentDidMount = async () => {
    try {
      const allCategories = await fetch('http://localhost:1337/categories', {
        method: 'GET',
        headers: headers,
      })
        .then(checkStatus)
        .then(parseJSON);
      this.setState({ allCategories });
    } catch (error) {
      this.setState({ error });
    }
  };

  handleInputChange = ({ target: { name, value } }) => {
    this.setState(prev => ({
      ...prev,
      modifiedData: {
        ...prev.modifiedData,
        [name]: value,
      },
    }));
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      await fetch('http://localhost:1337/restaurants', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(this.state.modifiedData),
      })
        .then(checkStatus)
        .then(parseJSON);
    } catch (error) {
      this.setState({ error });
    }
  };

  renderCheckbox = category => {
    const {
      modifiedData: { categories },
    } = this.state;
    const isChecked = categories.includes(category.id);
    const handleChange = () => {
      if (!categories.includes(category.id)) {
        this.handleInputChange({
          target: { name: 'categories', value: categories.concat(category.id) },
        });
      } else {
        this.handleInputChange({
          target: {
            name: 'categories',
            value: categories.filter(v => v !== category.id),
          },
        });
      }
    };

    return (
      <div key={category.id}>
        <label htmlFor={category.id}>{category.name}</label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          name="categories"
          id={category.id}
        />
      </div>
    );
  };

  render() {
    const { error, allCategories, modifiedData } = this.state;

    // Print error if any
    if (error) {
      return <div>An error occured: {error.message}</div>;
    }

    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <h3>Restaurants</h3>
          <br />
          <label>
            Name:
            <input
              type="text"
              name="name"
              onChange={this.handleInputChange}
              value={modifiedData.name}
            />
          </label>
          <label>
            Description:
            <input
              type="text"
              name="description"
              onChange={this.handleInputChange}
              value={modifiedData.description}
            />
          </label>
          <div>
            <br />
            <b>Select categories</b>
            {allCategories.map(this.renderCheckbox)}
          </div>
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default App;
```

:::

::::

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` Collection Type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` Collection Type.

:::: tabs

We consider that the id of your restaurant is `2`.
and the id of your category is `2`.

::: tab axios

_Request_

```js
import axios from 'axios';

axios
  .put('http://localhost:1337/restaurants/2', {
    categories: [2],
  })
  .then(response => {
    console.log(response);
  });
```

:::

::: tab fetch

_Request_

```js
fetch('http://localhost:1337/restaurants/2', {
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

_Response_

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

::::

## Starter

- [React Blog starter](https://github.com/strapi/strapi-starter-react-blog)

## Conclusion

Here is how to request your Collection Types in Strapi using React. When you create a Collection Type or a Single Type you will have a certain number of REST API endpoints available to interact with.

We just used the GET, POST and PUT methods here but you can [get one entry](/developer-docs/latest/developer-resources/content-api/content-api.md#get-an-entry), [get how much entry you have](/developer-docs/latest/developer-resources/content-api/content-api.md#count-entries) and [delete](/developer-docs/latest/developer-resources/content-api/content-api.md#delete-an-entry) an entry too. Learn more about [API Endpoints](/developer-docs/latest/developer-resources/content-api/content-api.md#api-endpoints).
