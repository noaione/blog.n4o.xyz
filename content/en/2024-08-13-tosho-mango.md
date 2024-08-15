---
title: |
  Ripping: Official “Simulpub” Manga
description: |
  Download official “simulpublished” manga from various official sources
tags:
  - project
  - coding
image: /assets/images/toshomango/og-image.png
author: noaione
---

Download official "simulpublished" manga from various official sources.

<!--more-->

:repo-card{username="noaione" repo="tosho-mango"}

---

**[tosho-mango](https://github.com/noaione/tosho-mango)** or **[tosho](https://github.com/noaione/tosho-mango)** is a CLI tools that I created in Rust to help download manga from various [official sources](#platforms).

## Why?

Karena suka aja baca manga translasi Inggris yang _official_, jadi karena ada beberapa platform atau publisher yang mulai menggunakan sistem _CaaS (Chapter-as-a-Service)_ jadi saya buat ini biar bisa membuat _backup_ manga atau chapter yang saya beli atau baca. Karena website bisa hilang kapan saja tanpa pemberitahuan.

Because I like reading officially translated English manga, and since a ton of publishers decide to have a giga-brain idea of making their own CaaS (Chapter-as-a-Service) platform, I decide to make this so I can make a backup of manga or chapter that I bought or read. Because websites can disappear anytime without any notice.

## Installation

You need:

- Windows 10+, Linux, atau MacOS
- 64-bit OS
- Modern terminal with the following ANSI support:
  - Support [OSC-8](https://github.com/Alhadis/OSC8-Adoption#terminal-emulators)
  - Support [truecolor](https://github.com/termstandard/colors#terminal-emulators) and the standard 8/16 colors
  - Test code: https://gist.github.com/lilydjwg/fdeaf79e921c2f413f44b6f613f6ad53

Then, to install `tosho`, you can use various methods:

- **Stable** release via [GitHub Release](https://github.com/noaione/tosho-mango/releases)
- **Nightly** release via [GitHub Actions](https://github.com/noaione/tosho-mango/actions/workflows/ci.yml?query=branch%3Amaster) (or [nightly.link](https://nightly.link/noaione/tosho-mango/workflows/ci/master?preview))
- Use `cargo` from Rust toolchain to install it

```bash
cargo install --locked tosho
```

Or, use [`cargo-binstall`](https://github.com/cargo-bins/cargo-binstall)

```bash
cargo binstall --locked tosho
```

Or, you can create your own build from the source code:

1. _Clone_ the repository: `git clone https://github.com/noaione/tosho-mango.git`{lang=bash}
2. Run `cargo build --release --locked --all`{lang=bash}
3. Binary will be provided at `target/release/tosho`{lang=bash} or `.\target\release\tosho.exe`{lang=powershell}

### Supported platforms |#platforms|

The following are the supported websites (with redacted names):

- [MU! by SQ](https://github.com/noaione/tosho-mango/tree/master/tosho_musq) (Android, Apple)
- [KM by KC](https://github.com/noaione/tosho-mango/tree/master/tosho_kmkc) (Android, Apple, Web)
- [AM by AP](https://github.com/noaione/tosho-mango/tree/master/tosho_amap) (Android)
- [SJ/M by V](https://github.com/noaione/tosho-mango/tree/master/tosho_sjv) (Android, Apple, Web)
- [小豆 (Red Bean) by KRKR](https://github.com/noaione/tosho-mango/tree/master/tosho_rbean) (Android)
- [M+ by S](https://github.com/noaione/tosho-mango/tree/master/tosho_mplus) (Android)

A more complete and up-to-date list can be found in the [repository itself](https://github.com/noaione/tosho-mango#supported-platform)

## Usages

`tosho-mango` is very easy to use:

:asciinema{url="https://asciinema.org/a/636303.cast"}

In a nutshell, just run `tosho` in your terminal to start looking for commands that you can run.

### Authentication

Setiap platform membutuhkan autentikasi, jadi anda perlu login terlebih dahulu.<br />
Untuk melakukan login, anda bisa menggunakan basis perintah: `tosho [platform] auth`{lang=bash}.

Each platform has their own authentication system, so you need to login first.<br />
To login, all the auth command follows the same pattern: `tosho [platform] auth`{lang=bash}.

Some source like `MU!` and `M+` use token to authenticate, so you need to do Network Interception to get the token.

Each platform `README` contains how to login and intercept the token (if needed):

- [MU! by SQ](https://github.com/noaione/tosho-mango/tree/master/tosho_musq#authentication)
- [KM by KC](https://github.com/noaione/tosho-mango/tree/master/tosho_kmkc#authentication)
- [AM by AP](https://github.com/noaione/tosho-mango/tree/master/tosho_amap#authentication)
- [SJ/M by V](https://github.com/noaione/tosho-mango/tree/master/tosho_sjv#authentication)
- [小豆 (Red Bean) by KRKR](https://github.com/noaione/tosho-mango/tree/master/tosho_rbean#authentication)
- [M+ by S](https://github.com/noaione/tosho-mango/tree/master/tosho_mplus#authentication)

## Downloading

Semua perintah untuk mengunduh manga ada di `tosho [platform] download [id]`{lang=powershell}.<br />
Dan, untuk melihat daftar perintah tiap platform, bisa menggunakan `tosho [platform] --help`{lang=powershell}.

All the commands to download manga are in the form of `tosho [platform] download [id]`{lang=powershell}.<br />
And, to see the list of commands for each platform, you can use `tosho [platform] --help`{lang=powershell}.

![Download with tosho](https://p.ihateani.me/fxdvesbw.gif)

Download result will be available in `${ROOT}/DOWNLOADS/${ID}`{lang=bash}

![Download result](/assets/images/toshomango/01_downloadfolder.png)

## Merging

Terkadang ada beberapa chapter yang di-_split_ menjadi beberapa bagian, anda bisa mengabungkan chapter tersebut menjadi satu dengan perintah `tosho tools merge [folder]`{lang=bash} atau `tosho tools automerge [folder]`{lang=bash}.

Sometimes, there are chapters that are split into several parts, you can merge those chapters into one with the command `tosho tools merge [folder]`{lang=bash} or `tosho tools automerge [folder]`{lang=bash}.

`[folder]` is the folder location of the downloaded result with `_info.json` file inside.

![_info.json file](/assets/images/toshomango/02_mergeinfo.png)

### Auto-merge

Auto-merging is a feature where `tosho` will try to merge all separated chapters into one by using the chapter title and checking which chapter is likely part of the same chapter.

This is how each chapter will be done:

![Auto merging](/assets/images/toshomango/02_mergeautoask.png)

Auto-merge will ask for confirmation first if you want to continue or not, sometimes this doesn't meet the expectation
or can't be merged automatically because the RegEx we use is different from the chapter title.

The following is the [RegEx](https://github.com/noaione/tosho-mango/blob/master/tosho/src/impl/tools/merger.rs#L18) we use to match the chapter title:

```rust [tosho/src/impl/tools/merger.rs] lineNumbers startLine=17
/// Regex to match chapter title
static TITLE_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| {
    regex::Regex::new(
        r"(?:[\w\.]+ |#|[\w]+)(?P<base>0?[\d]+)?(?:[\(-\. ][\(-\. ]?)?(?P<split>[\d]+)?(?:[\)])?", // [!code focus]
    )
    .unwrap()
});
```

### Manual Merge

If you can't or auto-merge doesn't work, you can use manual merge with the command `tosho tools merge [folder]`{lang=bash}.

![Manual Merge](https://p.ihateani.me/bohfmjbl.gif)

You have to input which chapter you want to merge, then with <kbd>Up Arrow</kbd> and <kbd>Down Arrow</kbd> to scroll, <kbd>Space</kbd> to mark the chapter, and <kbd>Enter</kbd> to save your selection.

After everything, you can then start merging the chapter.

::admonition{type="note" title="Catatan"}
If you have merged the chapter before, `tosho` will automatically
remove the merged chapter from the list of choices.

You can also see the manual merge info result in the `_info_manual_merge.json` file in the download folder.
::
