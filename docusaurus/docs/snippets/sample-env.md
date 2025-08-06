The Strapi CLI generates an `.env` and an `.env.example` file when creating a new project. The files contain automatically-generated security keys and database settings similar to the following:

<Tabs>
<TabItem value="env-example" label=".env.example">

```env title=".env.example"
HOST=0.0.0.0
PORT=1337
APP_KEYS="toBeModified1,toBeModified2"
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
ENCRYPTION_KEY=tobemodified
```

</TabItem>
<TabItem value="env" label=".env">

The variables might differ depending on options selected on project creation.

```env title=".env"
# Server
HOST=0.0.0.0
PORT=1337

# Secrets
APP_KEYS=appkeyvalue1,appkeyvalue2,appkeyvalue3,appkeyvalue4
API_TOKEN_SALT=anapitokensalt
ADMIN_JWT_SECRET=youradminjwtsecret
TRANSFER_TOKEN_SALT=transfertokensaltvalue
ENCRYPTION_KEY=yourencryptionkey

# Database
DATABASE_CLIENT=sqlite
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_SSL=false
DATABASE_FILENAME=.tmp/data.db
```

</TabItem>
</Tabs>
