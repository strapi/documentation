---
title: Running Strapi with PM2
sidebar_label: PM2
displayed_sidebar: cmsSidebar
description: Use the PM2 process manager to keep a Strapi application running, restart it on failure, and start it again after a reboot.
tags:
- deployment
- deployment guide
- guides
- PM2
- process manager
- server configuration
---

# Running Strapi with PM2

<Tldr>
Build the admin panel, describe your application in an `ecosystem.config.js` file with `NODE_ENV` set to `production`, then start it with `pm2 start`. Run `pm2 startup` and `pm2 save` so the application comes back after a reboot.
</Tldr>

Started with `npm run start`, Strapi runs in the foreground and stops when you close the terminal or when the process crashes. A process manager keeps it running instead: it restarts the application on failure, brings it back after a reboot, and collects its logs. PM2 is a common choice for Node.js applications. This guide covers installing PM2, describing a Strapi application to it, and the operational tasks that follow.

:::prerequisites
- A Strapi 5 application deployed to your server, with dependencies installed (see [deployment guidelines](/cms/deployment#general-guidelines)).
- <ExternalLink to="https://nodejs.org/" text="Node.js"/> and a package manager available on the server.
- Shell access, with `sudo` privileges for the reboot step.
:::

## Install PM2

Install PM2 globally so the `pm2` command is available to your shell and to the startup script:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn global add pm2
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm install -g pm2
```

</TabItem>
</Tabs>

Confirm the installation:

```bash
pm2 --version
```

## Build the admin panel

The admin panel is a static bundle that must be built before the server starts in production. Build it with `NODE_ENV` set to `production`, so the build uses your production configuration:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
NODE_ENV=production yarn build
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
NODE_ENV=production npm run build
```

</TabItem>
</Tabs>

:::caution
Set `NODE_ENV=production` on the build command itself rather than for the whole shell session. Exporting it before installing dependencies makes the package manager skip `devDependencies`, which the build needs.
:::

## Create an ecosystem file

PM2 can start an application from the command line, but a configuration file keeps the settings under version control and makes each deployment repeatable. Create the file at the root of your Strapi project:

```js title="/ecosystem.config.js"
module.exports = {
  apps: [
    {
      name: 'strapi',
      cwd: '/srv/strapi',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 1337,
      },
    },
  ],
};
```

The options serve the following purposes:

| Option | Purpose |
|--------|---------|
| `name` | The name you pass to other PM2 commands, such as `pm2 restart strapi`. |
| `cwd` | Absolute path to the project. PM2 resolves `script` relative to it, so the application starts correctly regardless of the directory you run `pm2` from. |
| `script` and `args` | The command PM2 runs. Using the package manager rather than a path to a file keeps the behavior identical to starting Strapi by hand. |
| `env` | Environment variables for the process. `NODE_ENV` must be `production` so Strapi loads the production configuration. |

:::danger
Do not put secrets such as `APP_KEYS`, `ADMIN_JWT_SECRET`, or database credentials in the ecosystem file if it is committed to version control. Keep them in the server's `.env` file, which Strapi reads on startup, or inject them from your deployment tooling (see [environment configuration](/cms/configurations/environment)).
:::

## Start Strapi with PM2

Start the application from the ecosystem file:

```bash
pm2 start ecosystem.config.js
```

Check that it came up:

```bash
pm2 list
```

The Strapi entry should show a status of `online`. A status of `errored`, or a restart count that keeps climbing, means the process is failing and exiting. Read the logs to find out why:

```bash
pm2 logs strapi --lines 100
```

## Keep Strapi running after a reboot

PM2 does not survive a reboot on its own. It needs an init script, and a saved snapshot of which applications to start.

1. Generate the init script. The command prints a second command, pre-filled for your init system and user:

   ```bash
   pm2 startup
   ```

2. Run the command it printed, exactly as printed. It is the one that needs `sudo`.

3. Save the current process list, so PM2 knows what to restore:

   ```bash
   pm2 save
   ```

Run `pm2 save` again whenever you add, remove, or rename an application. Without it, PM2 restores the list as it was at the last save.

## Manage logs

PM2 writes each application's output to files in `~/.pm2/logs/`. These files grow without limit, so install the log rotation module:

```bash
pm2 install pm2-logrotate
```

Set a size limit and how many rotated files to keep:

```bash
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Update a running deployment

The admin panel bundle must be rebuilt whenever your code or admin configuration changes, and the rebuild has to happen before the process restarts. Deploy in this order:

1. Fetch the new code on the server.
2. Install dependencies.
3. Build the admin panel with `NODE_ENV=production`.
4. Restart the application:

   ```bash
   pm2 restart strapi --update-env
   ```

The `--update-env` flag makes PM2 re-read the environment rather than reusing the values from when the process first started. Without it, changes to your `.env` file or ecosystem file are ignored.

:::note
PM2 only performs a zero-downtime `pm2 reload` in cluster mode, where it starts replacement workers before retiring the old ones. In the single-process fork mode used above, the process stops and starts again, so there is a short window where requests fail. Put a reverse proxy in front of Strapi if you need to control what visitors see during that window, as covered in the [Nginx](/cms/deployment/guides/nginx), [Caddy](/cms/deployment/guides/caddy), [HAProxy](/cms/deployment/guides/haproxy), and [Traefik](/cms/deployment/guides/traefik) guides.
:::

## Run more than one instance

PM2 can run several copies of an application with its cluster mode, sharing one port. Cluster mode builds on the Node.js `cluster` module, which needs a JavaScript entry point. The `script: 'npm'` value used earlier in this guide runs a binary, and PM2 can only manage a binary in fork mode.

Add an entry point at the root of your project that starts Strapi directly:

```js title="/server.js"
const strapi = require('@strapi/strapi');

strapi.createStrapi(/* {...} */).start();
```

:::note
For a TypeScript project, pass the `distDir` option to `createStrapi` so the server starts from the compiled output (see [using the createStrapi factory](/cms/typescript/development#use-the-createstrapi-factory)).
:::

Point the ecosystem file at that file and select cluster mode:

```js title="/ecosystem.config.js"
module.exports = {
  apps: [
    {
      name: 'strapi',
      cwd: '/srv/strapi',
      // highlight-start
      script: './server.js',
      exec_mode: 'cluster',
      instances: 'max',
      // highlight-end
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 1337,
      },
    },
  ],
};
```

Strapi runs in this mode, but it has no coordination between instances, so several behaviors change. Read this section before enabling it.

:::danger
Strapi runs its schema synchronization on startup, once per process, with no lock shared between instances. A restart that leaves the content-types unchanged is safe, because the synchronization detects an unchanged schema and does nothing. 2 other cases are not safe: a release that changes content-types, and a release with pending migrations. Instances starting together then issue concurrent schema changes and migrations against the same database.

For those releases, run a single instance first, let it finish starting, and scale up afterwards. This is a property of running several processes against one database, so moving the instances onto separate machines behind a load balancer does not avoid it.
:::

:::caution
[CRON jobs](/cms/configurations/cron) are scheduled inside each Strapi process, so a job runs once per instance rather than once overall. A task set to run nightly runs as many times as you have instances. If your project sets `cron.enabled` to `true`, either move the jobs out of Strapi or keep them on a single instance.
:::

2 more consequences are worth knowing:

- Anything Strapi holds in memory belongs to one instance only, because each instance is a separate process. Nothing in Strapi core replicates state between them.
- The default local upload provider writes files to the instance's own disk. Instances on the same machine share that disk, but instances on different machines do not, so use one of the [Media Library providers](/cms/configurations/media-library-providers) backed by object storage if you later spread instances across hosts.

Given these constraints, a single instance behind a reverse proxy is the simpler starting point. Add instances when you have measured that one is not enough, and sequence your deployments as described above.

## Validation

Confirm the application is running and reachable:

1. Run `pm2 list` and check that the Strapi entry shows `online` with a restart count that is not climbing.
2. Request the health check route, which returns HTTP `204 No Content` when the server is ready:

   ```bash
   curl -I http://localhost:1337/_health
   ```

3. Reboot the server, then run `pm2 list` again. The application should be `online` without you starting it.

## Troubleshooting

**The process shows `errored` in `pm2 list`.** Read `pm2 logs strapi --lines 100`. A missing build, an unreachable database, or absent environment variables are the usual causes.

**PM2 restarts Strapi in a loop.** The application exits immediately on startup. The logs name the reason. Until it is fixed, stop the loop with `pm2 stop strapi` rather than leaving it to retry.

**Strapi does not come back after a reboot.** Either the command printed by `pm2 startup` was never run, or `pm2 save` was not run after the application was added. Repeat both steps.

**Changes to environment variables have no effect.** PM2 reuses the environment from when the process first started. Restart with `pm2 restart strapi --update-env`.

**The admin panel shows an old version after deploying.** The admin bundle was not rebuilt. Run the build with `NODE_ENV=production`, then restart.

## Next steps

- Put a reverse proxy in front of Strapi to terminate HTTPS, as covered in the [Nginx](/cms/deployment/guides/nginx), [Caddy](/cms/deployment/guides/caddy), [HAProxy](/cms/deployment/guides/haproxy), and [Traefik](/cms/deployment/guides/traefik) guides.
- Review the full list of [server configuration options](/cms/configurations/server).
- Read the [deployment guidelines](/cms/deployment) for build and environment variable requirements.
