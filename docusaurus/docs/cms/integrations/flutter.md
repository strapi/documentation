---
title: Flutter
displayed_sidebar: cmsSidebar
description: Integrate Strapi with Flutter.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Flutter

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/cms/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Flutter](https://flutter.dev/) remains the same except that you do not fetch the same content.

## Create a Flutter application

Be sure to have [Flutter installed](https://flutter.dev/docs/get-started/install) on your computer.

```bash
flutter create flutterapp
cd flutterapp
```

## Use an HTTP client

We'll use [http](https://pub.dev/packages/http) for making HTTP requests.

- Update the `pubspec.yaml` file with the following:

```yaml
...
dependencies:
  flutter:
    sdk: flutter



  # The following adds the Cupertino Icons font to your application.
  # Use with the CupertinoIcons class for iOS style icons.
  cupertino_icons: ^1.0.0
  http: ^0.12.2
...
```

- Install your dependencies by running the following command:

```bash
flutter pub get
```

## GET Request to your collection type

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
  'http://localhost:1337/api/restaurants',
  headers: headers
);

print(response.body)
```

</Request>

<Response>

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
  'http://localhost:1337/api/restaurants',
  headers: headers,
  body: jsonEncode({
    'name': 'Dolemon Sushi',
    'description': 'Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious.',
    'categories': [3]
  });
);
```

</Request>

<Response>

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
  'http://localhost:1337/api/restaurants/2',
  headers: headers,
  body: jsonEncode({
    'categories': [2]
  });
);
```

</Request>

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
</ApiCall>
