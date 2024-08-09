---
title: Ruby
displayed_sidebar: devDocsSidebar
description: Integrate Strapi with Ruby.
tags:
- collection type
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Ruby

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Ruby](https://www.ruby-lang.org/en/) remains the same except that you do not fetch the same content.

## Create a Ruby file

Be sure to have [Ruby installed](https://www.ruby-lang.org/en/documentation/installation/) on your computer.

```bash
mkdir ruby-app && cd ruby-app
touch script.rb
```

## Use an HTTP client

Many HTTP clients are available but in this documentation we'll use [HTTParty](https://github.com/jnunemaker/httparty).

- Create a `Gemfile` containing the following:

```
source "https://rubygems.org"

gem "httparty"
```

- Install your gems by running the following command:

```bash
bundle install
```

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

<ApiCall noSideBySide>
<Request title= "Example GET request">

```ruby
HTTParty.get('http://localhost:1337/api/restaurants/')
```

</Request>

<Response title= "Example response">

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

</Response>
</ApiCall>

### Example

```ruby
require 'httparty'

class Restaurant
  include HTTParty
  base_uri 'http://localhost:1337/api'

  def all
    self.class.get('/restaurants')
  end
end

restaurant = Restaurant.new
puts restaurant.all
```

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission for the `category` Collection type.
Add the `?populate=categories` query parameter to return the categories with the response.

In this example a `japanese` category has been created which has the id: 3.

<ApiCall noSideBySide>
<Request title= "Example POST request">

```ruby
HTTParty.post(
  'http://localhost:1337/api/restaurants/',
  body: {
    data: {
      name: 'Dolemon Sushi',
      description: 'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious',
      categories: [3]
    }
  },
  header: {
    'Content-Type': 'application/json'
  },
  query: {
    'populate': 'categories'
  }
)
```

</Request>

<Response title= "Example response">

```json
{
  "data": {
    "id": 2,
    "attributes": {
      "name": "Dolemon Sushi",
      "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
      "createdAt": "2022-07-31T18:29:58.876Z",
      "updatedAt": "2022-07-31T18:29:58.876Z",
      "publishedAt": "2022-07-31T18:29:58.875Z",
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

</Response>
</ApiCall>

### Example

```ruby
require 'httparty'

class Restaurant
  include HTTParty
  base_uri 'http://localhost:1337/api'

  def initialize
    @options = {
      header: { 'Content-Type': 'application/json' },
      query: { 'populate': 'categories' }
    }
  end

  def all
    self.class.get('/restaurants')
  end

  def create(params)
    @options[:body] = {
      data: {
        name: params[:name],
        description: params[:description],
        categories: params[:categories]
      }
    }

    self.class.post('/restaurants', @options)
  end
end

restaurant = Restaurant.new
puts restaurant.create({
  name: 'Dolemon Sushi',
  description: 'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious',
  categories: [3]
})
```

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.
Add the `?populate=categories` query parameter to return the categories with the response.

<ApiCall noSideBySide>
<Request title= "Example PUT request">

```ruby
HTTParty.put(
  'http://localhost:1337/api/restaurants/2',
  body: {
    data: {
      categories: [2]
    }
  },
  header: {
    'Content-Type': 'application/json'
  },
  query: {
    'populate': 'categories'
  }
)
```

</Request>

<Response title= "Example response">

```json
{
  "data": {
    "id": 2,
    "attributes": {
      "name": "Dolemon Sushi",
      "description": "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
      "createdAt": "2022-07-31T18:15:09.290Z",
      "updatedAt": "2022-07-31T18:16:53.448Z",
      "publishedAt": "2022-07-31T18:15:09.289Z",
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

</Response>
</ApiCall>

### Example

```ruby
require 'httparty'

class Restaurant
  include HTTParty
  base_uri 'http://localhost:1337/api'

  def initialize
    @options = {
      header: { 'Content-Type': 'application/json' },
      query: { 'populate': 'categories' }
    }
  end

  def all
    self.class.get('/restaurants')
  end

  def create(params)
    @options[:body] = {
      data: {
        name: params[:name],
        description: params[:description],
        categories: params[:categories]
      }
    }

    self.class.post('/restaurants', @options)
  end

  def update(id, params)
    @options[:body] = {
      data: {
        categories: params[:categories]
      }
    }
    self.class.put("/restaurants/#{id}", @options)
  end
end

restaurant = Restaurant.new
puts restaurant.update(16, { categories: [2] })
```
