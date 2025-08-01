A `.env.example` file is generated when creating a new Strapi project.
It typically includes variables similar to the following:

```env title=".env.sample"
HOST=0.0.0.0
PORT=1337
APP_KEYS="toBeModified1,toBeModified2"
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
ENCRYPTION_KEY=tobemodified
```

Depending on the options you chose when creating Strapi, the `.env` file might contain more values, such as in the following:

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
