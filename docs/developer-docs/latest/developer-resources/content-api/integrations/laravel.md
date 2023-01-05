---
title: Get started with Laravel - Strapi Developer Docs
description: Build powerful applications using Strapi, the leading open-source headless cms and Laravel.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/content-api/integrations/laravel.html
---

# Getting Started with Laravel

This integration guide follows the [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md) and assumes you have fully completed its "Hands-on" path and can consume the API by browsing this [url](http://localhost:1337/restaurants).

Should you wish to use standalone PHP, see the [PHP integration guide](/developer-docs/latest/developer-resources/content-api/integrations/php.md).

This guide assumes you already have [Laravel installed](https://laravel.com/docs/9.x/installation) and are familiar with the basics of the framework.

## Using the native Laravel Http Client

Following the official [Laravel Macros documentation](https://laravel.com/docs/9.x/http-client#macros), you can make a Strapi Macro to integrate to the `http` client from Laravel: 

In `App\Providers\AppServiceProvider` (or your `ServiceProvider`):

```php
use Illuminate\Support\Facades\Http;
 
/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Http::macro('strapi', function () {
        return Http::withHeaders([
            'Authorization' => 'Bearer '. config('strapi.token'), #Token generated in the admin
        ])->baseUrl(config('strapi.url')); # Base url of your strapi app
    });
}
```

Create new config file for strapi in `config/strapi.php`:

```php
  return [
      'url' => env('STRAPI_URL'),
      
      'token' => env('STRAPI_TOKEN', null),
  ];
```

Once your macro has been configured, you may invoke it from anywhere in your application to create a pending request with the specified configuration:

```php
# Access to GraphQL
$response = Http::strapi()->post('graphql', ['query' => $gqlQuery, 'variables' => $variables]); 
#Tip you might include a .gql file here using $gqlQuery = include('gqlQuery.gql')

# Access to Api Rest
$response = Http::strapi()->get('api/pages');
```

## Install the Laravel-Strapi Laravel Package

!!!include(developer-docs/latest/developer-resources/content-api/snippets/integration-guide-not-updated.md)!!!

```bash
composer require dbfx/laravel-strapi
```

This will install [Laravel-Strapi](https://github.com/dbfx/laravel-strapi), a Laravel specific package for interacting with Strapi.

You will need to publish a config file:

```bash
php artisan vendor:publish --provider="Dbfx\LaravelStrapi\LaravelStrapiServiceProvider" --tag="strapi-config"
```

You will also need to define your `STRAPI_URL` and `STRAPI_CACHE_TIME` in the `.env` file:

``` json
STRAPI_URL=http://localhost:1337
STRAPI_CACHE_TIME=3600
```

## Get your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

::: request Example GET request

```php
$strapi = new Dbfx\LaravelStrapi();
$restaurants = $strapi->collection('restaurants');
```
:::

You may now iterate over the `$restaurants` array, which will contain all your restaurants. More options are available as well: 

```php
$restaurants = $strapi->collection('restaurants', $sortKey = 'id', $sortOrder = 'DESC', $limit = 20, $start = 0, $fullUrls = true);
```

## Accessing single type items

You may also access single type items as follows:

```php
$strapi = new Dbfx\LaravelStrapi();

// Fetch the full homepage array
$homepageArray = $strapi->single('homepage');

// Return just the ['content'] field from the homepage array
$homepageItem = $strapi->single('homepage', 'content');
```

## Collection by field

```php
$strapi = new Dbfx\LaravelStrapi();
$entries = $strapi->entriesByField('restaurants', 'slug', 'test-restaurant-name');
```

## Single item from collection

```php
$strapi = new Dbfx\LaravelStrapi();
$entry = $strapi->entry('restaurants', $id = 5);
```

## Conclusion

We've showed how to request your collection types in Strapi using Laravel. When you create a collection type or a single type you will have a number of REST API endpoints available to interact with.

There is more documentation available in the [README](https://github.com/dbfx/laravel-strapi) and in the [PHP integration guide](/developer-docs/latest/developer-resources/content-api/integrations/php.md).
