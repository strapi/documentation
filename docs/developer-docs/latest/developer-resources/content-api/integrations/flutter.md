# Getting Started with Flutter

This integration guide is following the [Getting started guide](/developer-docs/latest/getting-started/quick-start.html). We assume that you have completed [Step 8](/developer-docs/latest/getting-started/quick-start.html#_8-publish-the-content) and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

If you haven't gone through the getting started guide, the way you request a Strapi API with [Flutter](https://flutter.dev/) remains the same except that you will not fetch the same content.

### Create a Flutter application

Be sure to have [Flutter installed](https://flutter.dev/docs/get-started/install) on your computer.

```bash
flutter create flutterapp
cd flutterapp
```

### Use an HTTP client

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

### GET Request your collection type

Execute a `GET` request on the `restaurant` Collection Type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` Collection Type.

_Request_

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

### POST Request your collection type

Execute a `POST` request on the `restaurant` Collection Type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` Collection Type and the `find` permission for the `category` Collection type.

In this example a `japanese` category has been created which has the id: 3.

_Request_

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

### PUT Request your collection type

Execute a `PUT` request on the `restaurant` Collection Type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` Collection Type.

_Request_

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

## Conclusion

Here is how to request your Collection Types in Strapi using Dart/Flutter. When you create a Collections Type or a Single Type you will have a certain number of [REST API endpoints](/developer-docs/latest/developer-resources/content-api/content-api.html#api-endpoints) available to interact with.
