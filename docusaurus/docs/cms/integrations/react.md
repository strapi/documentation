---
title: React
displayed_sidebar: cmsSidebar
description: Integrate Strapi with React.
---

# Getting Started with React

:::callout 🧹 Removing integration guides
The Strapi Documentation team focuses on improving the documentation for Strapi 5's core experience. We will release many changes in the next 6 months, so please keep an eye out 👀.

As a result, the present page is now in maintenance mode only, might not be fully up-to-date with Strapi 5, and will soon be replaced by a React (and possibly Next.js) integration guide. This will be the only official integration guide that the Strapi Documentation team will maintain.

You will find other integration guides on Strapi's [integrations page](https://strapi.io/integrations) when it's done.
:::

This integration guide follows the [Quick Start Guide](/cms/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [React](https://reactjs.org/) remains the same except that you will not fetch the same content.

## Create a React app

Create a basic React application using [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html).

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn create react-app react-app
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npx create-react-app react-app
```
</TabItem>
</Tabs>

## Use an HTTP client

Many HTTP clients are available but in this documentation there are examples using [Axios](https://github.com/axios/axios) and [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

To install Axios:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add axios
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install axios
```

</TabItem>

</Tabs>

There is no installation required for `Fetch`.

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type

<Tabs>

<TabItem label="axios" value="axios">

<Request title="Example GET request with axios">

```js
import axios from "axios";

axios.get("http://localhost:1337/api/restaurants").then((response) => {
  console.log(response);
});
```

</Request>

</TabItem>

<TabItem label="fetch" value="fetch">

<Request title="Example GET request with fetch">

```js
fetch("http://localhost:1337/api/restaurants", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

</Request>

</TabItem>
</Tabs>

<Response>

```json
{
  "data": [
    {
      "id": 2,
      "documentId": "na8ce9ltc0y99syjbs3vbigx",
      "Name": "Biscotte Restaurant",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
            }
          ]
        }
      ],
      "createdAt": "2024-08-09T08:59:05.114Z",
      "updatedAt": "2024-08-09T08:59:06.341Z",
      "publishedAt": "2024-08-09T08:59:06.344Z",
      "locale": "en"
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

<Tabs>

<TabItem label="axios" value="axios">

`./src/App.js`

```js
import axios from "axios";
import { useEffect, useState } from "react";

const App = () => {
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:1337/api/restaurants")
      .then(({ data }) => setRestaurants(data.data))
      .catch((error) => setError(error));
  }, []);

  if (error) {
    // Print errors if any
    return <div>An error occured: {error.message}</div>;
  }

  return (
    <div className="App">
      <ul>
        {restaurants.map(({ id, attributes }) => (
          <li key={id}>{attributes.Name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
```

</TabItem>

<TabItem label="fetch" value="fetch">

`./src/App.js`

```js
import { useEffect, useState } from "react";

// Parses the JSON returned by a network request
const parseJSON = (resp) => (resp.json ? resp.json() : resp);

// Checks if a network request came back fine, and throws an error if not
const checkStatus = (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }

  return parseJSON(resp).then((resp) => {
    throw resp;
  });
};

const headers = { "Content-Type": "application/json" };

const App = () => {
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch("http://localhost:1337/api/restaurants", { headers, method: "GET" })
      .then(checkStatus)
      .then(parseJSON)
      .then(({ data }) => setRestaurants(data.data))
      .catch((error) => setError(error));
  }, []);

  if (error) {
    // Print errors if any
    return <div>An error occured: {error.message}</div>;
  }

  return (
    <div className="App">
      <ul>
        {restaurants.map(({ id, attributes }) => (
          <li key={id}>{attributes.Name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
```

</TabItem>

</Tabs>

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission fot the `category` Collection type.

In this example a `japanese` category has been created which has the id: 3.

<Tabs>

<TabItem label="axios" value="axios">

<Request title= "Example POST request with axios">

```js
import axios from "axios";

axios
  .post("http://localhost:1337/api/restaurants", {
    data: {
      "Name": "Dolemon Sushi",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
            }
          ]
        }
      ],
      categories: [3],
    },
  })
  .then((response) => {
    console.log(response);
  });
```

</Request>

</TabItem>

<TabItem label="fetch" value="fetch">

<Request title="Example POST request with fetch">

```js
fetch("http://localhost:1337/api/restaurants", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    data: {
      "Name": "Dolemon Sushi",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
            }
          ]
        }
      ],
      categories: [3],
    },
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

</Request>

</TabItem>
</Tabs>

<Response title="Example response">

```json
{
  "data": {
    "id": 3,
    "documentId": "jm8rm7jl9ncalk12lkc4bhcx"
    "name": "Dolemon Sushi",
    "description": [ 
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
          }
        ]
      }
    ],
    "createdAt": "2024-03-02T21:40:39.185Z",
    "updatedAt": "2024-03-02T21:40:39.185Z",
    "publishedAt": "2024-03-02T21:40:39.118Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>

