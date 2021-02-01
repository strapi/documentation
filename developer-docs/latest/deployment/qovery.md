# Qovery

This is a step-by-step guide for deploying a Strapi project on [Qovery](https://www.qovery.com). Qovery provides access to managed PostgreSQL and free SSL. Bring your Strapi project and Qovery takes care of the rest.

::: tip
Qovery provides free hosting for individual developers.
:::
 
## Option 1: Deploy with the web interface
### 1. Create a Qovery Account
Visit [the Qovery dashboard](https://start.qovery.com) to create an account if you don't already have one.

### 2. Create a project
* Click on the "create a project" button and give a name to your project.
* Click on "next".

*Note: one project can have multiple apps running. This is convenient to group your backend, frontend, database etc..*

### 3. Add your Strapi app
* Click on the "create an application" button and select your Github or Gitlab repository where your Strapi app is located.
* Click on "next".

### 4. Add a PostgreSQL database
* Click on add a "PostgreSQL" database.
* Select the version
* Give a name to your PostgreSQL databse.
* Click on "next".

### 5. Add a storage
* Click on add a "Storage".
* Give a name to your storage.
* Select the storage type between Slow HDD, HDD, SSD, and Fast SSD. (SSD is recommended)
* Select the size.
* Give a mount point.

### 6. Deploy
Finally, you're ready to click on the "Deploy" button. That's it 🎉! Your app is deployed and you can see the status in real-time by clicking on "Deployment logs".

## Option 2: Deploy with the CLI
### 1. Create a Qovery Account
[Install the Qovery CLI](https://docs.qovery.com/docs/using-qovery/interface/cli/) and type the command `qovery auth` to create an account if you don't already have one.

### 2. Add a .qovery.yml File
Put at the root of your project this `.qovery.yml` file (don't forget the dot).

```yaml
application:
  name: GIVE_A_NAME_TO_YOUR_APP
  project: GIVE_A_PROJECT_NAME
  publicly_accessible: true
  storage: # qovery will attach automatically a SSD storage on /srv/app
    - name: data
      type: ssd
      size: 5GB
      mount_point: /srv/app
databases:
- type: postgresql # qovery will create a managed PostgreSQL database
  version: 12
  name: psql
routers:
- name: main
  custom_domains: # optional: only if you want to use your domain
  - branch: master
    domain: my.domain.tld 
  routes:
  - application_name: strapi
    paths:
    - /*
```

*To go into the details of the `.qovery.yml` file, I'd recommend to read [the Qovery application documentation](https://docs.qovery.com/docs/using-qovery/configuration/applications).*

Alternatively, you can deploy your Strapi app with a PostgreSQL database in the Qovery dashboard.

### 3. Add a Dockerfile (optional)

By default, Qovery uses Buildpacks to build and run your Strapi app. But, it is also possible to build and run your app by providing a `Dockerfile`. Go [here](https://docs.qovery.com/docs/using-qovery/configuration/applications/#application-build) for more details.

### 4. Deploy

1. Commit your changes and push them to GitHub or GitLab.
2. execute the command `qovery status --watch` to see in real time your Strapi app deployment status.
3. When the status of your app is `RUNNING` it means it has been successfully deployed 🎉.

## Scale

For vertical scaling, qovery lets you upgrade your CPU and RAM per instance. For horizontal scaling, Qovery auto-scale the number of instance running depending of the CPU and Memory usage.
