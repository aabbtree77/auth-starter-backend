# Introduction

This is the backend part of a session-based user name and password authentication whose frontend is released in [this github repository](https://github.com/aabbtree77/auth-starter-frontend).

The stack is Bun, SQLite via Drizzle, Hono, TypeScript. 

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

cd into the cloned frontend part and run TypeScript as documented in its own README.md.

# Debugging

Delete the tables with the browser GUI in Drizzle Studio. Use `bun run db:generate` if you adjust the tables/schema. `bun run db:push` creates and updates the actual database file in `/storage`. If some weird problems appear, delete the `*.db` file inside that folder. This is how I handle "migrations" ;). 

I use `bun:sqlite` instead of `better-sqlite3`, but the latter is still needed by drizzle-kit, so better-sqlite3 is in `package.json`, but not in the code. See [this issue](https://github.com/drizzle-team/drizzle-orm/issues/1520).

If you plan on changing the database, pay attention to how they handle the time zones and TypeScript's Date.Now(). `src/utils/sessionhelper.ts` appends `Z` to enforce the UTC when extracting the session expiry from the session table. Without such care, storing and reading may not result in the same value, and with the use of Date.Now() one can easily get some weird bugs where everything works only for longer session expiration times. 

In my case, I am 3 hours behind UTC, and could not see any problems when setting a session expiry to 5 hours at first. It turned out that the program had a bug as it would subtract 3 hours from `session.expiresAt` due to UTC not enforced, killing a session instantly for the TTL values smaller or equal to 3 hours. ChatGPT 4e had no clue about it, suggested monitoring everything.

# Security

This is bare-bones minimal authentication, use it at your own risk. 

Notice that there is no `.env` inside `.gitignore`. You may need to change that.

I could not set any cookies at first, but ChatGPT 4e helped to solve the problem.

It involves using Hono CORS middleware with the frontend URL and `credentials: true`:

```ts
app.use(
  cors({
    origin: 'http://localhost:5173',
    allowHeaders: ['Content-Type'],
    allowMethods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    credentials: true,
  })
);
```

Also, the fetch API at the frontend always needs an extra line

```
credentials: 'include'
```

Finally, there is a difference between the local (dev) and prod modes not shown in this code (which is tested only with the local development).

For the production mode, the cookie creation in Hono would need to be set this way:

```
setCookie(c, 'sessionId', sessionId, {
    path: '/',
    maxAge: ttlSeconds,
    httpOnly: true,
    sameSite: 'None', // Use 'None' for cross-origin requests
    secure: true, // Requires HTTPS
  });
```

Locally, `sameSite: Lax` while `secure: true` needs to be removed due to HTTP, as in this code. 

It is possible to test HTTPS locally and retain `secure: true`, but one needs to install `ngrok` and forward `localhost:3000` via

```sh
ngrok http 3000
```

Notice that `httpOnly: true` works both locally and globally. It blocks any client Js code access to a cookie value via `document.cookie`, which limits the XSS attacks.

# Further Notes

- One reason for SQLite is that it is just a file, not the whole server that needs a Docker container. However, SQLite has no date and uuid types, but I am not pedantic and advanced enough to worry about such matters.

- I am still hesitating whether this is the way to build CRUD apps. It is tedious, fragile, low level. Express with the MongoDB Atlas service and Compass desktop app is probably easier, but they are all quite a hassle. On the other hand, everything is under control and almost no onboarding compared to CMSes like PocketBase or Payload.

- A strong side of this stack is that it is developer-friendly, and its parts are replaceable. It is just TypeScript and the web.
