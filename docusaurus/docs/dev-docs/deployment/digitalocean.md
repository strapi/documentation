---
title: DigitalOcean Droplet Deployment
displayed_sidebar: devDocsSidebar
description: Learn in this guide how to deploy your Strapi application on DigitalOcean Droplets.

---

# DigitalOcean Droplets

This is a step-by-step guide for deploying a Strapi project to a [DigitalOcean](https://www.digitalocean.com/) Droplet. If you want to deploy your Strapi project from GitHub, you can deploy to DigitalOcean's Platform as a Service (PaaS) called [App Platform](/dev-docs/deployment/digitalocean-app-platform).

:::tip
Follow the setup instructions in the order they are presented below.
:::

Databases can be on a DigitalOcean [Droplet](https://www.digitalocean.com/docs/droplets/) or hosted externally as a service using [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases/).

Prior to starting this guide, you should have created a [Strapi project](/dev-docs/quick-start). Don't use the `--quickstart` flag as this will create an app using `SQLite` which is not desired for remote hosting. Also, have read through the [configuration](/dev-docs/deployment#application-configuration) section.

:::tip
Postgres will be used as the database in this documentation so it's easiest to select that during setup of the Strapi app. However, [any](https://docs.strapi.io/dev-docs/installation/cli#preparing-the-installation) of the supported databases can be used apart from `SQLite`.
:::

### DigitalOcean installation requirements

If you don't have a DigitalOcean account you will need to create one, you can use [this referral link](https://try.digitalocean.com/strapi/).

### Create a "Droplet"

DigitalOcean calls a virtual private server, a [Droplet](https://www.digitalocean.com/docs/droplets/). You need to create a new `Droplet` to host your Strapi project.

#### 1. Log in to your [DigitalOcean account](https://cloud.digitalocean.com/login)

#### 2. Select the `Create` dropdown near the top right, then select `Droplets`

Choose these options:

- Choose a `Region` and `Datacenter` closest to your users
- Select Ubuntu `22.04 (LTS) x64` as the image from the `OS` tab
- Choose an appropriate droplet size and pricing plan.
  :::tip
  The least expensive options are the `Basic` shared CPU and `Regular` SSD. The $4/mo and $6/mo plans are currently unsupported as Strapi [requires](https://docs.strapi.io/dev-docs/deployment#hardware-and-software-requirements) at least 2GB of RAM to build and deploy the admin interface. Therefore, a minimum standard Droplet of **$12/mo** instance is needed.
  :::
- Choose `SSH Key` or `Password` for authentication
  :::tip
  We recommend using a SSH key for better security.
  :::
  - In your terminal, use `pbcopy < ~/.ssh/id_rsa.pub` to copy your existing SSH public key on your development computer to the clipboard.
  - Click on `New SSH Key` and paste in your `SSH Key`. `Name` this SSH key and then `Save`.
    (Additional instructions on creating and using SSH Keys can be found [here](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/create-with-openssh/).)
- **Optional:** Select additional options as required, for example `IPv6`.
- **Optional:** Choose a `Hostname` or leave as-is.
- Click the `Create Droplet` button at the bottom right.

**DigitalOcean** will create your **Droplet** and indicate the progress with a loading bar. Once this is complete, you may continue to the next steps.

### Setup production server and install Node.js

These next steps will help you to _set up a production server_ and _set up a non-root user_ for managing your server.

Follow the official DigitalOcean docs for initial [server set-up](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04) using Ubuntu 22.04. These docs will have you complete the following actions:

#### 1. [Logging and set up root user access to your server with SSH](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04#step-1-logging-in-as-root).

#### 2. [Creating a new user](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04#step-2-creating-a-new-user).

#### 3. [Granting Administrative Privileges to the new user](hhttps://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04#step-3-granting-administrative-privileges).

#### 4. [Setting up a basic firewall](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04#step-4-setting-up-a-firewall).

#### 5. [Giving your regular user access to the server](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04#step-5-enabling-external-access-for-your-regular-user).

Now the server has been set up, [install Node using a PPA](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04#option-2-installing-node-js-with-apt-using-a-nodesource-ppa).

After installing Node (which also installs `npm` by default), you will manually change `npm`'s default directory. The following steps are based on [how to resolve access permissions](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) from `npmjs.com`:

- Create a `.npm-global` directory and set the path to this directory for `node_modules`
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  ```

- Create (or modify) a `~/.profile` file by running
  ```bash
  sudo nano ~/.profile
  ```

- Paste the below into the the first two lines of the open file. Then `ctrl-x` to exit and `y` to save.
  ```bash
  # set PATH so global node modules install without permission issues
  export PATH=~/.npm-global/bin:$PATH
  ```

- Lastly, update your system variables:
  ```bash
  source ~/.profile
  ```

You are now ready to continue to the next section.

### Install and configure Git versioning on your server

A convenient way to maintain your Strapi application and update it during and after initial development is to use [Git](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control). In order to use Git, you will need to have it installed on your Droplet. Droplets should have Git installed by default, so you will first check if it is installed and if it is not installed, you will need to install it.

The next step is to configure Git on your server.

#### 1. Check to see if Git is installed

Run the following command:

```bash
git --version
```

If you see `git version 2.x.x` as the response then you do have `git` installed

#### 2. **Optional:** Install Git

:::note
Only do this step if _not installed_, as above. Please follow these directions on [how to install Git on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-22-04).
:::

#### 3. Configure Git

 [Set up](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-22-04#setting-up-git) the username and email for Git.

### Install the database for your project

1. [Install PostgreSQL on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-22-04) (Through **Step 4** - Creating a New Database).

  Complete the steps to [install PostgreSQL](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-22-04#step-1-installing-postgresql), [add a user](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-22-04#step-3-creating-a-new-role) and [create a database](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-22-04#step-4-creating-a-new-database). It is suggested (though not required) that to use the same credentials specified during project setup for the sake of simplicity. You can view these in the local `.env` file for the project.

2. In order to connect to a PostgreSQL database with Strapi, it needs either to have a password, or specifically state there is no password by noting an empty string.

  :::note
  By convention, any variables that the user is expected to substitiute for their own is prefixed with `your-`, e.g. `your-name`.
  :::

  **Optional:** If you have switched away from the `postgres@` user, run the following:

  ```bash
  sudo -u postgres psql
  [sudo] password for your-name: # this auth prompt appears
  psql (14.8 (Ubuntu 14.8-0ubuntu0.22.04.1)) # shell response after password
  Type "help" for help.
  ```

  Follow the commands below to `alter` the `user` you created and add a `password`.

  ```bash
  psql
  # Enter SQL command below including quotation marks and semicolon.
  postgres=# ALTER USER your-name PASSWORD 'your-password';
  ALTER ROLE # shell response after SQL command
  # Then quit with the \q command as we don't want to alter role.
  postgres=# \q
  exit
  ```

3. **Optional:** If in **development** and your Strapi project uses **SQLite**, you will need to install a dependency package called `pg`.

  On your **development** computer:

  `Path: ./your-project/`

  ```bash
  npm install pg --save
  ```

  The `pg` package is automatically installed locally if you choose `PostgreSQL` as the initial database choice when you first set-up Strapi.

You will need the **database name**, **username** and **password** for later use, so make note of them.

### Local development configuration

- You must have `git` [installed and set-up locally](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup).
- [Initialize](https://git-scm.com/docs/git-init) `git` for your Strapi project created previously.

In your code editor, you will need to edit a file called `database.js`. Replace the contents of the file with the following.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./config/database.js"

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres', 
  connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapidb'),
        user: env('DATABASE_USERNAME', ''),
        password: env('DATABASE_PASSWORD', ''),
        ssl: env.bool("DATABASE_SSL", false) && {
          rejectUnauthorized:env.bool('DATABASE_SSL_SELF', false),
       },
      },
      debug: false,
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./config/database.ts"

export default ({ env }) => ({
  connection: {
    client: 'postgres', 
  connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapidb'),
        user: env('DATABASE_USERNAME', ''),
        password: env('DATABASE_PASSWORD', ''),
        ssl: env.bool("DATABASE_SSL", false) && {
          rejectUnauthorized:env.bool('DATABASE_SSL_SELF', false),
       },
      },
      debug: false,
  },
});
```

</TabItem>

</Tabs>

You are now ready to push these changes to Github:

```bash
git add .
git commit -m "Configured production/database.json"
git push
```

### Deploy from GitHub

You will next deploy your Strapi project to your Droplet by cloning it from GitHub.

From your terminal, logged in as your **non-root** user to your Droplet:

```bash
cd ~
git clone https://github.com/your-handle/your-project.git
```

You will be prompted to enter `your-handle` and a password. This is actually a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) as passwords have been [depreciated](https://github.blog/changelog/2021-08-12-git-password-authentication-is-shutting-down).

Next, navigate to the `your-project` folder, the root for Strapi. You will now need to run `npm install` to install the packages for your project.

```bash
cd your-project
npm install
NODE_ENV=production npm run build
```

Strapi uses port 1337 by default. You will need to configure your `ufw` firewall to allow access to this port, for testing and installation purposes. After you have [installed and configured NGINX](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04), you need to `sudo ufw deny 1337` to close the port to outside traffic.

```bash
cd ~
sudo ufw allow 1337/tcp
sudo ufw enable

Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup
```

Your Strapi project is now installed on your **Droplet**. You have a few more steps prior to being able to access Strapi and [creating your first user](/dev-docs/quick-start).

### Install and configure PM2 Runtime

[PM2 Runtime](https://pm2.keymetrics.io) allows you to keep your Strapi project alive and to reload it without downtime.

Ensure you are logged in as a **non-root** user. You will install **PM2** globally:

```bash
npm install pm2@latest -g
```

### The _ecosystem.config.js_ and _.env_ files

You will need to configure an `ecosystem.config.js` file. This file will manage the **database connection variables** Strapi needs to connect to your database. The `ecosystem.config.js` will also be used by `pm2` to restart your project whenever any changes are made to files within the Strapi file system itself (such as when an update arrives from GitHub). You can read more about this file [here](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/).

Now create the `ecosystem.config.js` file with the command below and open it with the `nano` editor.

```bash
cd ~
pm2 init
sudo nano ecosystem.config.js
```

Next, replace the boilerplate content in the file with the following:

```js
module.exports = {
  apps: [
    {
      name: 'strapi-app',
      cwd: '~/your-project', // assuming app installed as previously specified
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Go to `your-project` folder to create and open a `.env` file:

```bash
cd ~/your-project
sudo nano .env
```

Then copy the contents of the _local_ `.env` file for the Strapi app to the one currently open in `nano`.

```bash
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys # auto-generated
API_TOKEN_SALT=your-api-token-salt # auto-generated
ADMIN_JWT_SECRET=your-admin-jwt-secret # auto-generated
TRANSFER_TOKEN_SALT=your-transfer-token-salt # auto-generated
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=your-database-name # specified during project setup
DATABASE_USERNAME=your-database-username # specified during project setup
DATABASE_PASSWORD=your-database-password # specified during project setup
DATABASE_SSL=false
JWT_SECRET=your-jwt-secret # auto-generated
```

Use the following command to start `pm2`:

```bash
cd ~
pm2 start ecosystem.config.js
```

`pm2` is now set-up to use an `ecosystem.config.js` to manage restarting your application upon changes. This is a recommended best practice.

**OPTIONAL:** You may see your project and set-up your first administrator user, by [creating an admin user](/dev-docs/quick-start).

:::tip
Earlier, `Port 1337` was allowed access for **testing and setup** purposes. After setting up **NGINX**, the **Port 1337** needs to have access **denied**.
:::

Follow the steps below to have your app launch on system startup.

:::tip
These steps are modified from the DigitalOcean [documentation for setting up PM2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04#step-2-installing-pm2).
:::

- Generate and configure a startup script to launch PM2, it will generate a Startup Script to copy/paste, do so:

```bash
$ cd ~
$ pm2 startup systemd

[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-name --hp /home/your-name
```

- Copy/paste the generated command:

```bash
$ sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-name --hp /home/your-name

[PM2] Init System found: systemd
Platform systemd

. . .


[PM2] [v] Command successfully executed.
+---------------------------------------+
[PM2] Freeze a process list on reboot via:
   $ pm2 save

[PM2] Remove init script via:
   $ pm2 unstartup systemd
```

- Next, `Save` the new PM2 process list and environment. Then `Start` the service with `systemctl`:

```bash
pm2 save

[PM2] Saving current process list...
[PM2] Successfully saved in /home/your-name/.pm2/dump.pm2

```

- **OPTIONAL**: You can test to see if the script above works whenever your system reboots with the `sudo reboot` command. You will need to login again with your **non-root user** and then run `pm2 list` and `systemctl status pm2-your-name` to verify everything is working.

Continue below to configure the `webhook`.

### Set up a webhook on DigitalOcean / GitHub

Providing that your project is set-up on GitHub, you will need to configure your **Strapi Project Repository** with a webhook. The following articles provide additional information to the steps below: [GitHub Creating Webhooks Guide](https://developer.github.com/webhooks/creating/) and [DigitalOcean Guide to GitHub WebHooks](https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync).

- You will need to access the `Settings` tab for your `Strapi Project Repository`:

  1. Navigate and click to `Settings` for your repository.
  2. Click on `Webhooks`, then click `Add Webhook`.
  3. The fields are filled out like this:
     - Payload URL: Enter `http://your-ip-address:8080`
     - Content type: Select `application/json`
     - Which events would you like to trigger this webhook: Select `Just the push event`
     - Secret: Enter `YourSecret`
     - Active: Select the checkbox
  4. Review the fields and click `Add Webhook`.

- Next, you need to create a `Webhook Script` on your server. These commands create a new file called `webhook.js` which will hold two variables:

```bash
cd ~
mkdir NodeWebHooks
cd NodeWebHooks
sudo nano webhook.js
```

- In the `nano` editor, copy/paste the following script, but make sure to replace `your_secret_key` and `repo` with the values that correspond to your project, then save and exit.

(This script creates a variable called `PM2_CMD` which is used after pulling from GitHub to update your project. The script first changes to the home directory and then runs the variable `PM2_CMD` as `pm2 restart strapi`.

```js
var secret = 'your_secret_key';
var repo = '~/path-to-your-repo/';

const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;

const PM2_CMD = 'cd ~ && pm2 startOrRestart ecosystem.config.js';

http
  .createServer(function(req, res) {
    req.on('data', function(chunk) {
      let sig =
        'sha1=' +
        crypto
          .createHmac('sha1', secret)
          .update(chunk.toString())
          .digest('hex');

      if (req.headers['x-hub-signature'] == sig) {
        exec(`cd ${repo} && git pull && ${PM2_CMD}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        });
      }
    });

    res.end();
  })
  .listen(8080);
```

- Allow the port to communicate with outside web traffic for `port 8080`:

```bash
sudo ufw allow 8080/tcp
sudo ufw enable

Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup
```

Earlier you setup `pm2` to start the services (your **Strapi project**) whenever the **Droplet** reboots or is started. You will now do the same for the `webhook` script.

- Install the webhook as a `Systemd` service

  - Run `echo $PATH` and copy the output for use in the next step.

```bash
echo $PATH

/home/your-name/.npm-global/bin:/home/your-name/bin:/home/your-name/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

- Create a `webhook.service` file:

```bash
cd ~
sudo nano /etc/systemd/system/webhook.service
```

- In the `nano` editor, copy/paste the following script, but make sure to replace `your-name` **in two places** with your username. Earlier, you ran `echo $PATH`, copy this to the `Environment=PATH=` variable, then save and exit:

```bash
[Unit]
Description=Github webhook
After=network.target

[Service]
Environment=PATH=your_path
Type=simple
User=your-name
ExecStart=/usr/bin/node /home/your-name/NodeWebHooks/webhook.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

- Enable and start the new service so it starts when the system boots:

```bash
sudo systemctl enable webhook.service
sudo systemctl start webhook
```

- Check the status of the webhook:

```bash
sudo systemctl status webhook
```

- You may test your **webhook** by following the instructions [here](https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync#step-4-testing-the-webhook).

### Further steps to take

- You can **add a domain name** or **use a subdomain name** for your Strapi project, you will need to [install NGINX and configure it](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04).
- Deny traffic to Port 1337. You have set-up a proxy using Nginx, you now need to block access by running the following command:

```
cd ~
sudo ufw deny 1337
```

- To **install SSL**, you will need to [install and run Certbot by Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04).
- Set-up [Nginx with HTTP/2 Support](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-with-http-2-support-on-ubuntu-22-04) for Ubuntu 22.04.

Your `Strapi` project has been installed on a **DigitalOcean Droplet** using **Ubuntu 22.04**.
