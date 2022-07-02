This is a step-by-step guide for deploying a Strapi project to an [*Atlantic.Net*](https://www.atlantic.net/) Cloud server. Prior to starting this guide, you should have created a [*Strapi project*](https://docs.strapi.io/developer-docs/latest/getting-started/quick-start.html) and have already read through the configuration section.

## Atlantic.Net Installation Requirements
-   If you don't have an Atlantic.Net account, you will need to create one using this [*link*](https://cloud.atlantic.net/?page=signup).

## Create a Cloud Server on Atlantic.Net

First, you will need to create a new virtual private server on the Atlantic.Net platform to host your Strapi project. Follow the steps given below to create a VPS server.

**Step 1 -** Log in to your [*Atlantic.Net*](https://cloud.atlantic.net/?page=userlogin) account.

**Step 2 -** Click the "**Add Server**" button.

**Step 3 -** On the initial "**Add a Server**" page, you will see a few options:

-   Enter what you would like your server’s name to be in the "**Server Name**" box.

-   Select **Ubuntu 20.04** as an Operating system.

-   Under “**Location**,” Click on the data center where you would like your Cloud Server to be located.

-   Select what plan size you want under "**Plan.**"

**Note**: The plans do change depending on the OS you have chosen. All available plans will be provided, as well as the specifications and their pricing.

-   Choose whether to enable backups for your new Cloud Server. Check  the box next to "**Enable Backups**" if you would like to take daily  snapshots of your server.

**Step 4 -** After selecting all options, click on the "**Create Server**" to create a new cloud server.

**Step 5 -** It will take a few moments for your server to build. The credentials will be displayed at the top of the page in green and will also be emailed to you. After this, the server will be listed as ‘**PROVISIONED**,’ and you will be able to access it via [*SSH*](https://www.atlantic.net/cloud-hosting/how-to-ssh-linux-server-windows) using the credentials highlighted at the top of the page.

**Note**: Atlantic.Net does not keep your credentials on file, so please be sure to keep this information recorded for your convenience.

## Install Node.js on Cloud Server

These next steps will help you to log in to the Atlantic.Net cloud server and install Node.js on it.

First, open your terminal interface and run the following command to connect to your Atlantic.Net cloud server via SSH:

    ssh root@cloud-server-ip

Provide your root password and hit the **Enter** key to connect to the server.

Once you are connected to the server, update all the system packages using the following command:

    apt-get update -y

Next, run the following command to install Node.js:

    curl -sL https://deb.nodesource.com/setup\_16.x | bash -
    apt-get install -y nodejs

Once Node.js is installed, verify the Node.js version using the following command:

    node --version
    v16.19.1

You can also verify the NPM version using the following command:

    npm --version
    6.14.16

## Install PostgreSQL Database

Strapi supports several databases including SQLite, MySQL, MariaDB, and PostgreSQL. In this post, we will use PostgreSQL as a database backend.

You can install PostgreSQL using the following command:

    apt-get install postgresql -y

Once PostgreSQL is installed, connect to PostgreSQL using the following command:

    sudo -u postgres psql

Once you are connected, set the PostgreSQL password using the following command:

    postgres=\# ALTER USER postgres PASSWORD 'password';

Next, create a database using the following command:

    postgres=\# create database project;

Next, exit from the PostgreSQL with the following command:

    postgres=\# \\q

## Create a Strapi Project

You can now create your first Strapi project using the **npx** command as shown below:

    npx create-strapi-app@latest project --no-run

Answer all the questions as shown below:

    npx: installed 103 in 6.896s
    ? Choose your installation type Custom (manual settings)
    ? Choose your default database client postgresql
    ? Database name: project
    ? Host: 127.0.0.1
    ? Port: 5432
    ? Username: postgres
    ? Password: password
    ? Enable SSL connection: No

    Creating a project with custom database options. Creating a new Strapi application at /root/project.

    Your application was created at /root/project.

    Available commands in your project:

    npm run develop
    Start Strapi in watch mode. (Changes in Strapi project files wil trigger a server restart)

    npm run start
    Start Strapi without watch mode.

    npm run build
    Build Strapi admin panel.

    npm run strapi
    Display all available commands.

    You can start by doing:

    cd /root/project
    npm run develop

Next, navigate to the **project** directory and build the admin panel using the following command:

    cd project
    npm run build

Next, edit the **server.js** file and define your domain URL:

    nano ./config/server.js

Define your domain URL as shown below:

    module.exports = ({ env }) =&gt; ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    **url: 'http://strapi.example.com',**
    app: {
    keys: env.array('APP\_KEYS'),
    },
    });

Save and close the file, then run your project using the following command:

    npm run develop

You will get the following output:

    > project@0.1.0 develop /root/project
    > strapi develop

    [2022-03-22 09:47:10.321\] info: The Users & Permissions plugin automatically generated a jwt secret and stored it in your .env file
    under the name JWT\_SECRET.

    Project information

    ┌────────────────────┬──────────────────────────────────────────────────┐
    │ Time │ Tue Mar 22 2022 09:47:10 GMT+0000 (Coordinated … │
    │ Launched in │ 2288 ms │
    │ Environment │ development │
    │ Process PID │ 20994 │
    │ Version │ 4.1.5 (node v14.19.1) │
    │ Edition │ Community │
    └────────────────────┴──────────────────────────────────────────────────┘

    Actions available

    One more thing... Create your first administrator 💻 by going to the administration panel at:

    ┌─────────────────────────────────┐
    │ http://strapi.example.com/admin │
    └─────────────────────────────────┘

Press **CTRL + C** to stop the Strapi server. We will create a systemd service file to start Strapi in the next step.

## Create a Systemd Service File to Manage Strapi App

It is recommended to create a systemd unit file to manage the Strapi service. You can create it with the following command:

    nano /etc/systemd/system/strapi.service

Add the following lines:

    [Unit]
    Description=Strapi Project
    After=network.target

    [Service]
    Type=simple
    WorkingDirectory=/root/project
    User=root
    ExecStart=/usr/bin/node /root/project/node_modules/.bin/strapi develop

    [Install]
    WantedBy=multi-user.target

Save and close the file, then reload the systemd daemon to apply the changes:

    systemctl daemon-reload

Now, start and enable the Strapi service with the following command:

    systemctl start strapi
    systemctl enable strapi

You can also check the status of Strapi using the following command:

    systemctl status strapi

You will get the following output:

    ● strapi.service - Strapi Project
    Loaded: loaded (/etc/systemd/system/strapi.service; disabled; vendor preset: enabled)
    Active: active (running) since Tue 2022-03-22 11:00:48 UTC; 6s ago
    Main PID: 5220 (node)
    Tasks: 18 (limit: 2348)
    Memory: 157.1M
    CGroup: /system.slice/strapi.service
    ├─5220 /usr/bin/node /root/project/node_modules/.bin/strapi develop
    └─5238 /usr/bin/node /root/project/node_modules/.bin/strapi develop

    Mar 22 11:00:54 ubuntu2004 node[5238]: │ Process PID │ 5238 │
    Mar 22 11:00:54 ubuntu2004 node[5238]: │ Version │ 4.1.5 (node
    v14.19.1) │ Mar 22 11:00:54 ubuntu2004 node[5238]: │ Edition │ Community │
    Mar 22 11:00:54 ubuntu2004 node[5238]:
    └────────────────────┴──────────────────────────────────────────────────┘
    Mar 22 11:00:54 ubuntu2004 node[5238]: Actions available
    Mar 22 11:00:54 ubuntu2004 node[5238]: One more thing...
    Mar 22 11:00:54 ubuntu2004 node[5238]: Create your first administrator
    💻 by going to the administration panel at:
    Mar 22 11:00:54 ubuntu2004 node[5238]:
    ┌─────────────────────────────────┐
    Mar 22 11:00:54 ubuntu2004 node[5238]: |
    http://strapi.example.com/admin │
    Mar 22 11:00:54 ubuntu2004 node[5238]:
    └─────────────────────────────────┘

## Configure Nginx as a Reverse Proxy for Strapi Project

In order to take full advantage of a proxied Strapi project, you will need to install and configure Nginx for the Strapi app.

First, install Nginx using the following command:

    apt-get install nginx -y

Next, create an Nginx virtual host configuration file:

    nano /etc/nginx/conf.d/strapi.conf

Add the following configuration:

    # Strapi server
    upstream strapi {
    server 127.0.0.1:1337;
    }

        server {

        listen 80;
        server_name strapi.example.com;

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

Save and close the file, then edit the Nginx main configuration file:

    nano /etc/nginx/nginx.conf

Add the following line below the line http {:

    server_names_hash_bucket_size 64;

Save and close the file, then verify the Nginx configuration file using the following command:

    nginx -t

Next, restart Nginx using the following command:

    systemctl restart nginx

## Access Strapi Project


Now, open your web browser and access the Strapi admin panel using the URL **http://strapi.example.com/admin**. You should see the admin user
registration screen:

![](https://i.ibb.co/V2wPK57/image1.png)

Provide your name, email, password, and click on the **Let's start** button. You should see the Strapi app dashboard in the following screen:

![](https://i.ibb.co/9WptBDv/image2.png)


Congratulations! Your Strapi project has been installed on an Atlantic.Net Cloud Server using Ubuntu 20.04.
