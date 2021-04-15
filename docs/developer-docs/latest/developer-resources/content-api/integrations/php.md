# Getting Started with PHP

This integration guide is following the [Getting started guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have completed [Step 8](/developer-docs/latest/getting-started/quick-start.html#_8-publish-the-content) and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

If you haven't gone through the getting started guide, the way you request a Strapi API with [PHP](https://php.net/) remains the same except that you will not fetch the same content.

## Create a PHP file

Be sure to have [PHP installed](https://www.php.net/manual/en/install.php) on your computer.

```bash
touch strapi.php
```
We will use cURL, a built-in PHP extension that allows us to receive and send information via the URL syntax.

## GET Request your collection type

Execute a `GET` request on the `restaurant` Collection Type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` Collection Type.

_Request_

```php
curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants');
```

Running the PHP file on the browser  will give you this response:


_Response_

```json
[{
  "id": 1,
  "name": "Biscotte Restaurant",
  "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
  "created_at": "2021-03-31T11:37:16.964Z",
  "updated_at": "2021-03-31T11:37:16.975Z",
  "categories": [{
      "id": 1,
      "name": "French Food",
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2021-03-31T11:36:23.164Z",
      "updated_at": "2021-03-31T11:36:23.172Z"
    },
    {
      "id": 2,
      "name": "Brunch ",
      "published_at": "2021-03-07T10:10:19.608Z",
      "created_at": "2021-03-07T10:10:14.477Z",
      "updated_at": "2021-03-07T10:10:19.649Z"
    }
  ]
}]
```
### Example

```php
<?php
function getRestaurants(){
    $curl = curl_init(); //Initializes curl
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants');
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]); // Sets header information for authenticated requests

    $res = curl_exec($curl);
    curl_close($curl);
    print_r($res);
}

getRestaurants();

```

## POST Request your collection type

Execute a `POST` request on the `restaurant` Collection Type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` Collection Type and the `find` permission for the `category` Collection type.

_Request_

```php
$restaurants = array(
  'name' => 'Calabar Kitchen',
  'description' => 'Omo, this is a place varieties soup with catfish🦈',
   'categories' => [2]
);

// Initializes a new cURL session
$curl = curl_init();

curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants');

curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

// Set the CURLOPT_POST for POST request
curl_setopt($curl, CURLOPT_POST, true);
```

Running the PHP file on the browser  will give you this response:

_Response_

```json
[{
    "id": 2,
    "name": "Calabar Kitchen",
    "description": "Omo, this is a place that varieties of soup with catfish🦈",
    "published_at": "2021-03-14T11:23:13.251Z",
    "created_at": "2021-03-14T11:23:13.260Z",
    "updated_at": "2021-03-14T11:23:13.260Z",
    "categories": [{
        "id": 2,
        "name": "Brunch ",
        "published_at": "2021-03-14T09:22:58.909Z",
        "created_at": "2021-03-14T09:22:51.893Z",
        "updated_at": "2021-03-14T09:22:58.945Z"
        }
      ]
}]
```

### Example

```php

<?php
function getRestaurants(){
    $curl = curl_init(); //Initializes curl
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants');
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]); // Sets header information for authenticated requests

    $res = curl_exec($curl);
    curl_close($curl);

    print_r($res);
}

function postRestaurant(){
    $restaurants = array(
        'name' => 'Calabar Kitchen',
        'description' => 'Omo, this is a place that varieties of soup with catfish🦈',
         'categories' => [2]
      );
      
      // Initializes a new cURL session
      $curl = curl_init();
      
      curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants');
      
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      
      // Set the CURLOPT_POST for POST request
      curl_setopt($curl, CURLOPT_POST, true);
      curl_setopt($curl, CURLOPT_POSTFIELDS,  json_encode($restaurants));
      
      curl_setopt($curl, CURLOPT_HTTPHEADER, [
          'Content-Type: application/json'
      ]);
      $res = curl_exec($curl);
      curl_close($curl);
      print_r($res);

}

postRestaurant();

```

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` Collection Type in order to update the category of a restaurant.

Be sure that you activated the `update` permission for the `restaurant` Collection Type.
PUT Request is sligtly different as we need to target the particular entry we want update. We do this by first making a request to http://localhost:1337/restaurants/1 and then update what we want to update. In this example, we are going to update  "Biscotte Restaurant" to "Femoni Kitchen".

_Request_

```php
$restaurants = array(
    'name' => 'Femoni Kitchen'
  );

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants/1');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PUT');

```

Running the PHP file on the browser  will give you this response:

_Response_

```json
[{
  "id": 1,
  "name": "Femoni Kitchen",
  "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
  "created_at": "2021-03-31T11:37:16.964Z",
  "updated_at": "2021-03-31T11:37:16.975Z",
  "categories": [{
      "id": 1,
      "name": "French Food",
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2021-03-31T11:36:23.164Z",
      "updated_at": "2021-03-31T11:36:23.172Z"
    }
  ]
}]
```

### Example

```php
<?php
function getRestaurants(){
    $curl = curl_init(); //Initializes curl
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants');
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]); // Sets header information for authenticated requests

    $res = curl_exec($curl);
    curl_close($curl);

    print_r($res);
}

function postRestaurant(){
    $restaurants = array(
        'name' => 'Calabar Kitchen',
        'description' => 'Omo, this is a place that varieties of soup with catfish🦈',
         'categories' => [2]
      );
      
      // Initializes a new cURL session
      $curl = curl_init();
      
      curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants');
      
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      
      // Set the CURLOPT_POST for POST request
      curl_setopt($curl, CURLOPT_POST, true);
      curl_setopt($curl, CURLOPT_POSTFIELDS,  json_encode($restaurants));
      curl_setopt($curl, CURLOPT_HTTPHEADER, [
          'Content-Type: application/json'
      ]);
      $res = curl_exec($curl);
      curl_close($curl);
      print_r($res);

}

function putRestaurant(){

$restaurants = array(
    'name' => 'Femoni Kitchen'
  );

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/restaurants/1');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($curl, CURLOPT_POSTFIELDS,  json_encode($restaurants));
curl_setopt($curl, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json'
]);

$res = curl_exec($curl);
curl_close($curl);

print_r($res);
}

putRestaurant();

```

## Conclusion

Here is how to request your Collection Types in Strapi using PHP. When you create a Collection Type or a Single Type you will have a certain number of REST API endpoints available to interact with.

We just used the GET, POST and PUT methods here but you can [get one entry](/developer-docs/latest/developer-resources/content-api/content-api.md#get-an-entry), [get how much entry you have](/developer-docs/latest/developer-resources/content-api/content-api.md#count-entries) and [delete](/developer-docs/latest/developer-resources/content-api/content-api.md#delete-an-entry) an entry too. Learn more about [API Endpoints](/developer-docs/latest/developer-resources/content-api/content-api.md#api-endpoints).
