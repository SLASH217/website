# mlsa-website 🏗️

# development

1. Setup env

```sh
cp .env.example .env
```

2. Run postgres and minio(local s3) container

```sh
docker compose up -d
```

3. Run next server

```sh
pnpm dev
```

4. Seed your database

```sh
pnpm seed
```

5. Admin dashboard is located at [https://localhost:3000/admin](https://localhost:3000/admin)

6. If you want to access minio dashboard go to [https://localhost:9001](https://localhost:9001)

   - Login using
     username: `minioadmin`
     password: `minioadmin`

7. If you've made changes to `Collections` or added a new one, run

```sh
pnpm payload migrate:create
```

Commit the migration files too.
