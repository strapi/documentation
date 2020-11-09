# Introduction to the Content Manager

The Content Manager is a core plugin of Strapi, which is always activated by default and can't be deleted. It is accessible either when the application is in environment development, or in production.

From the Content Manager, admin panel users can create, manage and distribute content based on the available content types. The latter must have been created beforehand using the Content-Types Builder (see Introduction to the Content-Types Builder). 

The Content Manager is divided into 2 parts in the admin panel: Collection types and Single types, both accessible from the main navigation.

::: tip 💡 TIP
If you have many content types, don't hesitate to click the search icon <Fa-Search /> to use a text search and find your content type more quickly.
:::

## Collection types

The Collection types part of the Content Manager, in the main navigation of the admin panel, displays the list of available collection types. For each available collection type, multiple entries can be created.

Clicking on a collection type redirects to its list view, which displays all entries created for that collection type.

![List view of a collection type in the Content Manager](../assets/content-manager/content-manager_list-view.png)

From a collection type's list view, it is possible to:

- search (1) and filter (2) the entries,
- configure the settings of the list view (3),
- create a new entry (4),
- click on an entry to access its edit view, from which admin panel users are allowed to:
  - write and edit the content of the entry,
  - delete the entry,
  - save and publish the content of the entry.

### Searching and filtering entries

If your collection type contains many entries, filters and search options can come in handy to find specific entries, instead of scrolling through the entire table of the list view.

#### Using a text search

At the top of the list view, a search bar is displayed. It allows you to make a textual search, that will looks for matching results as you type.

#### Using filters

Right above the list view table, on the left side of the interface, a **Filters** button is displayed. It allows to set one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the entries that match all the conditions will be displayed).

To set a new filter:

1. Click on the **Filters** button.
2. Click on the 1st list box to choose the field on which the condition will be applied.
3. Click on the 2nd list box to choose the type of condition to apply.
4. Enter the value of the condition in the 3rd box.
5. (optional) Click on the **+** button to add another condition-based filter.
6. Click on the **Apply** button.

When applied, the active filter is displayed right next to the **Filters** button.

![Filters in the Content Manager](../assets/content-manager/content-manager_filters.png)

::: tip NOTE
To delete an active filter, click on the cross of where it's displayed.
To delete a filter while configuring filters, click on the **-** button on the left of the condition boxes.
:::

### Configuring list view settings

Right above the list view table, on the right side of the interface, a <Fa-Cog /> button is displayed. It allows to access the settings that can be configured for the list view of the chosen collection type (i.e. Disabling the search or filters for a collection type does not mean that they will also be disabled for all other collection types.).

To configure the list view settings: 

1. Click on the <Fa-Cog /> button.
2. Click on the **Configure the view** button.
3. Define your chosen new settings:

| Setting name           | Instructions                                                                                       |
| ---------------------- |----------------------------------------------------------------------------------------------------|
| Enable search          | Click on **ON** or **OFF** to able or disable the search.                                          |
| Enable filters         | Click on **ON** or **OFF** to able or disable filters.                                             |
| Enable bulk actions    | Click on **ON** or **OFF** to able or disable the multiple selection boxes in the list view table. |
| Entries per page       | Choose among the list box the number of entries per page.                                          |
| Default sort attribute | Choose the sorting field and type that will be applied by default.                                 |

4. Define what fields to display in the list view table, and in what order:
   - Click the + button to add a new field.
   - Click the x button to remove a field.
   - Click the :: button and drag and drop it to the place you want it to be displayed amond the other fields.
5. Click on the **Save** button.

![Settings of a list view in the Content Manager](../assets/content-manager/content-manager_settings-list-view.png)

::: tip 💡 TIP
Displayed fields can also be configured temporarily (i.e. they are resetted as soon as the page is refreshed or when navigating the admin panel outside the Content Manager).

1. Click on the <Fa-Cog /> button.
2. In the Displayed Fields section, tick the boxes associated with the field you want to be displayed in the table.
3. Untick the boxes associated with the fields you want to remove from the table.

![Displayed fields in the settings of a list view in the Content Manager](../assets/content-manager/content-manager_displayed-fields.png)
:::

### Creating a new entry

To create a new entry for your collection type, click on the **Add New [Collection type name]** button on the top right left of the list view interface.


## Single types

The Single types part of the Content Manager, in the main navigation of the admin panel, displays the list of available single types. As single types are not created for multiple uses, there is only one entry per available single type.

Clicking on a single type directly redirect to its edit view. From this edit view, admin panel users are allowed to:

- write and edit the content of the single types,
- save and publish the content of the single type.

![Single type in the Content Manager](../assets/content-manager/content-manager_single-type.png)