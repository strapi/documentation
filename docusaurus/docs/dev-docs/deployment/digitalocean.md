---
title: DigitalOcean Droplet Deployment
displayed_sidebar: devDocsSidebar
description: Learn in this guide how to deploy your Strapi application on DigitalOcean Droplets.

---

import ConsiderStrapiCloud from '/docs/snippets/consider-strapi-cloud.md'

# DigitalOcean Droplets

This is a step-by-step guide for deploying a Strapi project to a [DigitalOcean Droplet](https://www.digitalocean.com/docs/droplets/). Alternatively, you can also choose to deploy to DigitalOcean's Platform-as-a-Service (PaaS) called [App Platform](/dev-docs/deployment/digitalocean-app-platform) if database-related requirements and budget better fit with your use case.

This guide covers hosting the database on a DigitalOcean Droplet. Another option is to host the database externally as a service using [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases/).

:::prerequisites
- You have created a [Strapi project with a local PostgreSQL database](https://tute.io/install-configure-strapi-postgresql).
- You have read through the [general deployment configuration](/dev-docs/deployment#application-configuration) section.
- You have created a DigitalOcean account. You can use [this referral link](https://try.digitalocean.com/strapi/).
:::

:::caution
When creating your Strapi project, don't use the `--quickstart` flag as the quick start installation uses SQLite, which is not desired for remote hosting.
:::

<ConsiderStrapiCloud />

### Create a "Droplet"

DigitalOcean calls a virtual private server, a [Droplet](https://www.digitalocean.com/docs/droplets/). Create a new Droplet to host your Strapi project:

1. Log in to your [DigitalOcean account](https://cloud.digitalocean.com/login).
2. Select the _Create_ dropdown near the top right, then select **Droplets**.
3. Choose a _Region_ and _Datacenter_ closest to your users' location.
4. Select Ubuntu **22.04 (LTS) x64** as the image from the _OS_ tab.
5. Choose an appropriate droplet size and pricing plan, depending on your needs. Strapi [requires](/dev-docs/deployment#hardware-and-software-requirements) at least 2GB of RAM to build and deploy the admin interface.
6. Choose **SSH Key**.
7. In a terminal instance on your computer, run the following command: `pbcopy < ~/.ssh/id_rsa.pub`. The command copies the existing SSH public key on your development computer to the clipboard.
8. Back on the DigitalOcean website, paste your public SSH key into the _New SSH Key_ field. Name this SSH key and click on **Save**. 
9. _(optional)_ Select additional options as required, for example **IPv6**.
10. _(optional)_ Choose a _Hostname_ or leave as-is.
11. Click the **Create Droplet** button at the bottom right.

DigitalOcean will create your Droplet and indicate the progress with a loading bar. Once complete, proceed to setting up a production server and installing Node.js.

:::tip
Additional instructions on creating and using SSH Keys can be found [on the official DigitalOcean documentation](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/create-with-openssh/).
:::

### Setup production server and install Node.js

The following next steps will help you to set up a production server and a non-root user for managing the server.

#### Setting up a production server

Follow the official DigitalOcean documentation for initial [server set-up](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04) using Ubuntu 22.04.

#### Installing and configuring Node.js and npm

Now the server has been set up, install Node using a personal package archive (PPA), as described in the [official DigitalOcean documentation](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04#option-2-installing-node-js-with-apt-using-a-nodesource-ppa).

After installing Node (which also installs `npm` by default), you will manually change `npm`'s default directory. The following steps are based on [how to resolve access permissions](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) from the official Node documentation:

1. Create a `.npm-global` directory and set the path to this directory for `node_modules` by running the following commands:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  ```
2. Create (or modify) a `~/.profile` file by running the following command:
  ```bash
  sudo nano ~/.profile
  ```
3. Paste the following lines into the first 2 lines of the open `~/.profile` file:
  ```bash
  # set PATH so global node modules install without permission issues
  export PATH=~/.npm-global/bin:$PATH
  ```
  Then press `Ctrl+X` to exit, `y` to save and `Enter` to accept.
4. Update your system variables by running the following command:
  ```bash
  source ~/.profile
  ```

You are now ready to install and configure Git versioning on your server.

### Install and configure Git versioning on your server

A convenient way to maintain your Strapi application and update it during and after initial development is to use [Git](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control). In order to use Git, you will need to have it installed on your Droplet.

Droplets should have Git installed by default. Check if Git is installed by running the following command:

  ```bash
  git --version
  ```

If the terminal returns `git version` followed by some version number (e.g., `git version 2.x.x`), Git is already installed, and you can proceed to [installing the database for your project](#install-the-database-for-your-project).

If Git is not installed:
1. Install Git by following the DigitalOcean documentation on [how to install Git on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-22-04).
2. Configure Git by setting up the username and email as described in the [DigitalOcean documentation](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-22-04#setting-up-git).

### Install the database for your project

Install PostgreSQL on Ubuntu 22.04 by following the [DigitalOcean documentation](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-22-04) through to "Step 4 - Creating a New Database". Once done, PostgreSQL is installed and a user and a database are created.

:::caution
To connect to a PostgreSQL database with Strapi, the database:
  * either needs to have a password,
  * or specifically states there is no password by declaring an empty string (`''`) as the password.
:::

To connect to the PostgreSQL database with Strapi: 

1. _(optional)_ If you have switched away from the `postgres@` user, run the following:

    ```bash
    sudo -u postgres psql
    [sudo] password for your-name: # this auth prompt appears
    psql (14.8 (Ubuntu 14.8-0ubuntu0.22.04.1)) # shell response after password
    Type "help" for help.
    ```

2. Run the following commands to alter the user you created and add a password, replacing `your-name` and `'your-password'` by your own values:

    ```bash
    psql
    # Enter SQL command below including quotation marks and semicolon.
    postgres=# ALTER USER your-name PASSWORD 'your-password';
    ALTER ROLE # shell response after SQL command
    # Then quit with the \q command as we don't want to alter role.
    postgres=# \q
    exit
    ```

3. _(optional)_ The `pg` package is automatically installed locally if you chose `PostgreSQL` as the initial database choice when you first set up Strapi. If your Strapi project uses SQLite, install the `pg` dependency package. On your development machine, run the following command in your Strapi project folder:

  ```bash
  npm install pg --save
  ```

Note the database name, username and password for later use.

### Configure for local development

:::prerequisites
- You must have `git` [installed and set-up locally](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup).
- Git should be [initialized](https://git-scm.com/docs/git-init) for your previously created Strapi project.
:::

1. Replace the content of the `config/database.js` with the following:

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

2. Push these changes to Github by running the following commands:

  ```bash
  git add .
  git commit -m "Configured production/database.json"
  git push
  ```

### Deploy from GitHub

You will now deploy your Strapi project to your Droplet by cloning it from GitHub.

1. From your terminal, logged in as the non-root user to your Droplet, run the following commands, replacing `your-handle` and `your-project` with your GitHub username and project's name:

  ```bash
  cd ~
  git clone https://github.com/your-handle/your-project.git
  ```

2. (_optional_) If using password-based authentication instead of a SSH key:

    - You will be prompted to enter `your-handle` and a password when attempting to clone. This is actually a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) (PAT) as passwords have been [deprecated](https://github.blog/changelog/2021-08-12-git-password-authentication-is-shutting-down).
    - In order to overcome an [issue](https://stackoverflow.com/questions/22147574/github-fatal-could-not-read-username-for-https-github-com-no-such-file-o) with webhooks later on, run the following commands, replacing `your-handle`, `your-pat`, and `your-project` with the appropriate values:
      ```bash
      cd ~/your-project
      git remote add origin https://your-handle:your-pat@github.com/your-handle/your-project.git

      # If response is "fatal: remote origin already exists.", then run:
      git remote set-url origin https://your-handle:your-pat@github.com/your-handle/your-project.git
      ```

3. Navigate to your project's folder, which is the root folder for Strapi, and install the npm packages for your project by running the following commands, replacing `your-project` by your project's name on GitHub:

  ```bash
  cd your-project
  npm install
  ```

4. Build Strapi's admin panel by running the following command:

  ```bash
  NODE_ENV=production npm run build
  ```

5. As Strapi uses port 1337 by default, you must configure your `ufw` firewall to allow access to this port for testing and installation purposes, by running the following commands:

  ```bash
  cd ~
  sudo ufw allow 1337/tcp
  sudo ufw enable
  ```

  Press `y` to answer yes to the `Command may disrupt existing ssh connections. Proceed with operation (y|n)?` message. 

Your Strapi project is now installed on your DigitalOcean Droplet. Before being able to create your first user, you must install and configure [Nginx](#install-and-configure-nginx-web-server) and [pm2](#install-and-configure-pm2), configure the [`ecosystem.config.js` file and environment variables](#configure-the-ecosystemconfigjs-and-env-files), and [setup webhooks](#set-up-a-webhook-on-digitalocean--github).

### Install and configure Nginx web server

1. Follow the guide on the [official DigitalOcean documentation](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04) to install and configure Nginx, keeping in mind the following specificities:

    * You can add a domain name or use a subdomain name for your Strapi project.
    * References to `your_domain` in "Step 5 – Setting Up Server Blocks" should include the TLD, (e.g. `example.com`).
    * The location field in "Step 5 – Setting Up Server Blocks", specified as `try_files $uri $uri/ =404;`, must be replaced with the following:

        ```
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        ```
    * Nginx has a [configuration setting](http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size) called `client_max_body_size` that will prevent file uploads greater than the specified amount. This will need to be adjusted since its default is only 1MB. Note that strapi middleware is already in charge of parsing requests of file sizes up to 200MB.
      ```
      ...
      http {
        ...
        client_max_body_size 200m; # Or 0 to disable
        ...
      }
      ...
      ```

2. Close the port to outside traffic by running the following commands:

    ```bash
    cd ~
    sudo ufw deny 1337
    ```

### Install and configure pm2

[pm2](https://pm2.keymetrics.io) allows you to keep your Strapi project alive and to reload it without downtime.

Ensure you are logged in as a non-root user and install pm2 globally by running the following command:

```bash
npm install pm2@latest -g
```

### Configure the `ecosystem.config.js` and `.env` files

The `ecosystem.config.js` manages the database connection variables that Strapi needs to connect to your database. `ecosystem.config.js` is also used by `pm2` to restart your project whenever any changes are made to files within the Strapi file system itself, such as when an update arrives from GitHub. You can read more about the `ecosystem.config.js` file in the [official pm2 documentation](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/).

1. Create the `ecosystem.config.js` file with the command below and open it. We'll use the `nano` editor:

    ```bash
    cd ~
    pm2 init
    sudo nano ecosystem.config.js
    ```

2. Replace the boilerplate content in the file with the following:

    ```js
    module.exports = {
      apps: [
        {
          name: 'strapi-app',
          cwd: '/home/your-name/your-project', // must have absolute path
          script: 'npm',
          args: 'start',
          env: {
            NODE_ENV: 'production',
          },
        },
      ],
    };
    ```

3. Go to `your-project` folder to create and open a `.env` file:

    ```bash
    cd ~/your-project
    sudo nano .env
    ```

4. Copy the contents of the local `.env` file for the Strapi application to the one currently open in `nano`. Replace the database name and credentials with the ones [specified](#install-the-database-for-your-project) during database setup.

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
    DATABASE_NAME=your-database-name # specified during database setup
    DATABASE_USERNAME=your-database-username # specified during database setup
    DATABASE_PASSWORD=your-database-password # specified during database setup
    DATABASE_SSL=false
    JWT_SECRET=your-jwt-secret # auto-generated
    ```

5. Run the following commands to start `pm2`:

    ```bash
    cd ~
    pm2 start ecosystem.config.js
    ```

`pm2` is now set-up to use an `ecosystem.config.js` to manage restarting your application upon changes. This is a recommended best practice.

#### Configure `.env` to launch Strapi on system startup

The following steps are modified from the DigitalOcean [documentation for setting up PM2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04#step-2-installing-pm2):

1. Generate a startup script to launch PM2 by running:

    ```bash
    $ cd ~
    $ pm2 startup systemd

    # Shell output
    [PM2] Init System found: systemd
    [PM2] To setup the Startup Script, copy/paste the following command:
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-name --hp /home/your-name
    ```

2. Copy the generated command from above and paste to the terminal:

    ```bash
    $ sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-name --hp /home/your-name

    # Shell output
    [PM2] Init System found: systemd
    Platform systemd

    # ...

    [PM2] [v] Command successfully executed.
    +---------------------------------------+
    [PM2] Freeze a process list on reboot via:
      $ pm2 save

    [PM2] Remove init script via:
      $ pm2 unstartup systemd
    ```

3. Save the new PM2 process list and environment:

    ```bash
    pm2 save

    # Shell output
    [PM2] Saving current process list...
    [PM2] Successfully saved in /home/your-name/.pm2/dump.pm2

    ```

:::tip
You can test to see if the script above works whenever your system reboots with the `sudo reboot` command. Login again with your non-root user and run `pm2 list` and `systemctl status pm2-your-name` to verify everything is working. You can also check logs with `pm2 logs strapi-app --lines 20`.
:::

The Strapi production server should now be available at the domain that was [specified](#install-and-configure-nginx-web-server) during Nginx setup. The login screen is available at the `/admin` endpoint to that same domain.

### Set up a webhook on DigitalOcean/GitHub

Providing that your project is set up on GitHub, you must configure your Strapi project repository there with a webhook.

:::note
More information can be found on webhooks in general in the [GitHub documentation](https://developer.github.com/webhooks/creating/) and [DigitalOcean documentation](https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync).
:::

1. Go to `your-project` on GitHub and set up a webhook by following [step 1](https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync#step-1-setting-up-a-webhook) from the DigitalOcean article. Make note of what was entered for `your-webhook-secret` for later.

2. Create a webhook script on your server. The following commands create a new file called `webhook.js` which will hold 2 variables:

    ```bash
    cd ~
    mkdir NodeWebhooks
    cd NodeWebhooks
    sudo nano webhook.js
    ```

3. In the open `nano` editor, paste the following script, ensuring to update the values for the `secret` and `repo` variables at the top of the file. Then save and exit.

    ```js
    var secret = 'your-webhook-secret'; // created in GitHub earlier
    var repo = '~/your-project';

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
            exec(`cd ${repo} && git pull && NODE_ENV=production npm run build && ${PM2_CMD}`, (error, stdout, stderr) => {
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

  :::info
  The script above declares a variable called `PM2_CMD` which is used after pulling from GitHub to update your project. The script first changes to the home directory and then runs the variable `PM2_CMD` as `pm2 restart strapi`.
  :::

4. Allow the port to communicate with outside web traffic for port 8080 by running the following scripts:

    ```bash
    sudo ufw allow 8080/tcp
    sudo ufw enable
    ```

    Press `y` to accept the `Command may disrupt existing ssh connections. Proceed with operation (y|n)?` message.

  Earlier you setup `pm2` to start the services for `your-project` whenever the Droplet reboots or is started. You will now do the same for the `webhook.js` script.

5. Install the webhook as a `systemd` service. First run `echo $PATH` and copy the output for use in the next step.

  ```bash
  echo $PATH

  # Shell output
  /home/your-name/.npm-global/bin:/home/your-name/bin:/home/your-name/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
  ```

6. Create a `webhook.service` file:

  ```bash
  sudo nano /etc/systemd/system/webhook.service
  ```

7. Paste the configuration details below into the open `nano` editor. Make sure to replace `your-name` in both places with your username. Following that, paste the path that was outputted to the shell above in place of `your-path`, then save and exit:

  ```bash
  [Unit]
  Description=Github webhook
  After=network.target

  [Service]
  Environment=PATH=your-path
  Type=simple
  User=your-name
  ExecStart=/usr/bin/node /home/your-name/NodeWebhooks/webhook.js
  Restart=on-failure

  [Install]
  WantedBy=multi-user.target
  ```

8. Enable and start the new service so it starts when the system boots:

  ```bash
  sudo systemctl enable webhook.service
  sudo systemctl start webhook
  ```

9. Check the status of the webhook:

  ```bash
  sudo systemctl status webhook
  ```

10. (_optional_) Test your webhook as shown [in the DigitalOcean documentation](https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync#step-4-testing-the-webhook) except using the `node webhook.js` command since `nodejs` is depreciated. Sometimes GitHub will show a successful recent delivery even if there is an authentication failure. The most reliable way is to push code changes to the GitHub repository and then run `sudo systemctl status webhook` again to see if the latest commit SHA has been registered.

### Further steps to take

- To install SSL, you will need to [install and run Certbot](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04) by Let's Encrypt.
- Set-up [Nginx with HTTP/2 Support](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-with-http-2-support-on-ubuntu-22-04) for Ubuntu 22.04.

🥳 Your Strapi project has been installed on a DigitalOcean Droplet using Ubuntu 22.04.
