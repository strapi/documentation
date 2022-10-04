---
title: Get started with Python - Strapi Developer Docs
description: Build powerful applications using Strapi, the leading open-source headless cms and Python.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/content-api/integrations/python.html
---

# Getting Started with Python

This integration guide is following the [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have fully completed its "Hands-on" path, and therefore can consume the API by browsing this [url](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Python](https://www.python.org/) remains the same except that you will not fetch the same content.

## Create a Python file

Be sure to have [Python installed](https://wiki.python.org/moin/BeginnersGuide/Download) on your computer.

```bash
touch script.py
```

## Use an HTTP client

Many HTTP clients are available but in this documentation we'll use [Requests](https://github.com/psf/requests).

```bash
python -m pip install requests
```

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

:::: api-call
::: request Example GET request

```python
requests.get("http://localhost:1337/api/restaurants")
```

:::

::: response Example response

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Biscotte Restaurant",
        "description": "Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
        "createdAt": "2022-07-31T11:57:01.330Z",
        "updatedAt": "2022-07-31T11:57:44.945Z",
        "publishedAt": "2022-07-31T11:57:44.943Z"
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

:::
::::

### Example

```python
import json
import requests

class Restaurant:
    def __init__(self):
        self.api_url = "http://localhost:1337/api"

    def all(self):
        r = requests.get(self.api_url + "/restaurants")
        return r.json()

restaurant = Restaurant()
print(restaurant.all())
```

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission for the `category` Collection type.
Add the `?populate=categories` query parameter to return categories with the response.

In this example a `japanese` category has been created which has the id: 3.

:::: api-call
::: request Example POST request

```python
requests.post(
    "http://localhost:1337/api/restaurants",
    headers={"Content-Type": "application/json"},
    params={"populate": "categories"},
    data=json.dumps(
        {
            "data": {
                "name": "Dolemon Sushi",
                "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
                "categories": [3],
            }
        }
    ),
)
```

:::

::: response Example response

```json
{
  "data": {
    "id": 2,
    "attributes": {
      "name": "Dolemon Sushi",
      "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
      "createdAt": "2022-07-31T15:36:56.336Z",
      "updatedAt": "2022-07-31T15:36:56.336Z",
      "publishedAt": "2022-07-31T15:36:56.336Z",
      "categories": {
        "data": [
          {
            "id": 3,
            "attributes": {
              "name": "japanese",
              "createdAt": "2022-07-31T11:57:35.040Z",
              "updatedAt": "2022-07-31T11:57:35.631Z",
              "publishedAt": "2022-07-31T11:57:35.629Z"
            }
          }
        ]
      }
    }
  },
  "meta": {}
}
```

:::
::::

### Example

```python
import json
import requests

class Restaurant:
    def __init__(self):
        self.api_url = "http://localhost:1337/api"

    def all(self):
        r = requests.get(self.api_url + "/restaurants")
        return r.json()

    def create(self, params):
        r = requests.post(
            self.api_url + "/restaurants",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "data": {
                        "name": params["name"],
                        "description": params["description"],
                        "categories": params["categories"],
                    }
                }
            ),
        )
        return r.json()


restaurant = Restaurant()
print(
    restaurant.create(
        {
            "name": "Dolemon Sushi",
            "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
            "categories": [3],
        }
    )
)
```

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

:::: api-call
::: request Example PUT request

```python
requests.put(
    "http://localhost:1337/api/restaurants/2",
    params={"populate": "categories"},
    headers={"Content-Type": "application/json"},
    data=json.dumps(
        {
            "data": {
                "categories": [2],
            }
        }
    ),
)
```

:::

::: response Example response

```json
{
  "data": {
    "id": 2,
    "attributes": {
      "name": "Dolemon Sushi",
      "description": null,
      "createdAt": "2022-07-31T15:43:44.039Z",
      "updatedAt": "2022-07-31T15:46:29.903Z",
      "publishedAt": "2022-07-31T15:43:44.038Z",
      "categories": {
        "data": [
          {
            "id": 2,
            "attributes": {
              "name": "Brunch",
              "createdAt": "2022-07-31T11:57:23.472Z",
              "updatedAt": "2022-07-31T11:57:25.180Z",
              "publishedAt": "2022-07-31T11:57:25.179Z"
            }
          }
        ]
      }
    }
  },
  "meta": {}
}
```

:::
::::

### Example

```python
import json
import requests

class Restaurant:
    def __init__(self):
        self.api_url = "http://localhost:1337/api"

    def all(self):
        r = requests.get(self.api_url + "/restaurants")
        return r.json()

    def create(self, params):
        r = requests.post(
            self.api_url + "/restaurants",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "data": {
                        "name": params["name"],
                        "description": params["description"],
                        "categories": params["categories"],
                    }
                }
            ),
        )
        return r.json()

    def update(self, id, params):
        r = requests.put(
            self.api_url + "/restaurants/" + str(id),
            headers={"Content-Type": "application/json"},
            params={"populate": "categories"},
            data=json.dumps({"data": {"categories": params["categories"]}}),
        )
        return r.json()


restaurant = Restaurant()
print(restaurant.update(2, {"categories": [2]}))
```

## Conclusion

Here is how to request your collection types in Strapi using Python. When you create a collection type or a single type you will have a certain number of REST API endpoints available to interact with.
