# Writing content

In Strapi, writing content consists in filling up fields, which are meant to contain specific content (e.g. text, numbers, media etc.). These fields were configured for the collection or single type beforehand, through the Content-Types Builder.

To write or edit content:

1. Access the edit view of your collection or single type.
2. Write your content, following the available field schema. You can refer to the table below for more information and instructions on how to fill up each field type.

| Field name  | Instructions                                                                                                                                                                                                                                                                                                                                                                  |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Text        | Write your content in the text box. <br><br> 💡 For long texts, the box can be expanded.                                                                                                                                                                                                                                                                                       |
| Rich text   | Write your content, in MarkDown, in the text box. Formatting options are available in the top bar of the text box, as well as a **Switch to preview** button to see the result of your content. <br><br> 💡 The box can be expanded by clicking on **Expand** in the bottom bar. It displays side by side, at the same time, the text box that you can edit and the preview.   |
| Number      | Write your number in the text box. Up and down arrows, displayed on the right of the box, allow to increase or decrease the current number indicated in the text box.                                                                                                                                                                                                         |
| Date        | 1. Click the date and/or time box. <br> 2. Choose a date using the calendar and/or a time among the list.                                                                                                                                                                                                                                                                     |
| Boolean     | Click on **OFF** or **ON**.                                                                                                                                                                                                                                                                                                                                                   |
| Email       | Write a complete and valid email address.                                                                                                                                                                                                                                                                                                                                     |
| Password    | Write a password. <br><br> 💡 Click the eye icon, displayed on the right of the box, to hide or show the password.                                                                                                                                                                                                                                                             |
| Enumeration | 1. Click the text box. <br> 2. Choose an item from the list.                                                                                                                                                                                                                                                                                                                  |
| Media       | 1. Click the media area. <br> 2. Choose an asset from the Media Library, or click the **Add more assets** button to add a new file to the Media Library. <br><br> 💡 It is possible to drag and drop the chosen file in the media area.                                                                                                                                        |
| JSON        | Write your content, in JSON format, in the code text box.                                                                                                                                                                                                                                                                                                                     |
| UID         | Write a unique identifier in the text box. A "Regenerate" button, displayed on the right of the box, allows to automatically generate a UID based on the content type name.                                                                                                                                                                                                   |

::: tip NOTE
For components, writing their content works exactly like for independant fields. They're only displayed as a group.
 
However, for dynamic zones, a couple steps are necessary before accessing the fields:

1. Click on the ![icon add to content](../assets/content-manager/icon_add3.png) **Add to content** button.
2. Choose a component available for the dynamic zone.
3. Fill in the fields of the component.

Note also that dynamic zones can be:

- reordered, using the arrow button ![icon reorder](../assets/content-manager/icon_reorder.png), to define in what order the components of the dynamic zone should be read or seen.
- deleted, using the trash button ![icon delete](../assets/content-manager/icon_delete3.png).

Both buttons are displayed in the top right corner of the dynamic zone area, in the edit view.
:::

## Collaborating on content writing

Contents created with Strapi may be edited by several admin panel users. Since these contents cannot be versioned, and to prevent any content loss, Strapi automatically informs users of concurrent edition situations.

When arriving on the edit view of a content type, if another user is already editing it, you will see the following window pop up on your screen.

[screenshot]

From there, you can choose between 2 options:

- Activate the read-only mode, meaning that you access the edit view of the content type and see its content, but you cannot do any action whatsoever, until the other user has finished and saved the current editing.
- Take over the editing of the page, meaning that you can edit the content type. However, the other user will see a notification pop up to inform them of your choice, and that their modifications cannot be saved.