---
title: Dart
displayed_sidebar: devDocsSidebar
description: Integrate Strapi with Dart.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Dart

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Dart](https://dart.dev/) remains the same except that you do not fetch the same content.

## Create a Dart file

Be sure to have [Dart installed](https://dart.dev/get-dart) on your computer.

```bash
take dart-app
touch main.dart
```

## Use an HTTP client

We'll use [http](https://pub.dev/packages/http) for making HTTP requests.

- Create a `pubspec.yaml` file containing the following:

```yaml
name: my_app
dependencies:
  http: ^0.12.2
```

- Install your dependencies by running the following command:

```bash
dart pub get
```

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

<ApiCall noSideBySide>
<Request title="Example GET request">

```dart
Map<String,String> headers = {
  'Content-Type':'application/json',
  'Accept': 'application/json'
};

var response = await http.get(
  'http://localhost:1337/restaurants',
  headers: headers
);

print(response.body)
```
</Request>


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
</ApiCall>

### Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class Restaurant {
  static String api_url = 'http://localhost:1337';
  static Map<String,String> headers = {
    'Content-Type':'application/json',
    'Accept': 'application/json'
  };

  void all() async {
    var response = await http.get('${api_url}/restaurants', headers: headers);
    print(response.body);
  }
}

void main() {
  var restaurant = Restaurant();
  restaurant.all();
}
```

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission for the `category` Collection type.

In this example a `japanese` category has been created which has the id: 3.

<ApiCall noSideBySide>
<Request title="Example POST request">

```dart
Map<String,String> headers = {
  'Content-Type':'application/json',
  'Accept': 'application/json'
};

var response = await http.post(
  'http://localhost:1337/restaurants',
  headers: headers,
  body: jsonEncode({
    'name': 'Dolemon Sushi',
    'description': 'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious.',
    'categories': [3]
  });
);
```

</Request>

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
</ApiCall>

### Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class Restaurant {
  static String api_url = 'http://localhost:1337';
  static Map<String,String> headers = {
    'Content-Type':'application/json',
    'Accept': 'application/json'
  };

  void all() async {
    var response = await http.get('${api_url}/restaurants', headers: headers);
    print(response.body);
  }

  void create(name, description, category) async {
    final data = jsonEncode({
      'name': name,
      'description': description,
      'categories': category
    });

    var response = await http.post(api_url, headers: headers, body: data);
  }
}

void main() {
  var restaurant = Restaurant();
  restaurant.create(
    'Dolemon Sushi',
    'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious.',
    [3]
  );
}
```

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

<ApiCall noSideBySide>
<Request title="Example PUT request">

```dart
Map<String,String> headers = {
  'Content-Type':'application/json',
  'Accept': 'application/json'
};

var response = await http.put(
  'http://localhost:1337/restaurants/2',
  headers: headers,
  body: jsonEncode({
    'categories': [2]
  });
);
```
</Request>

<Response title="Example response">

```json
{
  "id": 2,
  "attributes": {
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
}
```
</Response>
</ApiCall>

### Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class Restaurant {
  static String api_url = 'http://localhost:1337';
  static Map<String,String> headers = {
    'Content-Type':'application/json',
    'Accept': 'application/json'
  };

  void all() async {
    var response = await http.get('${api_url}/restaurants', headers: headers);
    print(response.body);
  }

  void create(name, description, category) async {
    final data = jsonEncode({
      'name': name,
      'description': description,
      'categories': category
    });

    var response = await http.post('${api_url}/restaurants', headers: headers, body: data);
  }

  void update(id, params) async {
    final data = jsonEncode({
      'categories': params['categories']
    });

    var response = await http.put("${api_url}/restaurants/${id}", headers: headers, body: data);
  }
}

void main() {
  var restaurant = Restaurant();
  restaurant.update(2, {'categories': [2]});
}
```
