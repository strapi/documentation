---
title: AWS Cognito provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# AWS Cognito provider for Users & Permissions

<h4 id="aws-cognito">Using ngrok</h4>

AWS Cognito accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="aws-cognito-config">AWS Cognito configuration</h4>

- Visit the AWS Management Console <br/> [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
- If needed, select your **Region** in the top right corner next to the Support dropdown
- Select the **Services** dropdown in the top left corner
- Click on **Cognito** in the `Security, Identity & Compliance` section
- Then click on the **Manage User Pools** button
- If applicable either create or use an existing user pool. You will find hereafter a tutorial to create a User Pool <br/> [https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html](https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html)
- Go to the **App clients** section in your cognito user pool and create a new client with the name `Strapi Auth` and set all the parameters and then click on **Create app client**
- You should now have an **App client id** and by clicking on the button **Show Details** you will be able to see the **App client secret**. Do copy those two values **App client id** and **App client secret** somewhere for later use when configuring the AWS Cognito provider in Strapi.
- Go to the **App integration section** and click on **App client settings**
- Look for your app client named `Strapi Auth` and enable Cognito User Pool by checking it in the **Enabled Identity Providers** section of your newly created App client
- Fill in your callback URL and Sign out URL with the value `http://localhost:1337/api/connect/cognito/callback` or the one provided by your AWS Cognito provider in Strapi
- In the **Oauth 2.0** section select `Authorization code grant` and `Implicit grant` for the **Allowed OAuth Flows** and select `email`, `openid` and `profile` for the **Allowed OAuth Scopes**
- You can now click on **Save changes** and if you have already configured your domain name then you should be able to see a link to the **Launch Hosted UI**. You can click on it in order to display the AWS Cognito login page. In case you haven't yet configured your domain name, use the link **Choose domain name** at the bottom right of the page in order to configure your domain name. On that page you will have an `Amazon Cognito Domain` section where a `Domain prefix` is already setup. Type a domain prefix to use for the sign-up and sign-in pages that are hosted by Amazon Cognito, this domain prefix together with the `.auth.YOUR_REGION.amazoncognito.com` will be the **Host URI (Subdomain)** value for your strapi configuration later on.

<h4 id="aws-cognito-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Cognito** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: fill in the **App client id** (`5bd7a786qdupjmi0b3s10vegdt`)
  - **Client Secret**: fill in the **App client secret** (`19c5c78dsfsdfssfsdfhpdb4nkpb145vesdfdsfsffgh7vwd6g45jlipbpb`)
  - **Host URI (Subdomain)**: fill in the URL value that you copied earlier (`myapp67b50345-67b50b17-local.auth.eu-central-1.amazoncognito.com`)
  - **The redirect URL to your front-end app**: if you are using strapi react-login [https://github.com/strapi/strapi-examples/tree/master/examples/login-react/](https://github.com/strapi/strapi-examples/tree/master/examples/login-react/) use `http://localhost:3000/connect/cognito/redirect` but if you do not yet have a front-end app to test your Cognito configuration you can then use the following URL `http://localhost:1337/api/auth/cognito/callback`
