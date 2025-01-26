# Thoughts about environment variables and why I built Dotsafe

## An overview

I've been coding with TypeScript for three years now. I remember the first time I created a project with the NestJS CLI, and not long after, I stumbled upon this:

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

And you may ask, “Why is it bad?” Well, managing two sources of truth is bad. You change one thing in one place, and it breaks in another. So you have to manually keep two things always in sync.

The last time I checked typesafe environment packages was a long time ago before this situation, so I quickly looked again to see if things had changed. To my surprise, there still weren’t many solutions to this problem.

Most material I found suggested the functional client approach and some suggested for a change in the global NodeJS namespace, let's call it the `namespace approach`:

```typescript
declare global {
  namespace NodeJS {
     interface ProcessEnv extends {
        YOUR_SECRET: string
     }
  }
}
```

Still, two sources of truth.

The only respected and popular package I've found was `t3-env`, it tries to solve the problem with the `functional client` approach by providing a `createEnv` function.

Although it doesn’t solve the two-sources problem, it brings validation into play, which eases things a bit by explicitly giving errors when you start your app (missing envs, wrong envs, etc.).

By this point, I was already brainstorming something around secret managers, and the t3-env package gave me a lot more to think about: variable validation, proxy objects, public and private envs, build errors, runtime errors, etc. So let’s cover all of this and try to solve the two-sources problem.

## You need a secret manager

The truth is that we shouldn’t be using `.env` files anymore—at least not in projects you plan to make money from.

Password, account, and secret management should be a top priority for anyone serious about a project. You need to organize and keep your environments safe. That’s where cloud or self-hosted secret managers come into play.

Every secret manager offers a way to separate different environments: `dev`, `test`, `staging`, `production`, etc. But what happens when you need to fetch the environments for your pipeline or development workspace?

Well, Vercel, for instance, offers all of this out of the box—a CLI for running on your machine and their secret management tab for each project.

Infisical, on the other hand, does the same, but since it isn’t a hosting platform, it provides integration with most of them.

The list goes on, and the question is: could we create a way to automatically make envs typesafe and validate them directly from secret managers? Yeah, we can. We need a secret loader.

## Why we should be agnostic

Environment variables are present in `any` nodejs project, that's a rule, and that's why we should be agnostic here.

I knew the secret loader should be a function that loads from `any` source and injects into `any` process.

By using `jiti` for the typescript config file and spawn method from node, dotsafe provides a way for declaring a loader and running `dotsafe run -- npm run script`.

Any object returned from the loader will be merged into `process.env`, simple as that.

But agnostic doesn’t mean that we shouldn’t provide some kind of help to the user. That’s what I think an “agnostic library” should be: **support all, help most**.

So I got some adapters working. That way a percentage of users won't have a hard time figuring out how to set things up.

If the loader works, then we have an object with all environments from any source. The next step is to generate the types.

## About code generation

One of the things that I really like about TRPC is that it does not require code generation for creating a single source of truth, but there's a reason for that.

First we must state that there's no way to avoid multiple sources of truth without code generation when dealing with two different programming languages.

TRPC works without code generation because frontend can be coded in TS, and trpc is coded in TS.

However we are dealing with `.env` here, and also maybe secret managers, so if we want one source of truth, there must be code generation.

If you ever worked with prisma (on vscode) you may have noticed that it somehow reloads the typescript server each time you generate the client.

That's no mistake, and it happens through the prisma vscode extension. It happens because typescript won't recognize generated types under `node_modules` unless you restart the server or open the type

So I thought of making something different: generate code in the project root inside a `.ts` file.

And it worked, as soon as you hit `npm dotsafe generate` it automatically reads the new types without having to open the file or restart the server.

## Functional versus Namespace

We already got the types, so now how do we make them accessible to the user? Here are our options:

- `process.env['key'] (namespace approach)`
- `env.get('key') (functional method approach)`
- `env['key'] (functional proxy approach)`

Through my experience in coding I've learned a big lesson: **less to think, less to sh\*t**.

Every single step of depth you add to a project is one more thing to think about, one more thing to be cautious of, and one more thing to distract you from what matters: **yielding value to the world**.

We are all familiar with the goold old `process.env['key']`, so it would be really great if we could just use it instead of a client, right? Yeah, but we can't.

Remember when I said types didn’t reload well with `node_modules`? It seems they also don’t reload well when tweaking the NodeJS global namespace. You also need to reload the server or open the file in this case.

That means we can't use `process.env` if we aim for a good UX.

Also, using a typed `process.env` in a SSR framework project is not a good idea. (I will cover this further in this article)

## Ecmascript Proxies

