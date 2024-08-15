---
title: "Kidocode Workshop — express.js with SQL database"
description: "How to make an API backend using express.js and Prisma ORM"
image: "/assets/images/kidoworkshop1/img-hero.png"
author:
  - noaione
tags:
  - coding
  - workshop
  - kidocode
---

**Table of Contents**

- [QoL Extension for VSCode](#qol-extension-for-vscode)
- [Backend Section](#backend-section)
  - [TypeScript](#typescript)
  - [Prisma ORM (Database)](#prisma-orm-database)
  - [Source Code](#source-code)
    - [`src/utils.ts`](#srcutilsts)
    - [`src/types.ts`](#srctypests)
    - [`src/index.ts`](#srcindexts)
  - [Running our Server](#running-our-server)
- [Frontend Section](#frontend-section)
  - [Tailwind CSS](#tailwind-css)
  - [The Webpage View](#the-webpage-view)
  - [The JavaScript Magic](#the-javascript-magic)
- [Package Explanation](#package-explanation)

### QoL Extension for VSCode

- [JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Backend Section

1. Prepare `yarn` if you haven’t (yarn is a package manager for nodejs)
2. Create a new folder with the name `simple-passwd-manager` or anything you want
3. Open terminal in that folder and type: `yarn init`
   - The above command will initialize your project, follow it properly
4. Now, let’s install some of our development tools and packages (go to [#package explanation](#package-explanation) for explanation of our packages)
   - **express.js**: `yarn add express express-session` (`express-session` to manage our login session)
   - **TypeScript**: `yarn add --dev typescript ts-node ts-node-dev @types/node @types/express @types/express-session`
   - **Prisma**: `yarn add --dev prisma` and `yarn add @prisma/client`
5. Create the following folder: `public`, `prisma`, and `src`

### TypeScript

We first need to prepare our typescript project, after finishing the above section. Run the following command: `npx tsc --init`<br />
The above command will create a new tsconfig.json which you need to edit

**Enable**

- `resolveJsonModule`
- `sourceMap`
- `esModuleInterop`
- `forceConsistentCasingInFileNames`
- `strict`
- `skipLibCheck`

**Set**

- `target` -> `es2016`
- `lib` -> `["ESNext", "ESNext.Array"]`
- `module` -> `commonjs`
- `outDir` -> `./dist`

Then open your package.json file, and add `scripts` key if it's missing and add the following dictionary data:

```jsonc [package.json]
[...]
"scripts": {
    "start": "node ./dist/index.js",
    "dev": "ts-node --transpile-only ./src/index.ts",
    "build": "tsc",
    "watch": "ts-node-dev --respawn --transpile-only ./src/index.ts",
},
[...]
```

### Prisma ORM (Database)

Now, Let's setup our database system, we will be using Prisma ORM to help map our document into TypeScript or JavaScript.

In the same folder, type in terminal: `npx prisma init --datasource-provider sqlite` this command will initate prisma with SQLite backend.

After that, open the `prisma/schema.prisma` file and let's create our database schema:

- Our database need user model and our password collection model
- Name our user model: `User` and password collection as `PasswordBank`

```prisma [prisma/schema.prisma]
model User {

}

model PasswordBank {

}
```

Inside `User`, we need to define our user id, email, password, and their password collection.

```prisma [prisma/schema.prisma]
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String  // plaintext password, not hashed
  banks     PasswordBank[]
}
```

**Explanation!**

- `@id @default(autoincrement())` set our `id` key as the SQL ID, and the default will be an auto increment number
- `@unique` will make our email unique and not allow any duplicates
- `[]` symbol will mark that as a list (so `PasswordBank[]` would be a list of `PasswordBank`)

Inside `PasswordBank`, we need to define the ID, email, and password. We also need to add relation to our `User` data that will mark that specific password data for specific user.

```prisma [prisma/schema.prisma]
model PasswordBank {
  id          Int      @id @default(autoincrement())
  email       String
  password    String
  user        User     @relation(fields: [userId], references: [id])
  userId      Int
  lastUpdated DateTime @default(now())
}
```

**Explanation!**

- `User @relation(fields: [userId], references: [id])` would means that we are referencing our `User` model for this `PasswordBank`, the `fields` area will be one of the fields in the `PasswordBank` while the `references` will be any field in the `User` model.
- `DateTime @default(now())` would set the current time

After that, we need to generate our prisma client data.<br/>
**Execute:**

1. `npx prisma migrate dev --name init` (create a migration data)
2. `npx prisma generate` generate the actual data to be used in our script.

### Source Code

#### `src/utils.ts`

Our utility files include some file that we will generally use multiple times.

**We first need to create a `isNone` function which will check if a value is `null` or `undefined`**

```ts [src/utils.ts]
/**
 * Check if our value is undefined or null
 * @param value Value to be checked
 * @returns True if value is null or undefined
 */
export function isNone(value) {
  return value === null || value === undefined;
}
```

To make it TypeScript friendly and we can see all the type hints and warning, we need to mark our function with some TS-only feature.

```ts [src/utils.ts]
type Undefined = null | undefined;

export function isNone(value: any): value is Undefined {
  return value === null || value === undefined;
}
```

The above typing basically tells our TS compiler properly.

**After that, let's create `wrapJSON` function which will make our JSON response consistent.**

```ts [src/utils.ts]
/**
 * Wrap our data response in an unified response format
 * @param res Response object from express
 * @param data The data we will sent
 * @param error The error message we will sent
 * @param code The error code
 */
export function wrapJSON(res, data?: any, error?: string, code?: number) {
  if (isNone(data)) {
    res.json({
      error: error || (code === 200 ? "Success" : "Unknown Error"),
      code: code || 500,
      success: code === 200,
    });
  } else {
    res.json({
      data,
      error: error || (code === 200 ? "Success" : "Unknown Error"),
      code,
      success: code === 200,
    });
  }
}
```

The JSDoc explains more about what this code does.

If you want to type `res` parameter so TS knows what it is, do this:

```ts [src/utils.ts]
import { Response } from "express";

/**
 * Wrap our data response in an unified response format
 * @param res Response object from express
 * @param data The data we will sent
 * @param error The error message we will sent
 * @param code The error code
 */
export function wrapJSON(res: Response<any, Record<string, any>>, data?: any, error?: string, code?: number) {
  if (isNone(data)) {
    res.json({
      error: error || (code === 200 ? "Success" : "Unknown Error"),
      code: code || 500,
      success: code === 200,
    });
  } else {
    res.json({
      data,
      error: error || (code === 200 ? "Success" : "Unknown Error"),
      code,
      success: code === 200,
    });
  }
}
```

#### `src/types.ts`

This file would be our typing stuff that we will reuse sometimes.<br/>
You just need to copy paste this code to the file:

```ts [src/types.ts]
export interface IPassword {
  id: number;
  email: string;
  password: string;
  lastUpdated: string;
}
```

### `src/index.ts`

This would be our main entrypoint file for our server project.<br/>
**We first need to import some of the packages we will need.**

```ts [src/index.ts]
import { PrismaClient } from "@prisma/client";
import express from "express";
import session from "express-session";
import path from "path";
import { IPassword } from "./types";

import { wrapJSON } from "./utils";
```

The above would import:

- `PrismaClient` our database connector from Prisma
- `express` the express client itself
- `session` our session handler
- `path` NodeJS pathing packages, useful for ton of stuff
- `IPassword` our defined types from `src/types.ts`
- `wrapJSON` our defined function from `src/utils.ts`

**The second thing we need to do is to initalize our express app and our database client. We also want to define our public folder path.**

```ts [src/index.ts]
/**
 * Initialize our database and express server
 */
const prisma = new PrismaClient();
const app = express();

// Public file directory
const publicPath = path.join(__dirname, "..", "public");
```

**Explanation!**

- `path.join` will join together a list of parameter that we give together into system friendly path
- `__dirname` is internal variable provided by NodeJS, which tells the current file directory.
- The above `publicPath` would basically means go to the upper directory from `src` folder then `public` directory.

**The next thing we need to do is to set our express server to use JSON data and configure our express session handler.**

```ts [src/index.ts]
/**
 * Use JSON to process our body input
 */
app.use(express.json());
/**
 * Configure our express-session
 */
const sessConf: session.SessionOptions = {
  // Randomized secret, generated with `openssl rand -hex 32`
  secret: "CHANGETHISTHING",
  saveUninitialized: false,
  resave: false,
  cookie: {},
};

// If the app is running in production mode, enable trust proxy and secure cookies
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessConf.cookie!.secure = true;
}
// Bind our session
app.use(session(sessConf));
```

**Explanation and Help!**

- `app.use(express.json());` would use JSON as our body input
- `secret: "CHANGETHISTHING",` you need to change this to a proper random secret, you can use `openssl rand -hex 32` or just go to random string generator website
- The `app.get("env") === "production"` if statement is to basically use a more secure version for our session handling.

**After that, we need to create our API Router**

```ts [src/index.ts]
const apiRouter = express.Router();
```

The above would create a simple router for our API.

**Then, let's create our authenticator system (`/login`, `/signup`, `/logout`)**

```ts [src/index.ts]
apiRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    // Check password
    if (user.password === password) {
      // @ts-ignore
      req.session!.userId = user.id;
      req.session.save();
      wrapJSON(res, undefined, "Success", 200);
    } else {
      wrapJSON(res.status(401), undefined, "Invalid Password", 401);
    }
  } else {
    wrapJSON(res.status(401), undefined, "Invalid credentials", 401);
  }
});

apiRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  // Check email if it's been used!
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    wrapJSON(res.status(409), undefined, "User already exists", 409);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
      },
    });
    // @ts-ignore
    req.session!.userId = newUser.id;
    req.session.save();
    wrapJSON(res, undefined, "Success", 200);
  }
});

apiRouter.post("/logout", (req, res) => {
  // Destory our session
  req.session!.destroy((err) => {
    if (err) {
      wrapJSON(res.status(500), undefined, "Error", 500);
    } else {
      wrapJSON(res, undefined, "Success", 200);
    }
  });
});
```

**Explanation!**

- `POST /login` route
  1. We first receive our JSON data from user which should contains email and password
  2. Then we check if the email exist or not
  3. If yes, we will then check the password
     1. If correct, set our session to our `userId` and the return success
     2. If wrong, return an invalid password error
  4. If no, return an invalid credentials error
- `POST /signup` route
  1. We first receive our JSON data from user which should contains email and password
  2. Then we check if the email exist or not
  3. If not, we will then proceed creating our new account
  4. If yes, we will return User already exists error
- `POST /logout` route
  1. This route is just a simple session destroyer, after it destory it will just return a success

_Refer more to `wrapJSON` implementation for more info about how I use the function_

**After that, let's create a route to access/edit/delete our password bank**

```ts [src/index.ts]
apiRouter.get("/passwords", async (req, res) => {
  // @ts-ignore
  const { userId } = req.session!;
  if (!userId) {
    wrapJSON(res.status(403), undefined, "Unathorized", 403);
  } else {
    // Get all passwords related to our user id
    const passwords = await prisma.passwordBank.findMany({
      where: {
        userId,
      },
    });
    // Remap our password results
    const remappedPassword: IPassword[] = passwords.map((passwd) => {
      return {
        id: passwd.id,
        email: passwd.email,
        password: passwd.password,
        lastUpdated: passwd.lastUpdated.toISOString(),
      };
    });
    wrapJSON(res, remappedPassword, undefined, 200);
  }
});

apiRouter.post("/passwords", async (req, res) => {
  // @ts-ignore
  const { userId } = req.session!;
  if (!userId) {
    wrapJSON(res.status(403), undefined, "Unathorized", 403);
  } else {
    const { email, password } = req.body;
    const newPasswd = await prisma.passwordBank.create({
      data: {
        email,
        password,
        userId,
      },
    });
    wrapJSON(
      res,
      {
        id: newPasswd.id,
        email: newPasswd.email,
        password: newPasswd.password,
        lastUpdated: newPasswd.lastUpdated.toISOString(),
      } as IPassword,
      undefined,
      200
    );
  }
});

apiRouter.put("/passwords", async (req, res) => {
  // @ts-ignore
  const { userId } = req.session!;
  if (!userId) {
    wrapJSON(res.status(403), undefined, "Unathorized", 403);
  } else {
    const { email, password, id } = req.body;
    const updatedPasswd = await prisma.passwordBank.update({
      where: {
        id,
      },
      data: {
        email,
        password,
        lastUpdated: new Date(),
      },
    });
    wrapJSON(
      res,
      {
        id: updatedPasswd.id,
        email: updatedPasswd.email,
        password: updatedPasswd.password,
        lastUpdated: updatedPasswd.lastUpdated.toISOString(),
      } as IPassword,
      undefined,
      200
    );
  }
});

apiRouter.delete("/passwords", async (req, res) => {
  // @ts-ignore
  const { userId } = req.session!;
  if (!userId) {
    wrapJSON(res.status(403), undefined, "Unathorized", 403);
  } else {
    const { id } = req.body;
    await prisma.passwordBank.delete({
      where: {
        id,
      },
    });
    wrapJSON(res, undefined, undefined, 200);
  }
});
```

**Explanation!**

- In every route, we have our session ID check, making sure if we are properly logged on
- In our `GET` route, we remapped our result to only return relevant data.

**After creating all of our API route, we need to bind our router to the main app**

```ts [src/index.ts]
// Bind our static folder using express.static so it got served automatically
app.use(express.static(publicPath));
// bind our API router
app.use("/api", apiRouter);
```

**Explanation!**

- The first one would basically server our `publicPath` to the internet
- The second one is to basically bind our `apiRouter` with the base route of `/api`
  - Everything will turn from `/logout` to `/api/logout`

**After that, let's start our database and server**

```ts [src/index.ts]
// start server and before that connect to database
const port = process.env.PORT || 3000;

/**
 * Connect to our database, after it got established
 * we will then start our server
 */
prisma
  .$connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Starting server on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

**Explanation!**

- We first setup a port variable which take from our environment table or fallback to port 3000
- Then we first connect to our database, then using JavaScript promise we use the `.then` function to start our server.

**Also, we need to create a custom shutdown handler**

```ts [src/index.ts]
// Function to stop our server
function shutdownServer() {
  prisma
    .$disconnect()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

/**
 * Bind some exit code that we need to listen
 */
const processCallback = ["SIGINT", "SIGTERM", "SIGQUIT", "SIGHUP"];
processCallback.forEach((signal) => {
  process.on(signal, () => {
    console.log(`Received ${signal}`);
    shutdownServer();
  });
});
```

**Explanation!**

- The `shutdownServer` works the same way on connecting, but this time we just call an exit
- The `processCallback` is a list of callback we can use on `process` class or function, we basically want to handle all of those signal to call our custom shudtown function

### Running our Server

To run our server, we can use:

- `yarn dev` to start our server in development mode
- `yarn watch` to start our server in development mode and also automatically restart everytime there's changes

We can also build our server and run it using:

- `yarn build` to build our server
- `yarn start` to run our server

## Frontend Section

Since we already have our project ready, we just need to prepare some more stuff and install more depedencies.

1. Install TailwindCSS with `yarn add --dev tailwindcss @tailwindcss/forms`
2. Prepare our TailwindCSS with `npx tailwindcss init`, this will create a `tailwind.config.js` file.

### Tailwind CSS

We first need to configure our `tailwind.config.js` file, just replace yours with this:

```js [tailwind.config.js]
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{css,ts,tsx}", "./public/**/*.{css,html,js}"],
  theme: {
    // change to neutral
    extend: {
      colors: {
        gray: colors.neutral,
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
```

**Explanation!**

- We first import our `colors` from `tailwindcss/colors` to change our default gray color from `slate` to `neutral` to have a more gray-ish color
- We then extend our `colors` to change our `gray` color to `neutral`
- We then add our `@tailwindcss/forms` plugin to our `plugins` list

After that we will need to create our tailwind styles file:

1. Create `tailwind.css` in `src/styles/`
2. Add the following code:

```css [src/styles/tailwind.css]
@tailwind base;
@tailwind components;
@tailwind utilities;
```

We also need to add scripts to our `package.json` so our tailwind will be compiled:

```jsonc [package.json]
[...]
  "scripts": {
    "build:css": "npx tailwindcss -i ./src/styles/tailwind.css -o ./public/static/css/styles.css",
    "watch:css": "npx tailwindcss -i ./src/styles/tailwind.css -o ./public/static/css/styles.css --watch"
  }
[...]
```

You can then run `build:css` or `watch:css` to compile your tailwind styles.

### The Webpage View

In this section we will now create our html so we can display and modify our API/Database data.

We will need to create the following file inside the `public` folder:

- `index.html`
- `register.html`
- `dashboard.html`

And then, let's open our `src/index.ts` file again and atfer the `app.use("/api", apiRouter);` line, let's add the following code

```ts [src/index.ts]
// Add custom register route
app.get("/register", (req, res) => {
  res.sendFile(path.join(publicPath, "register.html"));
});

// Add our dashboard route
app.get("/dashboard", (req, res) => {
  // Check if the user is logged in
  // @ts-ignore
  if (req.session && req.session.userId) {
    res.sendFile(path.join(publicPath, "dashboard.html"));
  } else {
    res.redirect("/");
  }
});
```

**Explanation!**

- `/register` route need to be overriden or it will throw an error (or you need to add `.html` to the link)
- `/dashboard` would protect our dashboard route by checking if the user has logged session or not.

Then you can add all the following code to each of your html files.

**`public/index.html` as our login page**

:github-code{user="noaione" repo="express-sql-workshop" file="public/index.html" noLines}

**`public/register.html` as our registration page**

:github-code{user="noaione" repo="express-sql-workshop" file="public/register.html" noLines}

**`public/dashboard.html` as our dashboard page**

:github-code{user="noaione" repo="express-sql-workshop" file="public/dashboard.html" noLines}

You can just copy paste the contents to your own files.

**Explanation!**

- `/public/index.html` contents `(Login Page)`
  - This document only includes some simple form data that are does not have any action route since we will override it on our own JS later.
  - We only have 2 forms box, which is our email and password input box and also a submit button.
- `/public/register.html` contents
  - Mostly the same as our login page, which make our JS content similar too.
- `/public/dashboard.html` contents
  - In here, we will use `<table>` to render our password list, we are making our table body empty since we will dynamically add our contents to the pages.
  - We also have several modal that are hidden until displayed, this modal will be controlled manually using our JS file.
    - `#modalDelete` will be our confirmation modal if we want to delete our data
    - `#modalError` will be our modal to show any error occurred to our pages (JS file mainly)
    - `#modalAdd` will be our modal to add new password including a custom password generator which the result can be modified
      - `genPassLower` is a checkbox to enable lowercase letter (default: on)
      - `genPassUpper` is a checkbox to enable uppercase letter (default: off)
      - `genPassNum` is a checkbox to enable numbers (default: off)
      - `genPassSym` is a checkbox to enable symbols (default: off)
      - `genPassLength` is a number input to change our password length (minimum of 6, maximum of 100, and default of 8)
      - `btnRegenPass` is a button that allows us to regenerate the results
    - `#modalEdit` instead of adding a new password, this one will be for editing our existing password
      - A special feature later that we will add is to automatically check the password content and automatically check the checkbox and modify the number value on the go.

### The JavaScript Magic

Our JavaScript file will be written with ES6 in minds, which will only support modern browser only and not older version of a browser.

We will create our JS file inside the `public/static/js` folder, if you haven't created that folder yet, please create it first.

**`public/static/js/loginApp.js` as our login page JS.**

:github-code{user="noaione" repo="express-sql-workshop" file="public/static/js/loginApp.js" noLines}

**`public/static/js/registerApp.js` as our register page JS.**

:github-code{user="noaione" repo="express-sql-workshop" file="public/static/js/registerApp.js" noLines}

**Explanation!**<br />
Both code above are mostly the same except some variable and ID change since there's still some difference between login and register page.

- `document.readyState === "complete"` is a check if our whole page is ready to be modified by DOM, if not we will wait using `DOMContentLoaded` listener.
- We also overridden our `submit` event listener for both pages
  - `ev.preventDefault();` will prevent the default submit behavior to work, since we want to override it.
  - `POSTJson` is a function to basically send our data using `POST` method to our API.
  - `logError` is a way to add error data to our hidden `<div>` in our HTML
  - `isEmpty` is an extension of our `isNone` function which will also check if our string is empty, ignoring andy whitespaces

We also have this fucntion wrapper:

```js
(function () {
  // code here
})();
```

The above wrapper will basically execute all of our JS code without revealing it to the window DOM, example are showed in this video below.

:video{src="https://p.ihateani.me/zrayqnku.mp4" alt="Safeguard example"}

The reason is because we do not want outside user to access our function and make it stop working properly by fiddling with it.

**`public/static/js/dashboardApp.js` as our dashboard page JS.**

This JS will be the most complex one and has some function since we might repeat what we do.

:github-code{user="noaione" repo="express-sql-workshop" file="public/static/js/dashboardApp.js" noLines}

**Explanation!**

- `generatePassword` is a function that we will use to generate our random password, it accepts some parameters allowing us to modify the results.
- `DashboardState` is a state holder for our program, emulating how React State works.
- `GETJson` and `SENDJson` is a wrapper for JS `fetch` function and for `SENDJson` we can also change the HTTP method we are using (since we have to use `PUT`, `POST`, and `DELETE`)
- `handlePasswordDelete` is a custom function to handle password deletion.
  - We first fetch our table row using querySelector that use our custom data attribute
  - And then we get our deletion button to disable it since we don't want user to spam click it
  - After that we send `DELETE` request to our API
  - We then enable our again button and make our state null again, then we check if we should delete our table row if the deletion success or not
- `showModal` and `hideModal` is self-explanatory, it allows us to hide/show our modal, the function accept single parameter which is the element ID
- `generateTableRow` a function to generate our table row data
  - It basically just try to create a "complex" child of element with the `<tr>` element at the top
  - In button edit click handler
    - We set our password ID to the state
    - Then we check our password content for lowercase, capital, symbols, and numbers
    - Then we enable checkbox depending on the above result and also adjust the number value according to our password length
    - Then we can show our edit modal
  - We then set our button edit with custom attribute
  - In button delete click handler
    - We set the state to our password ID, then show the modal
  - We then set our button delete with custom attribute
  - We then start appending our element to the top element one by one
  - We then return the final table row element with all the relevant child
- `isAllGenModifierOff` is a function to check if our password generator modifier checkbox are all unchecked, it's used when we are cycling/regenerating password.
- `disablePasswordModifierCheckbox` and `enablePasswordModifierCheckbox` is a function to disable/enable our modifier button
- `shouldCloseOrNot` is a function to check if we should close our modal or not (used if user click outside the modal area)
- `displayError` is a simple function to show the error modal
- `hasAnyXXXXXXXXX` is a function to check if letter have `x`
- `cycleGeneratedPassword` is a function to regenerate our password and display it to the user
  - We first get some of our element
  - Then we check if all modifier button are unchecked or not, since we don't want to regenerate if all are off
  - Then we check all our checkbox state to determine how our generated password will looks like
  - Then we can display the result to the user.

## Package Explanation

**Dependencies**

- `@prisma/client` is our Prisma client, which is used to connect to our database
- `express` is our web framework, which is used to create our server
- `express-session` is our session middleware, which is used to create our session

**Dev Dependencies**

- `@tailwindcss/forms` is our TailwindCSS plugin, which is used to add some form styles
- `@types/express` is our Express types, which is used to add typing hints for our Express packages
- `@types/express-session` is our Express Session types, which is used to add typing hints for our Express Session packages
- `@types/node` is our Node types, which is used to add typing hints for NodeJS stuff
- `prisma` is our Prisma CLI, which is used to manage our Prisma schema and database
- `tailwindcss` is TailwindCSS, which is used to create our CSS styles dynamically depending on the classes we use
- `ts-node` is our TypeScript NodeJS runner, which is used to run our TypeScript code
- `ts-node-dev` is our TypeScript NodeJS runner with auto-restart, which is used to run our TypeScript code and automatically restart when there's changes
- `typescript` is our TypeScript compiler, which is used to compile our TypeScript code to JavaScript
