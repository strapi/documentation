---
title: Get started with Laravel - Strapi Developer Documentation
description: Build powerful applications using Strapi, the leading open-source headless cms and Laravel.
---

# Getting Started with Laravel

This integration guide is following the [Getting started guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have completed [Step 8](/developer-docs/latest/getting-started/quick-start.html#_8-publish-the-content) and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

Should you wish to use standalone PHP you may also be interested in the Get started with PHP guide available in the integrations section of the documentation. 

This guide assumes you already have Laravel installed and are familiar with the basics of the framework.

## Install the Laravel-Strapi Laravel Package

```bash
composer require dbfx/laravel-strapi
```

This will install [Laravel-Strapi](https://github.com/dbfx/laravel-strapi), a Laravel specific package for interacting with Strapi.

You will also need to define your STRAPI_URL and STRAPI_CACHE_TIME in .env:

```
STRAPI_URL=http://localhost:1337
STRAPI_CACHE_TIME=3600
```


## Get your collection type

Execute a `GET` request on the `restaurant` Collection Type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` Collection Type.

_Request_

```php
$strapi = new Dbfx\LaravelStrapi();
$restaurants = $strapi->collection('restaurants');
```

You may now iterate over the $restaurants array which will contain all your restaurants. More options are available as well: 

```php
$restaurants = $strapi->collection('restaurants', $sortKey = 'id', $sortOrder = 'DESC', $limit = 20, $start = 0, $fullUrls = true);
```

## Accessing single type items

You may also access Single Type items as follows:

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
$entries = $strapi->entriesByField('restaurants', 'slug', 'test-restuarant-name');
```

## Single item from collection

```php
$strapi = new Dbfx\LaravelStrapi();
$entry = $strapi->entry('restaurants', $id = 5);
```


## Conclusion

Here is how to request your Collection Types in Strapi using PHP. When you create a Collection Type or a Single Type you will have a certain number of REST API endpoints available to interact with.

There is more documentation available in the [README](https://github.com/dbfx/laravel-strapi) or in the [PHP integrations guide](/developer-docs/latest/developer-resources/content-api/integrations/php.html).
