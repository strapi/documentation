### Fields selection

Queries can accept a `fields` parameter to select only some fields. Use one of the following syntaxes:

`GET /api/:pluralApiId?fields=field1,field2`
<br>or<br>
`GET /api/:pluralApiId?fields[0]=field1&fields[1]=field2`

To get all fields, use the `*` wildcard.

::: request Example request: Get only firstName and lastName of all users
`GET /api/users?fields=firstName,lastName`
:::

::: request Example request: Get all fields for all users
`GET /api/users?fields=*`
:::

### Relations population

By default, relations are not populated when fetching entries.

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax:

`GET /api/:pluralApiId?populate=field1,field2`

::: request Example request: Get books and populate relations with the author's name and address
`GET /api/books?populate=author.name,author.address`
:::

For convenience, the `*` wildcard can be used to populate all first-level relations:

::: request Example request: Get all books and populate all their first-level relations
`GET /api/books?populate=*`
:::

::: request Example request: Get all books and populate with authors and all their relations
`GET /api/books?populate[author]=*`
:::

<br/>

Only first-level relations are populated with `populate=*`. Use the LHS bracket syntax (i.e. `[populate]=*`) to populate deeper:

::: request Example request: Get all relations nested inside a "navigation" component in the "global" single type
`GET /api/global?populate[navigation][populate]=*`
:::

:::tip
Adding `?populate=*` to the query URL will include dynamic zones in the results.
:::
