> "Sad thoughts come to me when I look in a bookcase full of biochemistry books. I realize that the bookcase will last much longer than the contents of the books in it."
>
> — _Bolesław Skarżyński (1901-1963)_

# Introduction

This is the backend part of a session-based user name and password authentication with a [frontend](https://github.com/aabbtree77/auth-starter-frontend).

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

cd into the cloned frontend part and run TypeScript as documented in [README.md](https://github.com/aabbtree77/auth-starter-frontend).

# Debugging

Delete the tables with the browser GUI in Drizzle Studio. Use `bun run db:generate` if you adjust the tables/schema. `bun run db:push` creates and updates the actual database file in `/storage`. If some weird problems appear, delete the `*.db` file inside that folder. This is how I handle "migrations" ;).

I use `bun:sqlite` instead of `better-sqlite3`, but the latter is still needed by drizzle-kit, so better-sqlite3 is in `package.json`, but not in the code. See [this issue](https://github.com/drizzle-team/drizzle-orm/issues/1520).

If you plan on changing the database, pay attention at the time zones and TypeScript's Date.Now(). `src/utils/sessionhelper.ts` appends `Z` to enforce the UTC when extracting the session expiry from the session table. Without such care, storing and reading may not result in the same value, and with the use of Date.Now() one can easily get some weird bugs where everything works only for longer session expiration times.

In my case, I am 3 hours ahead of the UTC, and could not see any problems when setting a session expiry to 5 hours, at first. It turned out that the program had a bug as it would subtract 3 hours from `session.expiresAt` due to UTC not enforced, killing a session instantly for the TTL values smaller or equal to 3 hours.

# Security

This is a bare-bones minimal authentication, use it at your own risk.

Notice that there is no `.env` inside `.gitignore`. You may need to change that.

I could not set any cookies at first, but ChatGPT 4o helped to solve the problem admirably.

It involves using Hono CORS middleware with the frontend URL and `credentials: true`:

```ts
app.use(
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
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

- SQLite has no date and uuid types and they say it is worse at "horizontal scaling" when compared to PostgreSQL. I am not pedantic and advanced enough to worry about such matters.

- Bun is replacable with Node, Hono with Express, SQLite with PostgreSQL. Redo this with ChatGPT/DeepSeek file by file for your use case in a separate repo instead of building a generic caboodle.

- Push this further or jump to something ready-made such as PocketBase or Better Auth?!

# References

[The 2023 State of JavaScript survey](https://2023.stateofjs.com/en-US/usage/)

[Complex Schema Design with Drizzle ORM. youtube, 2024](https://www.youtube.com/watch?v=vLze97zZKsU&t=2305s)

[You should learn Drizzle, the TypeScript SQL ORM. Syntax podcast #721, 2024](https://syntax.fm/show/721/you-should-learn-drizzle-the-typescript-sql-orm)

# Update 2026: Js/Ts Madness

js, ts, [d.ts](https://www.reddit.com/r/typescript/comments/17vqe05/library_with_the_most_complex_typings/), jsx, tsx, mjs, mts, cjs, cts, map, [tsconfig.json](https://kettanaito.com/blog/one-thing-nobody-explained-to-you-about-typescript),

[a tiny vite+react page](https://github.com/aabbtree77/cv): .eslintrc.cjs, package-lock.json, package.json, postcss.config.js, tailwind.config.mjs, tsconfig.json, tsconfig.node.json, vite.config.ts, vite-env.d.ts,

cjs, esm, amd, umd, cdn - module definitions, construction, instantiation, evaluation, fetching,

\@ used for (i) scoped (grouped) npm packages, or (ii) as a convention for path aliases inside config files, but some also use \# for the latter,

node, bun, deno, cloudflare workers, service workers, hermes, aws lambda, browsers - runtimes,

nvm, fnm, nvs, volta, asdf - node version managers,

npm, yarn, bower, pnpm — Js/Ts package managers,

npx, yarn dlx, bunx - "package executors",

browserify, requirejs, lsjs, systemjs, jspm, ncc - module loaders?

tsx, ts-node - Ts "execution engines" and REPLs for node,

grunt, gulp, esbuild, tsup, rollup, parcel, webpack, turbopack, rspack,
yeoman, dynohot, cra, create-t3-app, vite, vite ssr, create-next-app..., create-remix, npm create astro, bun create... - project generators, task runners, bundlers, tree shakers,
minifiers, hot module reloaders, source map generators,

jslint, eslint, prettier, REST Client - VS Code extensions to turn your text editor into a Christmas tree,

tsc, tsgo, swc — Ts to Js compilers, but they do not compile to binary,

v8, spidermonkey - Js compilers to binary, also called "engines",

libuv - C++ event loop and asynchronous I/O library reused by node for async operations with fs and networking,

"partytown is a lazy-loaded library to help relocate resource-intensive scripts into a web worker",

[jispy](https://github.com/polydojo/jispy/issues/1), mocha (ES1, Brendan Eich), javascriptcore, graaljs, rhino, escargot (Samsung TVs), scriptease (ES3, James Webb Space Telescope) - Js bytecode interpreters,

after Douglas Crockford's cleanup, ES6 Promise, then, catch, finally, [\*generator, function\*, next, throw, return, yield, yield\*,](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*),
ES6 classes, Ts classes arrive. Who ordered these? So even more tools:

narcissus, babel — ES6+ compilers/transpilers to older standards,

Ts is a superset of Js,

angelscript, jsx, svelte, astro - additional Js/Ts subsets and supersets,

JSDoc, [Closure Compiler](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler) - static type annotations inside comments,

[Proposal T39](https://tc39.es/proposal-type-annotations/), [Flow](https://flow.org/en/docs/types/) typed Js supersets, similar to Ts,

nx, turborepo, lerna — "monorepo tooling", workspaces atop of npm for incremental builds, caching,

pkg, yao-pkg, nexe - package Node.js project into an executable,

[npm malware attacks](https://www.bleepingcomputer.com/news/security/shai-hulud-20-npm-malware-attack-exposed-up-to-400-000-dev-secrets/), [memory leaks...](https://www.youtube.com/watch?v=gNDBwxeBrF4&t=176s)
