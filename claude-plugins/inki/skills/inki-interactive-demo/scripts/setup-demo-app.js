#!/usr/bin/env node
/**
 * Creates the throwaway Strapi app that interactive demos are captured from.
 *
 * Usage:
 *   node claude-plugins/inki/skills/inki-interactive-demo/scripts/setup-demo-app.js <target-dir> [--port 1337] [--version latest]
 *
 * The app is the official example (Article, Author, Category, About, Global), with:
 *   - Article and its fields localized, so the locale picker shows up;
 *   - the admin login rate limit off, since every capture logs in;
 *   - the example data seeded.
 * Start it with `npm run develop` in the target directory. The first capture
 * creates the admin user from DEMO_STRAPI_EMAIL / DEMO_STRAPI_PASSWORD.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : fallback;
}

function run(command, args, cwd) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd, stdio: 'inherit', env: { ...process.env, STRAPI_TELEMETRY_DISABLED: 'true' } });
}

function patchJson(file, patch) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  patch(data);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

const LOCALIZED_ARTICLE_FIELDS = ['title', 'description', 'slug', 'cover', 'blocks', 'author', 'category'];

function main() {
  const target = process.argv[2] && !process.argv[2].startsWith('--') ? path.resolve(process.argv[2]) : null;
  if (!target) throw new Error('Usage: node claude-plugins/inki/skills/inki-interactive-demo/scripts/setup-demo-app.js <target-dir> [--port 1337] [--version latest]');
  if (fs.existsSync(target)) throw new Error(`${target} already exists. Remove it or pick another directory.`);
  const port = arg('port', '1337');
  const version = arg('version', 'latest');

  run('npx', [
    '-y', `create-strapi-app@${version}`, path.basename(target),
    '--example', '--js', '--use-npm', '--install', '--skip-cloud', '--no-git-init', '--no-run',
    '--dbclient', 'sqlite', '--non-interactive',
  ], path.dirname(target));

  // Without --dbfile, the generator writes an empty DATABASE_FILENAME that overrides the
  // .tmp/data.db default, and SQLite then fails to open a directory.
  const envFile = path.join(target, '.env');
  const env = fs.readFileSync(envFile, 'utf8')
    .replace(/^DATABASE_FILENAME=.*$/m, 'DATABASE_FILENAME=.tmp/data.db')
    .replace(/^PORT=.*$/m, `PORT=${port}`);
  fs.writeFileSync(envFile, env);
  fs.mkdirSync(path.join(target, '.tmp'), { recursive: true });

  patchJson(path.join(target, 'src/api/article/content-types/article/schema.json'), (schema) => {
    schema.pluginOptions = { i18n: { localized: true } };
    for (const field of LOCALIZED_ARTICLE_FIELDS) {
      schema.attributes[field].pluginOptions = { i18n: { localized: true } };
    }
  });

  const adminConfig = path.join(target, 'config/admin.js');
  const admin = fs.readFileSync(adminConfig, 'utf8');
  if (!admin.includes('rateLimit')) {
    fs.writeFileSync(adminConfig, admin.replace(/\n\}\);\s*$/, '\n  rateLimit: {\n    enabled: false,\n  },\n});\n'));
  }

  // The admin panel tour switches the interface language, which needs extra admin locales.
  fs.writeFileSync(
    path.join(target, 'src/admin/app.js'),
    "export default {\n  config: { locales: ['fr', 'de'] },\n  bootstrap() {},\n};\n",
  );

  // The documentation tour needs the Documentation plugin, at the same version as Strapi.
  const strapiVersion = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8')).dependencies['@strapi/strapi'];
  run('npm', ['install', `@strapi/plugin-documentation@${strapiVersion}`], target);

  run('npm', ['run', 'seed:example'], target);

  console.log(`\nDemo app ready. Start it with:\n  cd ${target} && npm run develop\nThen open http://localhost:${port}/admin once it is up.`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
