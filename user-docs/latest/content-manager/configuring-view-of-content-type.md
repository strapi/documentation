# Configuring the view of a content type

Right above the list view table, on the right side of the interface, a settings button <Fa-Cog /> is displayed. It allows to access the configurations that can be set for the list view of your collection type, and to choose which fields to display in the table.

::: tip NOTE
The configurations only apply to the list view of the collection type from which the settings are accessed (i.e. disabling the filters or search options for a collection type will not automatically also disable these same options for all other collection types).
<br>
Note also that the explanations below explain how to permanently configure which fields are displayed in the table of the list view of your collection type. It is also possible to configure the displayed fields temporarily (see [Introduction to content manager](../content-types-builder/introduction-to-content-manager.md)).
:::

![Settings of a list view in the Content Manager](../assets/content-manager/content-manager_settings-list-view.png)

To configure the list view settings: 

1. In the list view, click on the settings button <Fa-Cog />.
2. Click on the **Configure the view** button.
3. Define your chosen new settings:

| Setting name           | Instructions                                                                                       |
| ---------------------- |----------------------------------------------------------------------------------------------------|
| Enable search          | Click on **ON** or **OFF** to able or disable the search.                                          |
| Enable filters         | Click on **ON** or **OFF** to able or disable filters.                                             |
| Enable bulk actions    | Click on **ON** or **OFF** to able or disable the multiple selection boxes in the list view table. |
| Entries per page       | Choose among the listbox the number of entries per page.                                           |
| Default sort attribute | Choose the sorting field and type that will be applied by default.                                 |

4. Define what fields to display in the list view table, and in what order:
   - Click the add button ![icon add new](../assets/content-manager/icon_add.png) to add a new field.
   - Click the delete button ![icon delete](../assets/content-manager/icon_delete.png) to remove a field.
   - Click the reorder button ![icon drag & drop](../assets/content-manager/icon_dragdrop.png) and drag and drop it to the place you want it to be displayed amond the other fields.
   - Click the name of the field to edit the label and/or enable or disable sort on that field.
5. Click on the **Save** button.

::: tip NOTE
Relational fields can also be displayed in the list view. There are however some specificities to keep in mind:

- Only one field can be displayed per relational field.
- Only first-level fields can be displayed (i.e. fields from the relation of a relation can't be displayed).
- If the displayed field contains more than one value, not all its values will be displayed, but a counter indicating the number of values. You can hover this counter to see a tooltip indicating the first 10 values of the relational field.

Note also that relational fields have a couple limitations when it comes to sorting options:

- Sorting cannot be enabled for relational fields which display several fields.
- Relational fields cannot be set as default sort.

:::