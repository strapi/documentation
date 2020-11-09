# Introduction to the Content Manager

The Content Manager is a core plugin of Strapi, which is always activated by default and can't be deleted. It is accessible either when the application is in environment development, or in production.

The Content Manager is divided into 2 categories, both displayed in the main navigation: Collection types and Single types. Each category contains the available content-types of the same name, which were created beforehand using the Content-Types Builder (see [Introduction to the Content-Types Builder](../content-types-builder/introduction-to-content-types-builder.md)). From those categories, admin panel users can create, manage and distribute content.

::: tip 💡 TIP
Click the search icon <Fa-Search /> in the main navigation to use a text search and find one of you content types more quickly!
:::

## Collection types

The Collection types category of the Content Manager displays the list of available collection types, which are directly accessible from the main navigation of the admin panel.

For each available collection type, multiple entries can be created, which is why each collection type is divided into 2 interfaces: the list view and the edit view (see [Writing content](writing-content.md)).

The list view of a collection type displays all entries created for that collection type.

![List view of a collection type in the Content Manager](../assets/content-manager/content-manager_list-view.png)

From the list view, it is possible to:

- make a textual search (1) or set filters (2) to find specific entries,
- create a new entry (3),
- configure the settings of the list view (4).

### Filtering entries

Right above the list view table, on the left side of the interface, a **Filters** button is displayed. It allows to set one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the entries that match all the conditions will be displayed).

![Filters in the Content Manager](../assets/content-manager/content-manager_filters.png)

To set a new filter:

1. Click on the **Filters** button.
2. Click on the 1st list box to choose the field on which the condition will be applied.
3. Click on the 2nd list box to choose the type of condition to apply.
4. Enter the value of the condition in the 3rd box.
5. (optional) Click on the **+** button to add another condition-based filter.
6. Click on the **Apply** button.

When applied, the active filter is displayed right next to the **Filters** button.

::: tip NOTE
When active, filters are displayed next to the **Filters** button. They can be deactivated by clicking on the [x].
:::

### Creating a new entry

On the top right left side of the list view interface, a **Add New [collection type name]** button is displayed. It allows to create a new entry for your collection type.

Clicking on the new entry button will redirect you to the edit view, where you will be able to write the content of the newly created entry (see [Writing content](writing-content.md)).


### Configuring list view settings

Right above the list view table, on the right side of the interface, a settings <Fa-Cog /> button is displayed. It allows to access the settings that can be configured for the list view of your collection type.

::: tip NOTE
The configurations only apply to the list view of the collection type from which the settings are accessed (i.e. disabling the filters or search options for a collection type will not automatically also disable these same options for all other collection types).
:::

![Settings of a list view in the Content Manager](../assets/content-manager/content-manager_settings-list-view.png)

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
   - Click the [+] button to add a new field.
   - Click the [x] button to remove a field.
   - Click the [::] button and drag and drop it to the place you want it to be displayed amond the other fields.
5. Click on the **Save** button.

::: tip 💡 TIP
Displayed fields can also be configured temporarily (i.e. resetted as soon as the page is refreshed or when navigating the admin panel outside the Content Manager).

1. Click on the <Fa-Cog /> button.
2. In the Displayed Fields section, tick the boxes associated with the field you want to be displayed in the table.
3. Untick the boxes associated with the fields you want to remove from the table.

![Displayed fields in the settings of a list view in the Content Manager](../assets/content-manager/content-manager_displayed-fields.png)
:::


## Single types

The Single types category of the Content Manager displays the list of available single types, which are directly accessible from the main navigation of the admin panel.

Unlike collection types which have multiple entries, single types are not created for multiple uses. In other words, there can only one be one default entry per available single type. There is therefore no list view in the Single types category.

Clicking on a single type will directly redirect you to the edit view, where you will be able to write the content of your single type (see [Writing content](writing-content.md)).

![Single type in the Content Manager](../assets/content-manager/content-manager_single-type.png)
