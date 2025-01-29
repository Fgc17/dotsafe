# Thoughts about environment variables and how I built fatima

## An overview

I've been coding with TypeScript for two years now. I remember the first time I created a project with the NestJS CLI, and not long after, I stumbled upon this:

```typescript
type Env = {
  NODE_ENV: string;
  PORT: string;
  DB_HOST: string;
};

// It was actually an injectable class (nestjs stuff), but the point is the same.
function getEnv(key: keyof typeof Env): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`env ${key} is not set`);
  }

  return value;
}
```

Let's call it the `functional client approach`.

I wouldn’t be talking about it if, last month, a friend of mine hadn’t reached out to show me how people in a big company here in Brazil were handling environments in their monolithic TypeScript codebase: the same way as above.

That surprised me a little, so I asked myself: is everyone handling environments this same bad-but-working way? I’d say the vast majority of programmers are.

And you may ask, “Why is it bad?” Well, managing multiple sources of truth is bad. You change one thing in one place, and it breaks in another. So you have to manually keep multiple things always in sync.

I couldn't find a good name to this "multiple sources of truth problem", so let's call it the **multus problem**.

One of the most famous examples of the multus problem arises when developing full-stack applications. Every developer has, at some point, asked themselves: "How do I sync my backend and frontend types?" In an effort to address this issue, some have turned to GraphQL, others to tRPC, and still others to OpenAPI SDK generation.

Whenever this problem arises, usually there is someone trying to solve it, although no one solved it for .env files (still).

Most answers you get upon googling currently suggests the functional client approach, others suggested for a change in the global NodeJS namespace, let's call it the `namespace approach`:

```typescript
declare global {
  namespace NodeJS {
     interface ProcessEnv extends {
        YOUR_SECRET: string
     }
  }
}
```

Still, multiple sources of truth.

The only respected and popular package I've found was `t3-env`, it implements the `functional client` approach by providing a `createEnv` function.

Although it doesn’t solve the _multus problem_, it brings validation into play, which eases things a bit by explicitly giving errors when you start your app (missing envs, wrong envs, etc.).

By this point, I was already brainstorming something around secret managers, and the t3-env package gave me a lot more to think about: variable validation, proxy objects, public and private envs, build errors, runtime errors, etc. So let’s cover all of this and try to solve the _multus problem_.

## You need a secret manager

The truth is that we shouldn’t be using `.env` files anymore—at least not in projects you plan to make money from.

Password, account, and secret management should be a top priority for anyone serious about a project. You need to organize and keep your environments safe. That’s where cloud or self-hosted secret managers come into play.

This is the usual secret manager workflow:

1. Declare your secret in the dashboard
2. Use their CLI for loading the secrets from the cloud into local, excluding the need for .env files in development.
3. Setup their built-in integrations for CI/CD pipelines

However, what if the environments declared in the cloud could be synced and cause type errors in your local codebase?

And that's the same as asking: what if we could solve the _multus problem_ not only for .env files, but also for cloud providers?

This bigger purpose was what really got me into developing fatima, and for that we will need a secret loader.

## More config files?

No one needs more config files: prettier, eslint, package.json, .gitignore, tsconfig.json, next.config.ts, tailwind.config.ts, nest-cli.json, ... (this list probably bigger than the R set).

I tried to think a way out of a config file, but the try didn't last more than 15 seconds, obviously we need a js file for executing js code (the secret loader).

And even though we can't avoid this embarrasing situation, we can make the most out of it by using a `.ts` config rather than a `.js` one.

