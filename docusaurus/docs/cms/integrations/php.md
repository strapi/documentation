---
title: PHP
displayed_sidebar: cmsSidebar
description: Integrate Strapi with PHP.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with PHP

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/cms/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [PHP](https://php.net/) remains the same except that you will not fetch the same content.

## Create a PHP file

Be sure to have [PHP installed](https://www.php.net/manual/en/install.php) on your computer.

```bash
touch strapi.php
```

We will use cURL, a built-in PHP extension that allows us to receive and send information via the URL syntax.

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

<ApiCall noSideBySide>
<Request title="Example GET request">

```php
curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');
```

</Request>
<br/>
Running the PHP file on the browser gives this response:

<Response title="Example response">

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

</Response>
</ApiCall>

### Example

```php
<?php
function getRestaurants(){
    $curl = curl_init(); //Initializes curl
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');
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

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission for the `category` Collection type.

<ApiCall noSideBySide>
<Request title="Example POST request">

```php
$restaurants = array(
  'name' => 'Calabar Kitchen',
  'description' => 'Omo, this is a place varieties soup with catfish🦈',
   'categories' => [2]
);

// Initializes a new cURL session
$curl = curl_init();

curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');

curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

// Set the CURLOPT_POST for POST request
curl_setopt($curl, CURLOPT_POST, true);
```



</Request>
<br/>
Running the PHP file on the browser  will give you this response:
<Response title="Example response">

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

</Response>
</ApiCall>

### Example

```php

<?php
function getRestaurants(){
    $curl = curl_init(); //Initializes curl
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');
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

      curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');

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

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `update` permission for the `restaurant` collection type.
PUT Request is slightly different as we need to target the particular entry we want update. We do this by first making a request to http://localhost:1337/api/restaurants/1 and then update what we want to update. In this example, we are going to update  "Biscotte Restaurant" to "Femoni Kitchen".

<ApiCall noSideBySide>
<Request title="Example PUT request">

```php
$restaurants = array(
    'name' => 'Femoni Kitchen'
  );

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants/1');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PUT');

```

</Request>
<br/>
Running the PHP file on the browser  will give you this response:

<Response title="Example response">



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

</Response>
</ApiCall>

### Example

```php
<?php
function getRestaurants(){
    $curl = curl_init(); //Initializes curl
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');
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

      curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');

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
curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants/1');
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

Running an authentication request (getting JWT):

<Response>

```json

[{
    "jwt": "TOKEN",
    "user": {
        "confirmed": true,
        "blocked": false,
        "_id": "XXXXXXX",
        "email": "youremail@example.com",
        "username": "USERNAME",
        "provider": "local",
        "createdAt": "2021-03-22T08:03:04.717Z",
        "updatedAt": "2021-03-22T08:21:09.170Z",
        "__v": 0,
        "role": {
            "_id": "XXXXXXXXX",
            "name": "Authenticated",
            "description": "Default role given to authenticated user.",
            "type": "authenticated",
            "__v": 0,
            "id": "XXXXXXXXXX"
        },
        "id": "XXXXXXXX"
    }
}]
```

</Response>

### Example

```php
<?php
$strapi_auth = [
    "identifier" => STRAPI_USERNAME,
    "password"  =>  STRAPI_USER_PWD
];




function strapi_auth_curl($url, $auth){
    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => $url.'/auth/local',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS =>json_encode($auth),
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json'
        ),
    ));

    $response = curl_exec($curl);

    curl_close($curl);
    return $response;
}
$login = strapi_auth_curl(STRAPI_URL, $strapi_auth);
$strapi_res = json_decode($login);

print_r($strapi_res);

```

Running an authenticated POST request with JWT:

<Response title="Example response">

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

</Response>

### Example

```php
<?php
$jwt = $strapi_res->jwt;
function postRestaurantWithAuth($jwt){
  $auth = array(
        'Authorization: Bearer '.$jwt,
        'Content-Type: application/json'
    );
    $restaurants = array(
        'name' => 'Calabar Kitchen',
        'description' => 'Omo, this is a place that varieties of soup with catfish🦈',
         'categories' => [2]
      );
      
      // Initializes a new cURL session
      $curl = curl_init();
      
      curl_setopt($curl, CURLOPT_URL, 'http://localhost:1337/api/restaurants');
      
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      
      // Set the CURLOPT_POST for POST request
      curl_setopt($curl, CURLOPT_POST, true);
      curl_setopt($curl, CURLOPT_POSTFIELDS,  json_encode($restaurants));
      
      curl_setopt($curl, CURLOPT_HTTPHEADER, $auth);
      $res = curl_exec($curl);
      curl_close($curl);
      print_r($res);

}

postRestaurantWithAuth($jwt);
```
