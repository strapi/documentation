---
title: Angular
displayed_sidebar: devDocsSidebar
description: Integrate Strapi with Angular.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Angular

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start) and assumes you have fully completed the "Hands-on" path. You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Angular](https://angular.io) remains the same except that you do not fetch the same content.

## Create a Angular app

Create a basic Angular application using [angular CLI](https://angular.io/guide/setup-local).

```bash
npx -p @angular/cli ng new angular-app
```

## Use the Angular HTTP client

Import the Angular HttpClientModule:

```ts title="./src/app/app.module.ts"
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

<Request title=" Example GET request">

```ts
// this.http is the Angular HttpClient service.
this.http
  .get("http://localhost:1337/api/restaurants", {
    params: { populate: "*" },
  })
  .subscribe((response) => {
    console.log(response);
  });
```

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Biscotte Restaurant",
        "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
        "createdAt": "2023-03-25T11:13:41.883Z",
        "updatedAt": "2023-03-25T11:17:45.737Z",
        "publishedAt": "2023-03-25T11:17:45.735Z",
        "categories": {
          "data": [
            {
              "id": 2,
              "attributes": {
                "name": "Brunch",
                "createdAt": "2023-03-25T11:14:20.605Z",
                "updatedAt": "2023-03-25T11:17:00.158Z",
                "publishedAt": "2023-03-25T11:17:00.153Z"
              }
            }
          ]
        }
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

### Example

```ts title="./src/app/app.component.ts"
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";

interface Restaurant {
  name: string;
  description: string;
}

interface Entry<T> {
  id: number;
  attributes: T;
}

interface Response {
  data: Entry<Restaurant>[];
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  error: any | undefined;
  restaurants$: Observable<Restaurant[]> | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const url = "http://localhost:1337/api/restaurants";
    const opts = { params: { populate: "*" } };

    this.restaurants$ = this.http.get<Response>(url, opts).pipe(
      catchError((error) => this.handleError(error)),
      map((response) => response.data.map((x) => x.attributes))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.error = error;
    return of();
  }
}
```

```html title="./src/app/app.component.html"
<div *ngIf="error">{{error}}</div>

<ul *ngIf="restaurants$|async as restaurants">
  <li *ngFor="let restaurant of restaurants">{{restaurant.name}}</li>
</ul>
```

## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission fot the `category` collection type.

In this example a `japanese` category has been created which has the id: 3.

<Request title="Example POST request with axios">

```ts
// this.http is the Angular HttpClient service.
this.http
  .post("http://localhost:1337/api/restaurants", {
    data: {
      name: "Dolemon Sushi",
      description:
        "Unmissable Japanese Sushi restaurant. The cheese and salmon makis are delicious",
      categories: [3],
    },
  })
  .subscribe((response) => {
    console.log(response);
  });
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

### Example

```ts title="./src/app/app.module.ts"
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

`./src/app/app.component.ts`

```js
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Category {
  name: string;
}

interface Entry<T> {
  id: number;
  attributes: T;
}

interface Response<T> {
  data: Entry<T>[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  allCategories$: Observable<Entry<Category>[]> | undefined;
  error: any | undefined;
  modifiedData = {
    name: '',
    description: '',
    categories: new Array<{ id: number; checked: boolean }>(),
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.allCategories$ = this.http
      .get<Response<Category>>('http://localhost:1337/api/categories')
      .pipe(
        catchError((error) => this.handleError(error)),
        map((response) => response.data),
        tap((data) => {
          data.forEach((x) => {
            this.modifiedData.categories.push({ id: x.id, checked: false });
          });
        })
      );
  }

  onSubmit(): void {
    const body = {
      data: {
        name: this.modifiedData.name,
        description: this.modifiedData.description,
        categories: this.modifiedData.categories
          .filter((x) => x.checked)
          .map((x) => x.id),
      },
    };

    this.http
      .post('http://localhost:1337/api/restaurants', body)
      .pipe(catchError((error) => this.handleError(error)))
      .subscribe((response) => {
        console.log(response);
        this.resetForm();
      });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.error = error.message;
    return of();
  }

  private resetForm(): void {
    this.modifiedData.name = '';
    this.modifiedData.description = '';
    this.modifiedData.categories.forEach((x) => (x.checked = false));
  }
}
```

```html title="./src/app/app.component.html"
<div *ngIf="error">{{error}}</div>

<form (ngSubmit)="onSubmit()">
  <div>
    <label for="name"> Name </label>
    <input name="name" type="text" [(ngModel)]="modifiedData.name" />
  </div>

  <div>
    <label for="address"> Description </label>
    <input
      name="description"
      type="text"
      [(ngModel)]="modifiedData.description"
    />
  </div>

  <div *ngIf="allCategories$ | async as allCategories">
    <br />
    Select categories
    <div *ngFor="let category of allCategories; index as i">
      <label
        >{{category.attributes.name}}
        <input
          type="checkbox"
          name="category{{i}}"
          [(ngModel)]="modifiedData.categories[i].checked"
        />
      </label>
    </div>
  </div>

  <button class="button" type="submit">Create</button>
</form>
```

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `put` permission for the `restaurant` collection type.

We consider that the id of your restaurant is `2`.
and the id of your category is `2`.

<Request title="Example PUT request">

```ts
// this.http is the Angular HttpClient service.
this.http
  .put("http://localhost:1337/api/restaurants/2", {
    data: {
      categories: [2],
    },
  })
  .subscribe((response) => {
    console.log(response);
  });
```

</Request>

<Response title="Example response">

```json
{
    "data": [
        {
            "id": 1,
            "attributes": {
                "name": "Biscotte Restaurant",
                "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
                "createdAt": "2022-05-23T09:41:46.762Z",
                "updatedAt": "2022-05-23T09:44:32.424Z",
                "publishedAt": "2022-05-23T09:44:32.423Z",
                "categories": {
                    "data": [
                        {
                            "id": 2,
                            "attributes": {
                                "name": "Brunch",
                                "createdAt": "2022-05-23T09:42:16.764Z",
                                "updatedAt": "2022-05-23T09:44:21.534Z",
                                "publishedAt": "2022-05-23T09:44:21.532Z"
                            }
                        }
                    ]
                }
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
