---
title: Upload files
description: Learn how to use the /api/upload endpoints to upload files to Strapi with the REST API.
tags:
- API
- Content API
- upload
- REST API
- Media Library
---

# REST API: Upload files

<Tldr>

The `/api/upload` REST API endpoints enable you to upload files to the Media Library, optionally into a specific folder, and to browse folders. You can also retrieve paginated file lists, update file metadata, and delete files from your Strapi application.

</Tldr>


The [Media Library feature](/cms/features/media-library) is powered in the back-end server of Strapi by the `upload` package. To upload files to Strapi, you can either use the Media Library directly from the admin panel, or use the [REST API](/cms/api/rest), with the following available endpoints :

| Method | Path                       | Description                  |
| :----- | :------------------------- | :--------------------------- |
| GET    | `/api/upload/files`        | Get a list of files          |
| GET    | `/api/upload/files/page`   | Get a paginated list of files |
| GET    | `/api/upload/files/:id`    | Get a specific file          |
| GET    | `/api/upload/folders`      | Get a paginated list of folders |
| GET    | `/api/upload/folders/:id`  | Get a specific folder        |
| POST   | `/api/upload`           | Upload files        |
| POST   | `/api/upload?id=x`      | Update fileInfo     |
| DELETE | `/api/upload/files/:id` | Delete a file       |

