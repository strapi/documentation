---
title: Design tokens
displayed_sidebar: devDocsSidebar
---

# Full list <AlphaBadge /> <BetaBadge /> <FutureBadge /> <EnterpriseBadge /> <CloudTeamBadge /> <CloudProBadge /> <CloudCustomBadge />

This paragraph includes an **Annotation component** <Annotation>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua: <ul><li>Ut enim ad minim veniam, quis _nostrud_ exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li><li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</li></ul>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt [mollit anim](#) id est laborum.</Annotation>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Badges can also be used within the text, for instance as follows: <EnterpriseBadge />.

## Built-in Docusaurus components

<details>
<summary>Accordion-like component called "details"</summary>

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

</details>

```js title="/path/to/my/file.txt {3,5} showLineNumbers
// We highlighted lines 3 and 5 and showed line numbers
// but line numbers can be hidden
const machin = () => {
  truc: {
    optionA: true,
    optionB: ['blabla', false]
  }
};

export const;
```

<Tabs groupId="un-deux">

<TabItem value="un" label="Tab one">

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

<Tabs>
<TabItem value="three" label="JavaScript">

We can have tabs inside tabs, too.

</TabItem>

<TabItem value="four" label="TypeScript">

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

</TabItem>

</Tabs>

</TabItem>
<TabItem value="deux" label="Tab two">

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?

</TabItem>
</Tabs>

We can display different images depending on the dark or light mode:

<ThemedImage
  alt="List view of a collection type in the Content Manager"
  sources={{
    light: '/img/assets/content-manager/content-manager_list-view.png',
    dark: '/img/assets/content-manager/content-manager_list-view_DARK.png',
  }}
/>

## Callouts

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
and

### Built-in callouts

These callouts are provided with our Docusaurus theme.

:::info
This is an info callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

:::note
This is a note callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

:::tip
This is a tip callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

:::caution
This is a caution callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

:::danger
This is a danger callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

### Custom callouts

These are custom callouts Pierre created for specific purposes.

<SubtleCallout emoji="🧪" title="Subtle callout">
This is a subtle callout. Title and emoji are customizable. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
</SubtleCallout>

:::callout
This is a default callout. It doesn't have a title if none is defined. Other than that, it works like every other callout available.
:::

:::callout Default callout
This is a default callout with a title. It does not show any emoji by default, but we can add one. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

:::prerequisites
This is a prerequisites callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

:::info
This is an info callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

:::strapi
This is a strapi callout with its default emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

## Custom layout components

These are custom layout components that Pierre created for the team's purposes.

### Columns

The content can be grouped into columns:

<Columns>
<ColumnLeft>
This is the left column. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</ColumnLeft>
<ColumnRight>
This is the right column. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</ColumnRight>
</Columns>

### Side-by-side components

We also have containers that are used like follows:

<SideBySideContainer>
<SideBySideColumn>
This is the main column. Its content is sticky. Try to scroll the page and see what happens.

It can contain whatever you want:

:::info
This is an info callout with its default title and emoji. It does not show any emoji by default. Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.
:::

</SideBySideColumn>
<SideBySideColumn>
This is the secondary column.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</SideBySideColumn>
</SideBySideContainer>

### Cards

We also have cards. Actually, 2 types of cards. The big ones and the small ones.

<CustomDocCardsWrapper>

<CustomDocCard emoji="↕️" title="REST API" description="Query the Content API from a front-end application through REST." link="/dev-docs/api/rest" />

<CustomDocCard emoji="↕️" title="GraphQL API" description="Query the Content API  from a front-end application through GraphQL." link="/dev-docs/api/graphql" />

<CustomDocCard emoji="🔃" title="Document Service API" description="Query your data through the backend server or plugins." link="/dev-docs/api/document-service" />

<CustomDocCard emoji="🔃" title="Query Engine API" description="Query your data by interacting directly with the database layer." link="/dev-docs/api/query-engine" />

<CustomDocCard emoji="🔄" title="Integration guides" description="Use 3rd-party technologies to query the Content API from a front-end application." link="/dev-docs/integrations" />

</CustomDocCardsWrapper>

Small cards are displayed like this:

<CustomDocCard small emoji="💁" title="How to authenticate a REST API request" link="/dev-docs/api/guides/how-to-authenticate-a-rest-api-request" />

<CustomDocCard small emoji="💁" title="How to populate content with the REST API" link="/dev-docs/api/guides/how-to-populate-content-with-the-rest-api" />

## Custom API-related components

Pierre implemented custom components to display API calls in a specific manner:

<ApiCall>

<Request>

`GET http://localhost:1337/api/restaurants`

</Request>

<Response>

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Restaurant A",
        "description": "Restaurant A's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "Restaurant B",
        "description": "Restaurant B's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
  ],
  "meta": {}
}

```

</Response>

</ApiCall>

We can also have a language selector within a dropdown, for when we'll need to support several query languages:

<MultiLanguageSwitcher title="Example request using the shorthand syntax">
<MultiLanguageSwitcherRequest language="REST">

`PUT` `http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: {
      connect: [2, 4]
    }
  }
}
```

</MultiLanguageSwitcherRequest>

<MultiLanguageSwitcherRequest language="Node">

```js
const fetch = require('node-fetch');

const response = await fetch(
  'http://localhost:1337/api/restaurants/1',
  {
    method: 'put',
    body: {
      data: {
        categories: {
          connect: [2, 4]
        }
      }
    }
  }
);
```

</MultiLanguageSwitcherRequest>
</MultiLanguageSwitcher>

API calls components can also be used within the side-by-side containers:

<SideBySideContainer>

<SideBySideColumn>

### Section title

Returns entries matching the query filters (see [API parameters](/dev-docs/api/rest/parameters) documentation).

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request>

`GET http://localhost:1337/api/restaurants`

</Request>

<Response>

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Restaurant A",
        "description": "Restaurant A's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "Restaurant B",
        "description": "Restaurant B's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
  ],
  "meta": {}
}

```

</Response>

</ApiCall>

</SideBySideColumn>

</SideBySideContainer>



## 🎅 Wishlist

- Custom components:
  - **Icons** <br/>
    An icons system with different types of icons for:
      - status (alpha, beta, future or experimental)
      - pricing or plan-related (Entreprise, Cloud, Cloud Pro, Cloud Team, etc.)
      - "new"/"updated": to be used in the table of content/sidebar on the left to indicate that a given page was recently added or updated
      <br/><br/>👉 Icons should:
          <br/> - be clickable
          <br/> - display a tooltip when hovered

  - **Version badge or component** <br />
    We'd like to display the minimum number version from which the feature can be used.

  - **Last update and contributor component** <br />
    At the bottom of the page, this component would show when was the page updated for the last time, and by who.

- Smaller default reading size and more white space<br/>Pierre constantly zooms out the website at 90% because he founds the default font size too big. Especially in the sidebar.

***

💡 _Inspirations_:
- [Stripe documentation](https://stripe.com/docs/api)
- [Material for MkDocs theme](https://squidfunk.github.io/mkdocs-material/reference/)
