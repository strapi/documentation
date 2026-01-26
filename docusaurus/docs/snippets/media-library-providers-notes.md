:::note Notes
* Strapi has a default [`security` middleware](/cms/configurations/middlewares#security) that has a very strict `contentSecurityPolicy` that limits loading images and media to `"'self'"` only, see the example configuration on the <ExternalLink to="https://www.npmjs.com/package/@strapi/provider-upload-aws-s3" text="provider page"/> or the [middleware documentation](/cms/configurations/middlewares#security) for more information.
* When using a different provider per environment, specify the correct configuration in `/config/env/${yourEnvironment}/plugins.js|ts` (see [environments](/cms/configurations/environment)).

:::