:::note Notes
- Through the [Content API](/cms/api/content-api), you can [browse folders](#browse-folders) and [upload files to a specific folder](#upload-files-to-a-specific-folder). The Content API cannot create, rename, move, or delete [folders](/cms/features/media-library#organizing-assets-with-folders). Files uploaded without a `folder` parameter are placed in the automatically created "API Uploads" folder.
- The GraphQL API does not support uploading media files. To upload files, use the REST API or directly add files from the [Media Library](/cms/features/media-library) in the admin panel. Some GraphQL mutations to update or delete uploaded media files are still possible (see [GraphQL API documentation](/cms/api/graphql#mutations-on-media-files) for details). Folders can be fetched with [read-only GraphQL queries](/cms/api/graphql#upload-folders).
- `GET /api/upload/files/:id`, `DELETE /api/upload/files/:id`, and `POST /api/upload?id=x` (see [update `fileInfo`](#update-fileinfo)) accept either the file's numeric `id` or its `documentId`. Files have no draft and publish, so each file has exactly one `documentId`. An unknown `id` or `documentId` returns the same `404` error.
- `GET /api/upload/folders/:id` accepts either the folder's numeric `id` or its `documentId`. Folders have no draft and publish, so each folder has exactly one `documentId`. An unknown `id` or `documentId` returns a `404` error.
:::

## Get a list of files

2 endpoints return files from the Media Library: `/api/upload/files` returns every file as a flat array, while `/api/upload/files/page` returns files using the standard paginated response. Use `/api/upload/files/page` for any non-trivial Media Library.

### Get all files

`GET /api/upload/files` returns a flat array of all files in the Media Library:

```json
[
  {
    "id": 1,
    "documentId": "a1b2c3...",
    "name": "photo.jpg",
    "url": "/uploads/photo.jpg",
    "mime": "image/jpeg",
    "size": 12.34
    // ...other file fields
  }
  // ...
]
```

This endpoint ignores pagination parameters and always returns every file. For large media libraries the response can be very large, so prefer `/api/upload/files/page` instead.

### Get a paginated list of files

`GET /api/upload/files/page` returns files using the standard [paginated response](/cms/api/rest/sort-pagination), wrapped in a `data` array and a `meta.pagination` object.

It accepts the same query parameters as other REST collection endpoints:

| Parameter | Description |
| --------- | ----------- |
| `pagination[page]` | Page number (1-based). Default `1`. |
| `pagination[pageSize]` | Number of files per page. Defaults to the `api.rest.defaultLimit` [configuration](/cms/configurations/api) (`25`), capped by `api.rest.maxLimit` if set. |
| `pagination[start]` | Pagination by offset: number of files to skip. |
| `pagination[limit]` | Pagination by offset: maximum number of files to return. Defaults to the `api.rest.defaultLimit` [configuration](/cms/configurations/api) (`25`), capped by `api.rest.maxLimit` if set. Use `-1` to return all files, up to that cap. |
| `pagination[withCount]` | Whether to run the count query and include `total` and `pageCount` in the response. Defaults to `true`. |
| `filters` | [Filter](/cms/api/rest/filters) the results. |
| `sort` | [Sort](/cms/api/rest/sort-pagination#sorting) the results. |
| `fields` | [Select](/cms/api/rest/populate-select#field-selection) which fields to return. |
| `populate` | [Populate](/cms/api/rest/populate-select#population) relations. |

:::note
Pagination parameters use the nested format (`pagination[page]=2&pagination[pageSize]=10`), not the flat format (`page=2&pageSize=10`). Pagination by page (`page`/`pageSize`) and pagination by offset (`start`/`limit`) are mutually exclusive: combining them returns a `400` error. For details on both pagination methods, see [Sort & Pagination](/cms/api/rest/sort-pagination#pagination).
:::

<ApiCall>
<Request title="Example request: Get the second page of 10 files">

`GET /api/upload/files/page?pagination[page]=2&pagination[pageSize]=10`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "a1b2c3...",
      "name": "photo.jpg",
      "url": "/uploads/photo.jpg",
      "mime": "image/jpeg",
      "size": 12.34
      // ...other file fields
    }
  ],
  "meta": {
    "pagination": {
      "page": 2,
      "pageSize": 10,
      "pageCount": 4,
      "total": 100
    }
  }
}
```

</Response>
</ApiCall>

When using pagination by offset, the `meta.pagination` object returns `start` and `limit` instead of `page` and `pageSize`:

<ApiCall>
<Request title="Example request: Get 5 image files, skipping the first 20, without a total count">

`GET /api/upload/files/page?pagination[start]=20&pagination[limit]=5&pagination[withCount]=false&filters[mime][$startsWith]=image/`

</Request>

<Response title="Example response">

```json
{
  "data": [
    // ...
  ],
  "meta": {
    "pagination": {
      "start": 20,
      "limit": 5
    }
  }
}
```

</Response>
</ApiCall>

When `pagination[withCount]` is `false`, the count query is skipped and `total` and `pageCount` are omitted from the response.

## Browse folders

<VersionBadge version="5.63.0" />

The `/api/upload/folders` endpoints provide read-only access to the [Media Library folders](/cms/features/media-library#organizing-assets-with-folders) from the Content API. Use them to find the `id` of the folder to [upload files to](#upload-files-to-a-specific-folder). You can also use them to display the folder tree in your application.

<!-- source: packages/core/upload/server/src/routes/content-api.ts#L72-L93, packages/core/upload/server/src/controllers/index.ts#L17-L19, packages/core/admin/server/src/strategies/content-api-token.ts#L12 -->
:::prerequisites
Each endpoint requires its own action, in the *folder* section of the *Upload* permissions of a [Users & Permissions role](/cms/features/users-permissions#editing-a-role) or a custom [API token](/cms/features/api-tokens#creating-a-new-api-token):

- `find`, for `GET /api/upload/folders`
- `findOne`, for `GET /api/upload/folders/:id`

These actions are separate from the permissions on files. They are disabled by default for Users & Permissions roles and custom API tokens.
:::

:::caution Folder names can be sensitive
Full access and read-only API tokens can call both endpoints without additional configuration, since a read-only token can access every `find` and `findOne` action. Folder names can include client, brand, or campaign names. If they are sensitive, limit who holds these tokens, and do not grant the folder actions to the Public role. Uploading files to a folder does not require the folder actions.
:::

<!-- source: packages/core/upload/server/src/controllers/content-api-folder.ts#L11-L70, packages/core/upload/server/src/services/folder.ts (getNamePaths) -->
Both endpoints return folders with the following fields:

| Field | Description |
| ----- | ----------- |
| `id` | Numeric `id` of the folder. Use it as the `folder` parameter to [upload files to the folder](#upload-files-to-a-specific-folder). |
| `documentId` | Document ID of the folder. The `folder` upload parameter does not accept it: use `id` instead. |
| `name` | Name of the folder. |
| `path` | Internal path of the folder, used to [filter a folder and its subfolders](#filter-folders). Its segments are internal identifiers, not folder IDs: in the examples below, the folder whose `id` is `3` has the `path` `/1`. |
| `namePath` | Path of the folder built from folder names (for example, `/Clients/Acme/2026`). It is computed for each response, so it cannot be used in `filters` or `sort`. To find a folder by name, filter on `name` (see [Filter folders](#filter-folders)). |
| `parent` | `id` and `documentId` of the parent folder, or `null` for a folder at the root of the Media Library. Omitted when the role or token has the `findOne` action but not the `find` action. |
| `createdAt`, `updatedAt` | Creation and last update dates of the folder. |

The shape of the response is fixed: the `fields` and `populate` parameters are ignored, so files and subfolders are never returned. To get the subfolders of a folder, filter on `parent` (see [Filter folders](#filter-folders)). The Content API does not expose the folder of a file, so it cannot list the files of a folder.

### Get a paginated list of folders

`GET /api/upload/folders` returns folders using the standard [paginated response](/cms/api/rest/sort-pagination), wrapped in a `data` array and a `meta.pagination` object.

It accepts the following query parameters:

| Parameter | Description |
| --------- | ----------- |
| `pagination[page]` | Page number (1-based). Default `1`. |
| `pagination[pageSize]` | Number of folders per page. Defaults to the `api.rest.defaultLimit` [configuration](/cms/configurations/api) (`25`), capped by `api.rest.maxLimit` if set. |
| `pagination[start]` | Pagination by offset: number of folders to skip. |
| `pagination[limit]` | Pagination by offset: maximum number of folders to return. Defaults to the `api.rest.defaultLimit` [configuration](/cms/configurations/api) (`25`), capped by `api.rest.maxLimit` if set. Use `-1` to return all folders, up to that cap. |
| `pagination[withCount]` | Whether to run the count query and include `total` and `pageCount` in the response. Defaults to the `api.rest.withCount` [configuration](/cms/configurations/api) (`true`). |
| `filters` | [Filter](/cms/api/rest/filters) the results (see [Filter folders](#filter-folders)). |
| `sort` | [Sort](/cms/api/rest/sort-pagination#sorting) the results. |

<ApiCall>
<Request title="Example request: Get the first page of folders">

`GET /api/upload/folders?pagination[page]=1&pagination[pageSize]=10`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 3,
      "documentId": "h7d2k9m4p1q8r5s3t6v0w2xy",
      "name": "Projects",
      "path": "/1",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "parent": null,
      "namePath": "/Projects"
    },
    {
      "id": 7,
      "documentId": "n3b8c1f6g4j9k2l7m5p0q8rz",
      "name": "2026",
      "path": "/1/4",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-15T10:30:00.000Z",
      "parent": {
        "id": 3,
        "documentId": "h7d2k9m4p1q8r5s3t6v0w2xy"
      },
      "namePath": "/Projects/2026"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 2
    }
  }
}
```

</Response>
</ApiCall>

### Get a specific folder

`GET /api/upload/folders/:id` returns a single folder. The `:id` can be either the folder's numeric `id` or its `documentId`. An unknown `id` or `documentId` returns a `404` error.

<ApiCall>
<Request title="Example request: Get a folder by documentId">

`GET /api/upload/folders/h7d2k9m4p1q8r5s3t6v0w2xy`

</Request>

<Response title="Example response">

```json
{
  "data": {
    "id": 3,
    "documentId": "h7d2k9m4p1q8r5s3t6v0w2xy",
    "name": "Projects",
    "path": "/1",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "parent": null,
    "namePath": "/Projects"
  }
}
```

</Response>
</ApiCall>

To upload files to this folder, use its `id` (`3`) as the `folder` parameter (see [Upload files to a specific folder](#upload-files-to-a-specific-folder)).

### Filter folders

<!-- source: packages/core/upload/server/src/utils/folder-query.ts#L6-L28, strapi/strapi#28344 -->
`GET /api/upload/folders` accepts the standard REST API [filters](/cms/api/rest/filters). The following table lists common use cases:

| Use case | Request |
| -------- | ------- |
| Find folders by name | `GET /api/upload/folders?filters[name][$eq]=Projects` |
| Get the folders at the root of the Media Library | `GET /api/upload/folders?filters[parent][id][$null]=true` |
| Get the direct subfolders of the folder whose `id` is `3` | `GET /api/upload/folders?filters[parent][id][$eq]=3` |
| Get the folder whose `path` is `/1` and all its subfolders, at any depth | `GET /api/upload/folders?filters[$or][0][path][$eq]=/1&filters[$or][1][path][$startsWith]=/1/` |

Folder names are only unique among folders that share the same parent. When you filter by name, use the `namePath` of each result to pick the right folder.

To get a folder and all its subfolders:

1. Get the `path` of the folder, for example with [`GET /api/upload/folders/:id`](#get-a-specific-folder).
2. Match the folders whose `path` equals this value, or starts with this value followed by `/`.

`$startsWith` alone is not enough: a `path` of `/1` would also match `/10`.

:::note
Filters and sorts cannot use the `files` relation of folders, at any depth. Such requests return a `400` error (`Invalid key files`).
:::


## Upload files

Upload one or more files to your application.

The following parameters are accepted:

| Parameter | Description |
| --------- | ----------- |
| `files` | The file(s) to upload. The value(s) can be a Buffer or Stream. |
| `fileInfo` (optional) | The metadata of the file(s): `name`, `alternativeText`, `caption`, and `focalPoint`. |
| `folder` (optional) | <VersionBadge version="5.63.0" noTooltip /> The numeric `id` of the Media Library folder to upload to (see [upload files to a specific folder](#upload-files-to-a-specific-folder)). If omitted, files are placed in the "API Uploads" folder. |

:::info Signed URLs with private S3 buckets
When using AWS S3 with the `ACL` parameter set to `"private"`, file URLs returned by the upload endpoints are automatically signed. Signed URLs include `X-Amz-Signature` query parameters and an `isUrlSigned: true` flag in the response, making them accessible despite the private bucket ACL. Signed URLs expire based on your `signedUrlExpires` configuration (default: 15 minutes).
:::

:::tip
When uploading an image, include a `fileInfo` object to set the file name, alt text, and caption.
:::

<Tabs>
<TabItem value="browser" label="Browser">

```html
<form>
  <!-- Can be multiple files -->
  <input type="file" name="files" />
  <input
    type="hidden"
    name="fileInfo"
    value='{"name":"homepage-hero","alternativeText":"Person smiling while
      holding laptop","caption":"Hero image used on the homepage"}'
  />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch('/api/upload', {
      method: 'post',
      body: new FormData(e.target)
    });
  });
</script>
```

</TabItem>

<TabItem value="Node.js" label="Node.js">

```js
import { FormData } from 'formdata-node';
import fetch, { blobFrom } from 'node-fetch';

const file = await blobFrom('./1.png', 'image/png');
const form = new FormData();

form.append('files', file, "1.png");
form.append(
  'fileInfo',
  JSON.stringify({
    name: 'Homepage hero',
    alternativeText: 'Person smiling while holding laptop',
    caption: 'Hero image used on the homepage',
  })
);

const response = await fetch('http://localhost:1337/api/upload', {
  method: 'post',
  body: form,
});

```

</TabItem>

</Tabs>

:::caution
You have to send FormData in your request body.
:::

### Upload files to a specific folder

<VersionBadge version="5.63.0" />

<!-- source: packages/core/upload/server/src/controllers/content-api.ts#L47-L70, packages/core/upload/server/src/controllers/validation/content-api/upload.ts#L28-L52 -->
Use the optional `folder` parameter to choose the Media Library folder that uploaded files are placed in. `folder` accepts the following values:

| Value | Result |
| ----- | ------ |
| Not set | Files are placed in the "API Uploads" folder. |
| Numeric `id` of a folder (for example, `3`), not its `documentId` | Files are placed in this folder. |
| `null`, sent as the string `null` in FormData (for example, `form.append('folder', 'null')`) | Files are placed at the root of the Media Library. |

To find the `id` of a folder, [browse folders](#browse-folders). Uploading to a folder only requires the `upload` action of the *Upload* permissions, not the folder actions.

The following examples upload a file to the `Projects` folder from the [browse folders](#browse-folders) examples, whose `id` is `3`:

<Tabs>
<TabItem value="browser" label="Browser">

<!-- source: packages/core/upload/server/src/controllers/content-api.ts#L194-L232 -->
```html
<form>
  <input type="file" name="files" />
  <!-- Upload to the folder whose id is 3 -->
  <input type="hidden" name="folder" value="3" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch('/api/upload', {
      method: 'post',
      body: new FormData(e.target)
    });
  });
</script>
```

</TabItem>

<TabItem value="Node.js" label="Node.js">

<!-- source: packages/core/upload/server/src/controllers/content-api.ts#L194-L232 -->
```js
import { FormData } from 'formdata-node';
import fetch, { blobFrom } from 'node-fetch';

const file = await blobFrom('./photo.jpg', 'image/jpeg');
const form = new FormData();

form.append('files', file, 'photo.jpg');
// Upload to the folder whose id is 3
form.append('folder', '3');

const response = await fetch('http://localhost:1337/api/upload', {
  method: 'post',
  body: form,
});
```

</TabItem>

</Tabs>

The folder applies to every file sent in the request. It also applies to [entry files](#upload-entry-files).

Strapi validates `folder` before uploading any file. When validation fails, no file is uploaded:

- A value that is neither a positive integer nor `null` returns a `400` error (`folder must be a folder id or null`).
- An `id` that matches no folder returns a `400` error (for example, `Folder with id 42 does not exist`).

:::note
`folder` only applies to new uploads. `POST /api/upload?id=x`, which updates an existing file, ignores `folder`, and the file stays in its folder. The Content API does not expose the folder of a file and cannot move files to another folder. To move files, use the [Media Library](/cms/features/media-library#moving-assets) in the admin panel.
:::

:::caution Behavior change in Strapi 5.63.0
Before Strapi 5.63.0, `POST /api/upload` ignored the `folder` parameter. If your code already sends a `folder` value, files are now placed in that folder. A value that is not a valid folder `id` or `null` now returns a `400` error.
:::

## Upload entry files

Upload one or more files that will be linked to a specific entry.

The following parameters are accepted:

| Parameter | Description |
| --------- | ----------- |
|`files`    | The file(s) to upload. The value(s) can be a Buffer or Stream. |
|`path` (optional) | The path where the upload provider stores the file(s): a key prefix in the bucket with `@strapi/provider-upload-aws-s3`, or a Cloudinary folder with `@strapi/provider-upload-cloudinary`. The local provider ignores it. It is not related to Media Library folders. |
| `folder` (optional) | <VersionBadge version="5.63.0" noTooltip /> The numeric `id` of the Media Library folder to upload to (see [upload files to a specific folder](#upload-files-to-a-specific-folder)). If omitted, files are placed in the "API Uploads" folder. |
| `refId` | The ID of the entry which the file(s) will be linked to. Can be either the entry's numeric `id` or its `documentId`. |
| `ref` | The unique ID (uid) of the model which the file(s) will be linked to (see more below). |
| `source` (optional) | The name of the plugin where the model is located. |
| `field` | The field of the entry which the file(s) will be precisely linked to. |

For example, given the `Restaurant` model attributes:

```json title="/src/api/restaurant/content-types/restaurant/schema.json"
{
  // ...
  "attributes": {
    "name": {
      "type": "string"
    },
    "cover": {
      "type": "media",
      "multiple": false,
    }
  }
// ...
}
```

The following is an example of a corresponding front-end code:

```html
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="file" name="files" />
  <input type="text" name="ref" value="api::restaurant.restaurant" />
  <input type="text" name="refId" value="5c126648c7415f0c0ef1bccd" />
  <input type="text" name="field" value="cover" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch('/api/upload', {
      method: 'post',
      body: new FormData(e.target)
    });
  });
</script>
```

:::caution
You have to send FormData in your request body.
:::

## Update fileInfo

Update a file in your application.

`fileInfo` is the only accepted parameter, and describes the fileInfo to update:

```js
import { FormData } from 'formdata-node';
import fetch from 'node-fetch';

const fileId = 50;
const newFileData = {
  alternativeText: 'My new alternative text for this image!',
};

const form = new FormData();

form.append('fileInfo', JSON.stringify(newFileData));

const response = await fetch(`http://localhost:1337/api/upload?id=${fileId}`, {
  method: 'post',
  body: form,
});

```

## Models definition

Adding a file attribute to a [model](/cms/backend-customization/models) (or the model of another plugin) is like adding a new association.

The following example lets you upload and attach one file to the `avatar` attribute:

```json title="/src/api/restaurant/content-types/restaurant/schema.json"

{
  // ...
  {
    "attributes": {
      "pseudo": {
        "type": "string",
        "required": true
      },
      "email": {
        "type": "email",
        "required": true,
        "unique": true
      },
      "avatar": {
        "type": "media",
        "multiple": false,
      }
    }
  }
  // ...
}

```

The following example lets you upload and attach multiple pictures to the `restaurant` content-type:

```json title="/src/api/restaurant/content-types/restaurant/schema.json"
{
  // ...
  {
    "attributes": {
      "name": {
        "type": "string",
        "required": true
      },
      "covers": {
        "type": "media",
        "multiple": true,
      }
    }
  }
  // ...
}
```

