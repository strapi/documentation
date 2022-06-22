---
title: Email - Strapi Developer Docs
description: Send email from your server or externals providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/email.html
---

# Email

The Email plugin enables applications to send email from a server or [external providers](/developer-docs/latest/development/using-providers.md). Successful use of the plugin requires the plugin configuration in a `plugins.js` file and an event that triggers an email, such as a custom controller for external requests or a lifecycle hook for requests inside the admin panel. Data from the Content Manager can also be populated into email templates using `sendTemplatedEmail` to streamline programatic emails. The documentation below provides examples for how to configure the email plugin and examples of controllers, routes, and lifecycle hooks to implement programmatic email.

[`Sendmail`](https://www.npmjs.com/package/sendmail) is the default email provider in the Strapi email plugin. It provides functionality for the local development environment but is not production-ready, another provider is likely preferable. The [provider documentation](/developer-docs/latest/development/using-providers.md) has instructions for changing providers or creating a new email provider.

## Send an email with backend customization

To trigger an email in response to a user input add the following function to a custom controller or service. The function will utilize the email provider enabled in the `plugins.js` configuration file.

```js
await strapi.plugins['email'].services.email.send({
  to: 'paulbocuse@strapi.io',
  from: 'joelrobuchon@strapi.io',
  cc: 'helenedarroze@strapi.io',
  bcc: 'ghislainearabian@strapi.io',
  replyTo: 'annesophiepic@strapi.io',
  subject: 'The Strapi email provider worked successfully',
  text: 'Hello world!',
  html: 'Hello world!',
});
```

## Send an email using a template

The email plugin provides the function `sendTemplatedEmail` to compose email from a template. The service compiles the email from the available properties and then sends the email. The function has the following parameters:

| Parameter       | Description                                                                     | Type     | Default |
|-----------------|---------------------------------------------------------------------------------|----------|---------|
| `emailOptions`  | Contains email addressing properties: `to`, `from`, `replyTo`, `cc`, and `bcc`.  | `object` | {}      |
| `emailTemplate` | Contains email content properties: `subject`, `text`, and `html`.                | `object` | {}      |
| `data`          | Contains the data used to compile the templates.                                 | `object` | {}      |

<!--some text here-->

```js
const emailTemplate = {
  subject: 'Welcome <%= user.firstname %>',
  text: `Welcome to mywebsite.fr!
    Your account is now linked with: <%= user.email %>.`,
  html: `<h1>Welcome to mywebsite.fr!</h1>
    <p>Your account is now linked with: <%= user.email %>.<p>`,
};

await strapi.plugins['email'].services.email.sendTemplatedEmail(
  {
    to: user.email,
    // from: is not specified, so it's the defaultFrom that will be used instead
  },
  emailTemplate,
  {
    user: _.pick(user, ['username', 'email', 'firstname', 'lastname']),
  }
);
```

## Send email using lifecycle hooks

[Lifecycle hooks](/developer-docs/latest/development/backend-customization/models.md#lifecycle-hooks) can be used to trigger an email based on administrator actions in the admin panel. For example, an editor can receive an email each time an author submits new content.

```jsx

//path: ./src/api/[api-name]]/content-types/[content-type-name]/lifecycles.js

module.exports = {
    async afterCreate(event) {
        const { result } = event;

        try{
            await strapi.plugins['email'].services.email.send({
                to: 'kai@strapi.io',
                from: 'kai@strapi.io',
                subject: 'test',
                text: '${alertMessage}'
            })
        } catch(err) {
            console.log(err);
        }
    }
}
```

::: tip
When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template, with default no-reply@strapi.io need to be updated in according to your email provider, otherwise it will fail the test.
More info here: [Configure templates Locally](/user-docs/latest/settings/configuring-users-permissions-plugin-settings.md#configuring-email-templates)
:::






<!-- propose removing this section-->

## Fix common problems

You received an `Auth.form.error.email.invalid` error even though the email is valid and exists in the database.

Here is the error response you get from the API.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    {
      "messages": [
        {
          "id": "Auth.form.error.email.invalid"
        }
      ]
    }
  ]
}
```

This error is due to your IP connection. By default, Strapi uses the [`sendmail`](https://github.com/guileen/node-sendmail) package.

This package sends an email from the server it runs on. Depending on the network you are on, the connection to the SMTP server could fail.

Here is the `sendmail` error.

```
Error: SMTP code:550 msg:550-5.7.1 [87.88.179.13] The IP you're using to send mail is not authorized to
550-5.7.1 send email directly to our servers. Please use the SMTP relay at your
550-5.7.1 service provider instead. Learn more at
550 5.7.1  https://support.google.com/mail/?p=NotAuthorizedError 30si2132728pjz.75 - gsmtp
```

To fix it, we suggest you to use another email provider that uses third party to send emails.

When using a third party provider, you avoid having to setup a mail server on your server and get extra features such as email analytics.
