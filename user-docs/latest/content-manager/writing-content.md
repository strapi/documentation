# Writing content

In Strapi, writing content consists in filling up fields, which are meant to contain specific content (e.g. text, numbers, media etc.). These fields were configured for the collection or single type beforehand, through the Content-Types Builder.

To write or edit content:

1. Access the edit view of your collection or single type.
2. Write your content, following the available field schema. You can refer to the table below for more information and instructions on how to fill up each field type.

| Field name  | Instructions                                                                                                                                                                                                                           |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Text        | Write your content in the text box. <br><br> 💡 For long texts, the box can be expanded.                                                                                                                                                |
| Rich text   | Write your content in the text box. <br><br> 💡 Formatting options are available in the top bar of the text box, as well as a **Switch to preview** button. Also, the box can be expanded by clicking on **Expand** in the bottom bar.  |
| Number      | Write your number in the text box. <br><br> 💡 Up and down arrows, displayed on the right of the box, allow to increase or decrease the current number indicated in the text box.                                                       |
| Date        | 1. Click the date and/or time box. <br> 2. Choose a date using the calendar and/or a time among the list.                                                                                                                              |
| Boolean     | Click on **OFF** or **ON**.                                                                                                                                                                                                            |
| Email       | Write a complete and valid email address.                                                                                                                                                                                              |
| Password    | Write a password. <br><br> 💡 Click the eye icon, displayed on the right of the box, to hide or show the password.                                                                                                                      |
| Enumeration | 1. Click the text box. <br> 2. Choose an item from the list.                                                                                                                                                                           |
| Media       | 1. Click the media area. <br> 2. Choose an asset from the Media Library, or click the **Add more assets** button to add a new file to the Media Library. <br><br> 💡 It is possible to drag and drop the chosen file in the media area. |
| JSON        | Write your content, in JSON format, in the code text box.                                                                                                                                                                              |
| UID         | Write a unique identifier in the text box. <br><br> 💡 Click the "Regenerate" button displayed on the right of the box, to automatically generate a UID based on the content type name.                                                 |

## Collaborating on content writing

Contents created with Strapi may be edited by several admin panel users. Since these contents cannot be versioned, and to prevent any content loss, Strapi automatically informs users of concurrent edition situations.

When arriving on the edit view of a content type, if another user is already editing it, you will see the following window pop up on your screen.

[screenshot]

From there, you will be able to choose between 2 options:

- Activate the read-only mode, meaning that you will access the edit view of the content type and see its content, but you will not be able to do any action whatsoever, until the other user has finished and saved the current editing.
- Take over the editing of the page, meaning that you can edit the content type. However, the other user will see a notification pop up to inform them of your choice, and that their modifications cannot be saved.