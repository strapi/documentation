---
title: DigitalOcean One-click - Strapi Developer Documentation
description: Quickly deploy a Strapi application on DigitalOcean by simply using their One-click button.
---

# DigitalOcean One-click

The following documentation will guide you through the one-click creation of a Strapi project deployed on  [DigitalOcean](https://www.digitalocean.com/).

DigitalOcean is a cloud platform that helps to deploy and scale applications by offering an Infrastructure as a Service (IaaS) platform for developers.
<!-- TODO check wording with Chris Sev? -->

<!-- TODO: Temporarily commented 👇 Check if we did the same for other 1-clicks, ask Mégane's opinion — remove it for consistency? -->
<!-- You can find the image generation [source code](https://github.com/strapi/one-click-deploy/tree/master/digital-ocean) on Strapi's GitHub for more information. -->

:::warning PREREQUISITES
A DigitalOcean account is necessary to follow this installation guide. If you do not already have one, you can use [this referral link](https://try.digitalocean.com/strapi/) to get \$100 of free credits!
:::
## Creating a Strapi project

1. Go to the [Strapi page on DigitalOcean's marketplace](https://marketplace.digitalocean.com/apps/strapi).
2. Click on **Create Strapi Droplet** button.
3. Keep the selected "Shared CPU - Basic" plan.
4. Choose "Regular Intel with SSD" as a CPU option.
5. Select your virtual machine size (minimum of 2 GB/1 CPU).
6. Choose a datacenter region (closest to you or your target area).
7. Add a new SSH key. If you are on Windows you can follow [this guide](https://www.digitalocean.com/docs/droplets/how-to/add-ssh-keys/create-with-putty/).
<!-- TODO: check with Derrick and JS if instructions are displayed like they were for me. If yes, we can remove the sentence. -->
8. Give your virtual machine a hostname.
9. Click **Create Droplet**. It may take from 30 seconds to a few minutes for the droplet to start, and a few minutes more to finish the Strapi installation.

## Running Strapi

To visit your Strapi application:

1. Go to the [droplets list on DigitalOcean](https://cloud.digitalocean.com/droplets), logged in.
2. Click on the droplet name that is used for your Strapi application.
3. Copy the public ipv4 address of the droplet.
4. Use this address to access the Strapi application.

<!-- TODO: Check this 👇 - We didn't mention this in other guides. Is it specific to DigitalOcean, or should we simply remove it? -->
Visiting the Strapi application page for the first time will require to create the first administrator user.

## Configuring the Strapi application

### Accessing the Strapi application with ssh

To ssh into your Strapi application, run the following command:

```bash
ssh root@<public-ipv4-address>
```

where `<public-ipv4-address>` should be replaced with the address found by clicking on the droplet name in the [droplets list on DigitalOcean](https://cloud.digitalocean.com/droplets).

There is no password for SSH as DigitalOcean uses SSH keys by default with password authentication disabled.
<!-- TODO: Re-test and/or ask Derrick — Tested with a newly created public SSH key added to DO during droplet creation, and I've been denied access. -->

### Default server configuration

The Strapi application running on the droplet has the following softwares installed and configured:

|  Software      |    Version            |   Comments     |
|----------------|-----------------------|----------------|
| Node.js        | 12                    | Installed via the offical [apt repository](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)) |
| Yarn           | latest stable version | Installed via the official [apt repository](https://classic.yarnpkg.com/en/docs/install/#debian-stable))                                 |
| Nginx          | latest version        | Installed via Ubuntu default repository                                                                                                  |
| UFW (Uncomplicated Firewall)           | latest stable version | Configured to only allow incoming ports 80 (HTTP), 443 (HTTPS), and 22 (SSH)                                    |
| PostgreSQL     | latest version        | Installed via Ubuntu default repository                                                                                                  |
| PM2            | latest version        | Installed globally using Yarn                                                                                                            |

### File and Software paths

#### Nginx

The DigitalOcean one-click application uses Nginx to proxy http on port 80 to Strapi. This is to ensure the system is secure as running any application on ports below 1024 require root permissions.

Here are the config files included by default:

:::: tabs

::: tab strapi.conf
Path: `/etc/nginx/sites-available/strapi.conf`

```
server {

# Listen HTTP
    listen 80;
    server_name _;

# Proxy Config
    location / {
        proxy_pass http://strapi;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass_request_headers on;
    }
}
```

:::

::: tab upstream.conf
Path: `/etc/nginx/conf.d/upstream.conf`

```
upstream strapi {
    server 127.0.0.1:1337;
}
```

:::

::::

:::tip TIP
To learn more about the Nginx proxy options you can view the Nginx proxy [documentation](http://nginx.org/en/docs/http/ngx_http_proxy_module.html).
:::

#### Strapi

In the DigitalOcean one-click application, a service user is used in which its home directory is located at `/srv/strapi`. Likewise the actual Strapi application is located within this home directory at `/srv/strapi/strapi-development`.

Please note that with this application it is initially created and ran in the `development` environment to allow for creating models. **You should not use this directly in production**, it is recommended that you configure a private git repository to commit changes into and create a new application directory within the service user's home (Example: `/srv/strapi/strapi-production`). To run the new `production` or `staging` environments you can refer to the [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/#managing-processes).

### Using the service account

By default the Strapi application runs under a service account. A service account is extremely limited into what it can do and access. The purpose of using a service account is to help protect your system from security threats.

#### Accessing the service account

The first step in accessing your service account is to SSH into the root user. Depending on your Operating System or your SSH client, there may be multiple ways to do this. You should refer to your SSH clients documentation for clarification on using SSH keys.

After you have successfully logged into the root user you can now run `sudo su strapi` and this will take you to the `strapi` user's shell. To go back to the root user simply run `exit`.

::: warning
Please note that by default the `strapi` user **cannot run sudo commands**. This is intended.
:::

#### Controlling the Strapi service and viewing logs

Once you are in the Strapi service account, you can use [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/#managing-processes) to manage the Strapi process and view the logs.

The default service is called `strapi-development` and should be running with an ID of `0`. Below are some example commands for PM2:

```bash
pm2 list # Will show you a list of all running processes
pm2 restart strapi-development # Restart the Strapi process manually
pm2 stop strapi-development # Stop the Strapi process
pm2 start strapi-development # Start the Strapi process
pm2 logs strapi-development # Show the logs in real time (to exit use ctrl +c)
```

Strapi will automatically start if the virtual machine is rebooted. You can also manually view the log files under `/srv/strapi/.pm2/logs` if you encounter any errors during the bootup.

### Changing the PostgreSQL Password

To change the PostgreSQL password and update Strapi's config:

1. Log into the `strapi` service user
<!-- TODO: ask Derrick or Jim how to do this ⬆️ -->
2. Run this command to stop the current strapi process:
```bash
pm2 stop strapi-development
```
3. Run this command to change the password for the `strapi` database user:
```bash
psql -c "ALTER USER strapi with password '<your-new-password>';"
```
where `<your-new-password>` should be replaced by the password you want to use.
<!-- TODO: check with Derrick or Jim if we need quotes -->
<!-- ? should the command be `ALTER USER strapi with password 'Az123456'` or `ALTER USER strapi with password Az123456` -->

4. Update the `/srv/strapi/strapi-development/.env` file with the new password:

```
DATABASE_PASSWORD=<your-new-password>
```

5. Restart Strapi and confirm the password change was successful, by running these commands:

```bash
pm2 start strapi-development
pm2 logs strapi-development
```