### Example

<Tabs>

<TabItem label="axios" value="axios">

`./src/App.js`

```js
import axios from "axios";
import { useCallback, useEffect, useState, useId } from "react";

const Checkbox = ({ name, isChecked, onAddCategory, onRemoveCategory }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{name}</label>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={isChecked ? onRemoveCategory : onAddCategory}
        name="categories"
        id={id}
      />
    </div>
  );
};

const App = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [error, setError] = useState(null);
  const [modifiedData, setModifiedData] = useState({
    categories: [],
    description: "",
    name: "",
  });

  const handleInputChange = useCallback(({ target: { name, value } }) => {
    setModifiedData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios
      .post("http://localhost:1337/api/restaurants", { data: modifiedData })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        setError(error);
      });
  };

  useEffect(() => {
    axios
      .get("http://localhost:1337/api/categories")
      .then(({ data }) => {
        setAllCategories(data.data);
        console.log(data.data);
      })
      .catch((error) => setError(error));
  }, []);

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
          {allCategories.map(({ id, attributes }) => (
            <Checkbox
              key={id}
              name={attributes.Name}
              isChecked={modifiedData.categories.includes(id)}
              onAddCategory={() => {
                const nextData = {
                  ...modifiedData,
                  categories: [...modifiedData.categories, id],
                };
                setModifiedData(nextData);
              }}
              onRemoveCategory={() => {
                const nextData = {
                  ...modifiedData,
                  categories: modifiedData.categories.filter(
                    (catId) => catId !== id
                  ),
                };
                setModifiedData(nextData);
              }}
            />
          ))}
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default App;
```

</TabItem>

<TabItem label="fetch" value="fetch">

`./src/App.js`

```js
import { useCallback, useEffect, useState, useId } from "react";

// Parses the JSON returned by a network request
const parseJSON = (resp) => (resp.json ? resp.json() : resp);

// Checks if a network request came back fine, and throws an error if not
const checkStatus = (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }

  return parseJSON(resp).then((resp) => {
    throw resp;
  });
};

const headers = { "Content-Type": "application/json" };

const Checkbox = ({ name, isChecked, onAddCategory, onRemoveCategory }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{name}</label>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={isChecked ? onRemoveCategory : onAddCategory}
        name="categories"
        id={id}
      />
    </div>
  );
};

const App = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [error, setError] = useState(null);
  const [modifiedData, setModifiedData] = useState({
    categories: [],
    description: "",
    name: "",
  });

  const handleInputChange = useCallback(({ target: { name, value } }) => {
    setModifiedData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:1337/api/restaurants", {
      headers,
      method: "POST",
      body: JSON.stringify({ data: modifiedData }),
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        setError(error);
      });
  };

  useEffect(() => {
    fetch("http://localhost:1337/api/categories", { headers, method: "GET" })
      .then(checkStatus)
      .then(parseJSON)
      .then(({ data }) => setAllCategories(data))
      .catch((error) => setError(error));
  }, []);

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
          {allCategories.map(({ id, attributes }) => (
            <Checkbox
              key={id}
              name={attributes.Name}
              isChecked={modifiedData.categories.includes(id)}
              onAddCategory={() => {
                const nextData = {
                  ...modifiedData,
                  categories: [...modifiedData.categories, id],
                };
                setModifiedData(nextData);
              }}
              onRemoveCategory={() => {
                const nextData = {
                  ...modifiedData,
                  categories: modifiedData.categories.filter(
                    (catId) => catId !== id
                  ),
                };
                setModifiedData(nextData);
              }}
            />
          ))}
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default App;
```

</TabItem>

</Tabs>

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

We consider that the id of your restaurant is `2`, and the id of your category is `2`.

<Tabs>
<TabItem label="axios" value="axios">

<Request title="Example PUT request with axios">

```js
import axios from "axios";

axios
  .put("http://localhost:1337/api/restaurants/2", {
    data: {
      categories: [2],
    },
  })
  .then((response) => {
    console.log(response);
  });
```

</Request>
</TabItem>

<TabItem label="fetch" value="fetch">

<Request title="Example PUT request with fetch">

```js
fetch("http://localhost:1337/api/restaurants/3", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    data: {
      categories: [2],
    },
  }),
})
  .then((response) => response.json())
  .then((data) => {
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
    "id": 3,
    "documentId": "jm8rm7jl9ncalk12lkc4bhcx"
    "name": "Dolemon Sushi",
    "description": [ 
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
          }
        ]
      }
    ],
    "createdAt": "2024-03-02T21:40:39.185Z",
    "updatedAt": "2024-03-02T21:40:39.185Z",
    "publishedAt": "2024-03-02T21:40:39.118Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>
