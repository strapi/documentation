# DigitalOcean Virtual Machine Configuration

This DigitalOcean configuration documentation is related to the [DigitalOcean One-click installation guide](/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click.md). It should guide you through the handling of the DigitalOcean virtual machine running the Strapi application.

You can click below for more information about the installed software and the Nginx server configuration.

::: details Installed software
The Strapi application running on the droplet has the following softwares installed and configured:

|  Software      |    Version            |   Comments     |
|----------------|-----------------------|----------------|
| Node.js        | 12                    | Installed via the offical [apt repository](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)) |
| Yarn           | latest stable version | Installed via the official [apt repository](https://classic.yarnpkg.com/en/docs/install/#debian-stable))                                 |
| Nginx          | latest version        | Installed via Ubuntu default repository                                                                                                  |
| UFW (Uncomplicated Firewall)           | latest stable version | Configured to only allow incoming ports 80 (HTTP), 443 (HTTPS), and 22 (SSH)                                    |
| PostgreSQL     | latest version        | Installed via Ubuntu default repository                                                                                                  |
| PM2            | latest version        | Installed globally using Yarn                                                                                                            |
:::

::::: details Nginx default configuration
The DigitalOcean one-click application uses Nginx to proxy http on port 80 to Strapi. This is to ensure the system is secure as running any application on ports below 1024 require root permissions.

Here are the config files included by default:

:::: tabs card

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

:::: tip TIP
To learn more about the Nginx proxy options you can view the Nginx proxy [documentation](http://nginx.org/en/docs/http/ngx_http_proxy_module.html).
::::
:::::

## Strapi service account

For security purposes, the DigitalOcean virtual machine hosting the Strapi application uses a service user. This user is extremely limited into what it can do and access.

The service user home directory is located at `/srv/strapi`. The actual Strapi application is located within this home directory at `/srv/strapi/strapi-development`.

The Strapi application runs in the `development` environment to allow for creating content types. It is not recommended to use it directly in production. For staging and production environments, it's recommended to configure a private git repository to commit changes into, and create a new application directory within the service user's home (e.g. `/srv/strapi/strapi-production`).

To run the new `production` or `staging` environments you can refer to the [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/#managing-processes)


### Accessing the service account

To access your service account:

1. SSH into the `root` user. Depending on your Operating System or your SSH client, there may be multiple ways to do this. You should refer to your SSH client documentation for clarification on using SSH keys.
2. Run the `sudo su strapi` command. This will take you to the `strapi` user's shell. 

To go back to the `root` user, run `exit`.

::: warning
Please note that by default the strapi user cannot run `sudo` commands. This is intended.
:::

### Controlling the Strapi service and viewing logs

While identified as the service user on the DigitalOcean virtual machine, [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/#managing-processes) can be used to control the Strapi process and view logs with the following commands:

* `pm2 list`: Show a list of all running processes. The default service is called "strapi-development" and should be running with an ID of 0.
* `pm2 restart strapi-development`: Restart the Strapi process manually.
* `pm2 stop strapi-development`: Stop the Strapi process.
* `pm2 start strapi-development`:  Start the Strapi process. Strapi will automatically start if the virtual machine is rebooted.
* `pm2 logs strapi-development`: Show the logs in real time; to exit, use Ctrl+C. 

:::tip TIP
You can also manually view the log files under `/srv/strapi/.pm2/logs` if you encounter any errors during the bootup.
:::


## Strapi application access with ssh

To ssh into your Strapi application, run the following command:

```bash
ssh root@<public-ipv4-address>
```

where `<public-ipv4-address>` should be replaced with the address found by clicking on the droplet name in the [droplets list on DigitalOcean](https://cloud.digitalocean.com/droplets).

There is no password for SSH as DigitalOcean uses SSH keys by default with password authentication disabled.

## PostgreSQL Password

To change the PostgreSQL password and update Strapi's config:

1. Log into the [`strapi`](#accessing-the-service-account) service user.
2. Run the `pm2 stop strapi-development` command to stop the current strapi process.
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

5. Restart Strapi and confirm the password change was successful by running these commands:

```bash
pm2 start strapi-development
pm2 logs strapi-development
```
