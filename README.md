# Introduction

This is the backend part of a session-based user name and password authentication whose frontend is released in [this github repository](https://github.com/aabbtree77/auth-starter-frontend).

The stack is Bun, SQLite via Drizzle, Hono, TypeScript. 

Notice that there is no `.env` inside `.gitignore`. 

Open three terminal windows:

Terminal 1:

```sh
bun install
bun run dev
```

Terminal 2:

```sh
bun run db:generate
bun run db:push
bun run db:studio
```

Terminal 3:

cd into the cloned fontend part and run TypeScript as documented in its own README.md.

# Debugging

Delete the tables with the browser GUI in Drizzle Studio. Use `bun run db:generate` if you adjust the tables/schema. `bun run db:push` creates and updates the actual database file in `/storage`. If some weird problems appear, delete the `*.db` file inside that folder. This is how I handle "migrations" ;). 

I use `bun:sqlite` instead of `better-sqlite3`, but the latter is still needed by drizzle-kit, so better-sqlite3 is in `package.json`, but not in the code. See [this issue](https://github.com/drizzle-team/drizzle-orm/issues/1520).

If you plan on changing the database, pay attention to how they handle the time zones and TypeScript's Date.Now(). `src/utils/sessionhelper.ts` appends `Z` to enforce the UTC when extracting the session expiry from the session table. Without such care, storing and reading may not result in the same value, and with the use of Date.Now() one can easily get some weird bugs where everything works only for longer session expiration times. 

In my case, I am 3 hours behind UTC, and could not see any problems when setting a session expiry to 5 hours at first. It turned out that the program had a bug as it would subtract 3 hours from `session.expiresAt` due to UTC not enforced, killing a session instantly for the TTL values smaller or equal to 3 hours. ChatGPT 4e had no clue about it, suggested monitoring everything.

# Notes

- SQLite is just a file, not the whole server that needs a Docker container. Notice that SQLite has no date and uuid types, but I am not pedantic and advanced enough to worry about such matters.

- I am still hesitating whether this is the way to build CRUD apps. It is tedious, fragile, low level. Express with the MongoDB Atlas service and Compass desktop app is probably easier, but they are all quite a hassle. On the other hand, everything is under control and almost no onboarding compared to CMSes like PocketBase or Payload.

- The stack is good as it is replaceable and developer-friendly. It is just TypeScript and the web.
