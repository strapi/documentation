---
title: Email - Strapi Developer Docs
description: Send email from your server or externals providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/email.html
---

# Email

The Email plugin enables applications to send email from a server or [external providers](link). Successful use of the plugin requires the plugin configuration in a `plugins.js` file and an event that triggers an email, such as a custom controller for external requests or a lifecycle hook for requests inside the admin panel. Data from the Content Manager can also be populated into email templates using `sendTemplatedEmail` to streamline programatic emails. The documentation below provides examples for how to configure the email plugin and examples of controllers, routes, and lifecycle hooks to implement programmatic email. 

<!--Rewrite and incorporate above-->[`Sendmail`](https://www.npmjs.com/package/sendmail) is the default email provider, the [provider documentation](link) has instructions for changing providers or creating a new email provider.

## Configure the plugin

something here or is it covered in providers?

## Programmatic usage

### Send an email - `.send()`

To trigger an email in response to a user input add the following function to a custom controller or service. The function will utilize the email provider enabled in the `plugins.js` configuration file.

```js
await strapi.plugins['email'].services.email.send({
  to: 'paulbocuse@strapi.io',
  from: 'joelrobuchon@strapi.io',
  cc: 'helenedarroze@strapi.io',
  bcc: 'ghislainearabian@strapi.io',
  replyTo: 'annesophiepic@strapi.io',
  subject: 'Use strapi email provider successfully',
  text: 'Hello world!',
  html: 'Hello world!',
});
```

### Send an email using a template - `.sendTemplatedEmail()`

When you send an email, you will most likely want to build it from a template you wrote.
The email plugin provides the service `sendTemplatedEmail` that compiles the email and then sends it. The function has the following parameters:

| param           | description                                                                                                              | type   | default |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | ------- |
| `emailOptions`  | Object that contains email options (`to`, `from`, `replyTo`, `cc`, `bcc`) except `subject`, `text` and `html`            | object | `{}`    |
| `emailTemplate` | Object that contains `subject`, `text` and `html` as [lodash string templates](https://lodash.com/docs/4.17.15#template) | object | `{}`    |
| `data`          | Object that contains the data used to compile the templates                                                              | object | `{}`    |

**Example**

```js
const emailTemplate = {
  subject: 'Welcome <%= user.firstname %>',
  text: `Welcome on mywebsite.fr!
    Your account is now linked with: <%= user.email %>.`,
  html: `<h1>Welcome on mywebsite.fr!</h1>
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


::: tip
If you're using a different provider depending on your environment, you can specify the correct configuration in `./config/env/${yourEnvironment}/plugins.js`. More info here: [Environments](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md)
:::

::: tip
Only one email provider will be active at all time. If the email provider setting isn't picked up by strapi, verify you have put the file `plugins.js` in the correct folder, and with correct filename. The selection of email provider is done via configuration file only.  
:::

::: tip
When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template, with default no-reply@strapi.io need to be updated in according to your email provider, otherwise it will fail the test.
More info here: [Configure templates Locally](/user-docs/latest/settings/configuring-users-permissions-plugin-settings.md#configuring-email-templates)
:::

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