We still got a choice to make: `env.get('key')` or just `env['key']`?

You may say that when using a function instead of an object, we can implement more functionality around it, like in the functional client approach I showed at the start.

And yeah, that’s true, even more so because we will need more functionality when accessing the environments.

I’ve implemented it, but we would not actually need to verify if the env is defined, because if they aren’t, the project should not even build (as the types won’t generate, and there will be type errors).

However, let's say that in the development environment the user forgets to run their script with `dotsafe run -- ...` and now all variables are undefined.

Yeah, I know, they should read the first 10 seconds of the quickstart, but who never installed a library in a rush of emotion just to see things working and forgot some stuff in the process?

Good error messages are extremely important, and **people really like when they are told exactly what is wrong.**

The error "Environment variable not found" is not even as good as "Enviroment variable not found, did you forget to do dotsafe run?"

And that brings us to the crystal clear conclusion of `env.get`, right? Wrong.

We can also implement more functionality around objects if we use ECMAScript proxies.

By using `new Proxy(process.env, { Reflect api stuff })`, boom, we can validate the access of an object. Isn't that amazing?

## Public and Server Environments

There's more to the functional approach than just variable access validation, and that would be the differentiation of public and server environments.

This is one of the things I really dislike about `t3-env`, it nests public and server secrets inside one object.

As I see it, these things should be separate, you shouldn't be able to access a total private secret in the same object you access a public one.

And you may say: "but process.env is nested what are you saying"?

Yeah, process.env is nested, but it is doesn't have intellisense, so it is not so easy to leak, which is different from the case you have a list of things to easily pick.

Following this point of view, dotsafe generate two different objects: `env` and `publicEnv`.

## Environment Leaking

One thing that caught my attention on the `t3-env` docs is the code comment that states

```typescript
// Will throw if you access these (server envs) on the client
```

Although this statement is right, I find it a bit misleading for new users.

No, `t3-env` will not stop you from leaking any server variables into the client (unlike written in their documentation).

Actually, Next.js already protects you from this. No server environment will ever be defined on the client. What `t3-env` does is just warn you with a different message that you are trying to access something undefined.

And that's fine, as I said above, good error messages are important, but look carefully: **you can't access server secrets on the client, but no one said you can't leak secrets from the server to the client**

Here are the two ways of leaking your environments into the client:

- Through the server component return (ssr)
- Through an endpoint response (any backend/client relation)

The first case can be partially solved through an ESLint rule—I’ve written one for Dotsafe.

The rule blocks you from accessing the server variables inside non-specified files (e.g., .jsx), so you can restrict variable access to files like `service.ts`.

And it only partially solves the issue because you can still access the variable in the service file, import the service in the server component, and leak it into the HTML. But at least you will have some kind of protection.

About the second case, it is a tough one and can only be solved with frameworks that provide some kind of response middleware.

NestJS, for instance, provides a thing called 'interceptors'. Interceptors can intercept both requests and responses.

In this case, it would be enough to check the type of the response (no one is going to check if a secret got leaked inside an image, right?) and then search for any secret inside of it.

Generally speaking, `carefulness is the ultimate solution for secret leaking`.

## Variable Validation

As for the time I started writing this, t3 still didn't have agnostic variable validation, seems now it does.

It supports anything that follows the Standard Schema, but what about our class-validator (and many other) friends?

Don't get me wrong, although I really like the modern approach, and how it suits all of my current projects, this is far from agnostic.

For dotsafe variable validation I choose to keep my principle: **support all, help most**.

As long as your validation library can return a boolean (e.g `isValid`) and an array of errors, you are good to go with dotsafe.

Obviously I don't plan to let most of people down, I hope by the time someone is reading this I've already shipped the `dotsafe.schema` functionality, similar to how loader adapters works.

Now about how validation should happen: through the CLI.

No additional setup, no headache, just hit "dotsafe validate" and it will work.

Run it before building and you are good to go.

## My thoughts on t3-env and dotsafe

I’ve discussed t3-env here because it’s the only big one out there.

My general thoughts on it were somehow already leaked above, but in the end, this is what I see: **t3-env was made for t3-stack.**

Nothing wrong with that. Actually, this is what it should be. The package is really nice and suits most people.

But I built dotsafe to try suit all of people, no matter if you are using Next or Nest, Zod or class-validator.

Clearly this 'agnostic principle' makes the setup a bit harder than just declaring a zod schema when you are already inside t3 stack, so props to t3-env for its awesome simplicity.

As of the time I’m writing this, the library is not complete. There are no tests yet, and some things could be polished. Anyway, there’s some decent progress done already.
