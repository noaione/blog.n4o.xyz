---
title: "The Adventure of Creating VTuber API"
description: ":AyameDespair: :AyameDespair: :AyameDespair:"
image: "/assets/images/whateven/ihaapidespair.png"
author:
  - noaione
tags:
  - coding
  - project
---

This really be an :AyameDespair: moment.

<!--more-->

---

::admonition{type="warning" title="Warning"}
This repository is unmaintained and archived, please just use [Holodex](https://holodex.net).
::

This blog post will recap my adventure of writing my self-published API that are sitting nicely on: [api.ihateani.me](https://api.ihateani.me)

The API consists of VTuber API and many more, and all of the backend (VTuber API) and "frontend" is Open Sourced:

:repo-card{username="ihateani-me" repo="ihaapi-ts"}

:repo-card{username="ihateani-me" repo="vtscheduler-ts"}

## The Beginning of the Despair |#journey01-python|

It's a bright sunny day outside, I was just watching a VTuber on--

Let's just get to the point since I can't write a story.<br />
I was interested on making a BiliBili Stream Schedules at first utilizing their "Schedules" before, but decided to expand it into tracking Other VTubers too.

The original code was written in Python 3, it was very bad and I hate it.<br />
The website is written via Flask, the database schema is very messy and like use a single document format which can be overwritten if another scheduler process was running so I need to make a "virtual lockfile" so the process is basically queued.

The backend code I think it's fine except the "Database Schema" part because that was pure hell.

When I implemented tracking for Nijisanji VTuber because Jetri decided to stop it, for some reason my monkey brain decided to use different database...

I don't know why, but it definitely making my life very hard.

![A database which consists of a single. document. why.](/assets/images/whateven/01_mdbnijihell.png)

Another fun thing is I'm using a local database of JSON data, so it definitely not very dynamic even though it works just fine, but that would mean rebuilding my Heroku instance everytime I add a new one.

![yeah...](/assets/images/whateven/02_vtbdataset.png)

The API itself also actually contains some private API that I use for my [bot](/posts/naotimes).<br />
So I was having some hard time actually maintaining my private used API and the one that Open-Sourced.

---

Fast-forward to October, I decided to try out JavaScript or more specifically TypeScript.<br />

## Another Language to Learn = More Despair |#journey02-typescript-port|

Moving from Python to TypeScript is like riding a bike with only one wheel going fast on downhill (and maybe the bike is on fire too).<br />
It was pure hell since how different it is, and especially my first implementation of the `async/await` stuff which use `Promises` which is hard to understand because it just doesn't work as I wanted :AyameDespair:

### Backend |#journey02-typescript-port-backend|

Not-so-fun-fact, the Backend actually ported later to TypeScript when I decided to actually utilize properly the MongoDB Schema design.

:github-code{user="ihateani-me" repo="vtscheduler-ts" file="src/models/youtube.ts" branch="d365d329a0d10fdef19ad8e626e252f2d97c6146" :startLine=3 :endLine=18}

The schema design changed over the journey, but that was the first design for all of the website I'm supporting.<br />
Every website have their own Collection, AND FINALLY I actually make the Channel database more dynamic, adding new VTuber doesnt need a full restart of my Instance.

I just need to run a database script which I can use to add new information about a channel to the database.

I still use a local JSON dataset, but that was not used for the scheduler task itself.

---

Fast forward again, I finally merged all the separate collection into one big collection.

:github-code{user="ihateani-me" repo="vtscheduler-ts" file="src/models/videos.ts" branch="35877e7d9254671867e823b60be26f936252b43e" :startLine=2 :endLine=31}

This also introduces some more informational stuff and more comprehensive results for the API.

I also introduced some new Collection like `ViewersData` that will track the amount of Viewers and use it for the `averageViewers` later

![This looks much better and cleaner, and actually easy to filter](/assets/images/whateven/03_db_that_looks_clean_enough_lmao.png)

### Frontend |#journey02-typescript-port-frontend|

Oh boy.

The frontend part of the API is actually the hardest to port with how I want to open-source all of my other API that I use internally.

This resulted in me dying for a whole 3 weeks learning and writing TypeScript code, rewriting some logic to fit the code much better and such.

I do still have some private-used API, but with how """dynamic""" I tried to write the TypeScript version, it's not very hard.

![This is the view of Version 2.5.1, I'll try to find older version snapshot](/assets/images/whateven/04_ihaapiv251.png)

---

I also made some changes to the API docs which use ReDoc UI rather than Swagger UI, which I think much more cleaner.

I'm not gonna talk more since it's mostly the same as the original Python code.

## Migrating to GraphQL API |#journey03-graphql-hell|

As with the introduction of the new Database schema mentioned in the [Frontend](#journey02-typescript-port-frontend) section.

I'm planning to changes to GraphQL API which actually more useful in my case.

I decided to make a plan of porting the original VTuber API code to GraphQL API, and I think it tooks around 3 days to finish it.

Not only that, I also ported the Sauce Finder API and the \*_cough_\* A doujin Website API \*_cough_\*.

---

Using GraphQL actually is very easy tbh, it doesn't takes really long to actually realize what I need to do, and I already have most of my base code from the old one, and just need to readjust to the new one.

## The End of Despair? |#journey04-the-end|

One day, I decided to "Rewrite" or "Restructure" the code base of [ihaapi-ts](https://github.com/ihateani-me/ihaapi-ts), you can see the PR here: [PR #10](https://github.com/ihateani-me/ihaapi-ts/pull/10).

This rewrite mainly for a much more pretty code, and a little bit more dynamic.

Also made some auto-deployment script using GitHub actions so I dont need to do any manual file-replacing-and-compile.

:github-code{user="ihateani-me" repo="ihaapi-ts" file=".github/workflows/ci.yml" :startLine=100}

This `yml` script is a time-saver.

## Closing

It was pretty fun doing this, it's very much not a great experience. But having my own database of VTuber is very nice.

I mainly use the API with my Discord Bot, I dont know how much traffic coming from another person that's not me, but I'm happy if someone going to use my API.

Cheers!

**P.S.**<br />

```
There's around 400+ VTubers registered, including some duplicates VTuber that also stream on another platform.
```

**P.P.S**<br />

```
One day I finish the Bilibili API scheduler, I swear lmao.
```