In case you ever wondered how to execute `.ts` in runtime, there is [jiti](https://www.npmjs.com/package/jiti).

Kinda hard on the bundle size, but we will be using it only on CLI commands.

## Why we should be agnostic

Environment variables are present in `any` nodejs project, that's a rule, and that's why we should be agnostic.

I knew from start that the secret loader should load from `any` source and inject into `any` process.

The loading part is already addressed through the config file by the required `load` key, now we just need a way to execute the loading.

The way will be through the fatima CLI, built with [commander](https://www.npmjs.com/package/commander), so here's our first command:

`fatima generate`.

Currently this only executes the function, but soon it will be generating something more.

As for the variable injection, NodeJS `spawn` method is enough, just spawn with whatever environments you want (in this case, the ones gotten from the loader).

Therefore, here's our second command:

`fatima run -- npm run <your-script>`.

So wet variables the way we want, and inject it into the process we want, things are looking pretty agnostic.

However, agnostic doesn’t mean that we shouldn’t try to provide some kind of help to the user. That’s what I think an “agnostic library” should be: **support all, help most**.

Hence I got some adapters working. That way a percentage of users won't have a hard time figuring out how to set things up (vercel really needed an adapter, lol).

There's a loader, now there must be types.

## About code generation

One of the things that I really like about TRPC is that it does not require code generation for creating a single source of truth, but there's a reason for that.

First we must state that there's no way to avoid multiple sources of truth without code generation when dealing with two different programming languages.

TRPC works without code generation because frontend can be coded in TS, and trpc is coded in TS.

However we are dealing with `.env -> .ts` here, so if we want one source of truth, there must be code generation.

So let's face the first question: inside or outside node_modules?

If you ever worked with Prisma ORM (on vscode) you may have noticed that it somehow reloads the typescript server each time you generate the types. That's no mistake, and it happens through the prisma vscode extension.

It happens because vscode is pretty bad at recognizing generated types, even worse when dealing with stuff inside `node_modules`.

Although setting the vscode file watcher config can help in some type reloading cases, I aimed for the best UX and decided to generate the types in the project root, inside a `.ts` file.

Tweaking the generate command, now it creates a `env.ts` with the following content:

```typescript
// env.ts

type EnvKeys = "NODE_ENV" | ...
```

The `EnvKeys` are the same loaded from the secret loader, and most important: as soon as you hit `npm fatima generate` it automatically reads the new types without having to open the file or restart the ts server.

## Functional versus Namespace

We already got the types, so now how do we make them accessible to the user? Here are our options:

- `process.env['key'] (namespace approach)`
- `env.get('key') (functional method approach)`
- `env['key'] (functional proxy approach)`

Through my experience in coding I've learned a big lesson: **less to think, less to sh\*t**.

Every single step of depth you add to a project is one more thing to think about, one more thing to be cautious of, and one more thing to distract you from what matters: **yielding value to the world**.

We are all familiar with the goold old `process.env['key']`, so it would be really great if we could just use it instead of a client, right? Yeah, but we can't.

At least for VScode, you can't generate code that modifies the nodejs global namespace and get automatic type reload, you will need to reload the server or open the file.

That means we can't use `process.env` if we aim for a good UX.

Also, using a typed `process.env` in a SSR framework project is not a good idea. (I will cover this further)

## Ecmascript proxies

We still got a choice to make: `env.get('key')` or just `env['key']`?

You may say that when using a function instead of an object, we can implement more functionality around it, like in the functional client approach I showed at the start.

And yeah, that’s true, even more so because we will need more functionality when accessing the environments.

Let's say that in the development environment the user forgets to run their script with `fatima run -- ...` and now all variables are undefined.

Yeah, I know, they should read the first 10 seconds of the quickstart, but who never installed a library in a rush of emotion just to see things working and forgot some stuff in the process?

Good error messages are extremely important, and **people really like when they are told exactly what is wrong.**

I have implemented a "Environment variable not found", but this message is not even as good as "Enviroment variable not found, did you forget to do fatima run?"

And that brings us to the crystal clear conclusion of `env.get`, right? Wrong.

We can also implement more functionality around objects if we use ECMAScript proxies.

By using `new Proxy(process.env, { Reflect api stuff })`, boom, we can validate the access of an object. Isn't that amazing?

## Public and Server environments

There's more to the functional approach than just variable access validation, and that would be the differentiation of public and server environments.

This is one of the things I really dislike about `t3-env`, it nests public and server secrets inside one object.

As I see it, these things should be separate, you shouldn't be able to access a total private secret in the same object you access a public one.

And you may ask: "but process.env is nested what are you saying?".

Yeah, process.env is nested, but it is doesn't have intellisense, so it is not so easy to leak, which is different from the case you have a list of things to easily pick.

Following this point of view, fatima generate two different objects: `env` and `publicEnv`.

## Environment leaking

One thing that caught my attention on the `t3-env` docs is the code comment that states:

```typescript
// Will throw if you access these (server envs) on the client
```

Although this statement is right, I find it a bit misleading for new users.

No, `t3-env` will not stop you from leaking any server variables into the client.

Actually, Next.js already protects you from this. No server environment will ever be defined on the client. What `t3-env` does is just warn you with a different message that you are trying to access something undefined.

And that's fine, as I said above, good error messages are important, but look carefully: **you can't access server secrets on the client, but no one said you can't leak secrets from the server to the client**

Here are the two ways of leaking your environments into the client:

- Through the server component return (ssr)
- Through an endpoint response (any backend/client relation)

The first case can be partially solved through an ESLint rule—I’ve written one for fatima. The rule blocks you from accessing the server variables inside specified files (e.g., .jsx).

And it only partially solves the issue because you can still access the variable in the service file, import the service in the server component, and leak it into the HTML. But at least you will have some kind of protection.

About the second case, it is a tough one and can only be solved with frameworks that provide some kind of response middleware.

NestJS, for instance, provides a thing called 'interceptors'. Interceptors can intercept both requests and responses.

In this case, it would be enough to check the type of the response (no one is going to check if a secret got leaked inside an image, right?) and then search for any secret inside of it.

Generally speaking, **carefulness is the ultimate solution for secret leaking**.

## Variable validation

When I started writing this, t3 didn't have support for bringing your own validation library, now it does.

It supports anything that follows the Standard Schema, that currently means `zod`, `valibot` and `arktype`, but hey, what about our class-validator (and many other) friends?

Don't get me wrong, I really like the modern approach, and it does suit all of my current projects, but this is far from 'bring your own'.

For fatima variable validation I choose to keep my principle: **support all, help most**.

Right beside the `load` function we got a `validate` function, as long as your validation library can return a boolean and an array of errors, you are good to go with fatima.

For the _help most_ part here we will do the same as for loaders, built-in functions, so it can work out of the box not only with standard schema libraries.

Now about how validation should happen: through the CLI.

No additional setup, no headache, just hit `fatima validate` and it will run the validate function against all envs returned from the loader.

Run it before building and you are good to go.

## Watching .env changes

Restarting a process is annoying, very annoying, so we need to do something about hot reloading.

For local development, reloading is straightforward: we set up IPC communication in the spawn method, watch .env files, and update the process.env object whenever changes are detected.

Reloading locally is easy: setup IPC communication in the spawn method, watch '.env' files and re-assign the process.env object when anything happens.

However things get trickier when it comes to handling changes that happen in the cloud.

At first glance we can think of some stuff: http servers, tunnels, webhooks, extra configs, built-in tunnels and even "let's forget this feature".

Still I really wanted to make this work, what could possibly be cooler than changing a secret in the infisical panel and causing a type error in my vscode window.

One of the most important things here to me is to not create a library that feels _bloated_ with hundreds of options, so I made things as simple as possible.

The only configuration needed is a `--port` option in the `fatima run`, in case it is specified, we spin up a single endpoint server with the nodejs http module.

For exposing the endpoint we need tunneling, I considered a function in the config file that would use tunneling libraries like [localtunnel](https://github.com/localtunnel/localtunnel).

Yet, this approach doesn’t fit every use case. Not all tunneling libraries offer a Node.js API, so it’s better to let users handle tunneling themselves.

After spinning up the local server, setting up the tunnel and configuring the webhook in the secret manager, the environments will reload the same way as they do locally: via IPC and re-assigning the process.env object.

It seems everything is fine now, right? Not quite.

What about secret managers that do not provide webhook functionality?

Usually, these are the ones that _have_ secret managers rather than being secret managers themselves, such as vercel, railway, trigger.dev, etc.

For this unfortunate case, I'm afraid there isn't going to be a fatima vscode extension providing a reload button.

But there will surely be a `fatima reload` command that can be executed on a second terminal and tell the `fatima run` process to reload without restarting.

## My thoughts on t3-env and fatima

I’ve discussed t3-env here because it’s the only big one out there.

My general thoughts on it were somehow already leaked above, but in the end, this is what I see: **t3-env was made for t3-stack.**

Nothing wrong with that. Actually, this is what it should be. The package is really nice and it works.

But I built fatima to work with everyone, no matter if you are using next or nest, zod or class-validator.

Clearly this 'agnostic principle' makes the setup a bit harder than just declaring a zod schema when you are already inside t3 stack, so props to t3-env for its awesome simplicity.
