---
title: |
  Ripping: Official “Simulpub” Manga
description: |
  Mengunduh manga “simulpublish” dari berbagai macam sumber official
tags:
  - project
  - coding
image: /assets/images/toshomango/og-image.png
author: noaione
---

Mengunduh manga "_simulpublish_" dari berbagai macam sumber _official_.

<!--more-->

:repo-card{username="noaione" repo="tosho-mango"}

---

**[tosho-mango](https://github.com/noaione/tosho-mango)** atau **[tosho](https://github.com/noaione/tosho-mango)** adalah sebuah _CLI_ yang tak buat dengan bahasa pemrograman Rust untuk mengunduh manga dari berbagai macam [sumber _official_](#platforms).

## Mengapa?

Karena suka aja baca manga translasi Inggris yang _official_, jadi karena ada beberapa platform atau publisher yang mulai menggunakan sistem _CaaS (Chapter-as-a-Service)_ jadi saya buat ini biar bisa membuat _backup_ manga atau chapter yang saya beli atau baca. Karena website bisa hilang kapan saja tanpa pemberitahuan.

## Instalasi

Anda membutuhkan:

- Windows 10+, Linux, atau MacOS
- 64-bit OS
- Terminal yang support VT (PowerShell via Windows Terminal, Alacritty, Kitty, iTerm2, etc.)

Lalu, untuk menginstallnya, anda bisa menggunakan berbagai macam cara:

- Rilis _**Stable**_ via [GitHub Release](https://github.com/noaione/tosho-mango/releases)
- Rilis _**Nightly**_ via [GitHub Actions](https://github.com/noaione/tosho-mango/actions/workflows/ci.yml?query=branch%3Amaster) (atau [nightly.link](https://nightly.link/noaione/tosho-mango/workflows/ci/master?preview))
- Gunakan `cargo` dari Rust untuk menginstallnya

```bash
cargo install --locked tosho
```

Atau, gunakan [`cargo-binstall`](https://github.com/cargo-bins/cargo-binstall)

```bash
cargo binstall --locked tosho
```

Atau coba build sendiri dari source code:

1. _Clone_ repository ini: `git clone https://github.com/noaione/tosho-mango.git`{lang=bash}
2. Jalankan `cargo build --release --locked --all`{lang=bash}
3. _Binary_ akan ada di `target/release/tosho`{lang=bash} atau `.\target\release\tosho.exe`{lang=powershell}

### Platform yang didukung |#platforms|

Berikut adalah berbagai macam website yang didukung (dengan redaksi):

- [MU! oleh SQ](https://github.com/noaione/tosho-mango/tree/master/tosho_musq) (Android, Apple)
- [KM oleh KC](https://github.com/noaione/tosho-mango/tree/master/tosho_kmkc) (Android, Apple, Web)
- [AM oleh AP](https://github.com/noaione/tosho-mango/tree/master/tosho_amap) (Android)
- [SJ/M oleh V](https://github.com/noaione/tosho-mango/tree/master/tosho_sjv) (Android, Apple, Web)
- [小豆 (Red Bean) oleh KRKR](https://github.com/noaione/tosho-mango/tree/master/tosho_rbean) (Android)
- [M+ oleh S](https://github.com/noaione/tosho-mango/tree/master/tosho_mplus) (Android)

Koleksi lebih lengkap dan jelas bisa di lihat di [repositori langsung](https://github.com/noaione/tosho-mango#supported-platform)

## Penggunaan

`tosho-mango` sangat mudah untuk digunakan:

:asciinema{url="https://asciinema.org/a/636303.cast"}

Intinya, cukup jalankan `tosho` di terminal untuk mencari tau perintah yang bisa dijalankan.

### Autentikasi

Setiap platform membutuhkan autentikasi, jadi anda perlu login terlebih dahulu.<br />
Untuk melakukan login, anda bisa menggunakan basis perintah: `tosho [platform] auth`{lang=bash}.

Beberapa sumber seperti `MU!` dan `M+` membutuhkan _Network Interception_ untuk mendapatkan _token_ yang dipakai.

Di tiap sumber platform `README` akan ada cara untuk login dan interecept _token_.

- [MU! oleh SQ](https://github.com/noaione/tosho-mango/tree/master/tosho_musq#authentication)
- [KM oleh KC](https://github.com/noaione/tosho-mango/tree/master/tosho_kmkc#authentication)
- [AM oleh AP](https://github.com/noaione/tosho-mango/tree/master/tosho_amap#authentication)
- [SJ/M oleh V](https://github.com/noaione/tosho-mango/tree/master/tosho_sjv#authentication)
- [小豆 (Red Bean) oleh KRKR](https://github.com/noaione/tosho-mango/tree/master/tosho_rbean#authentication)
- [M+ oleh S](https://github.com/noaione/tosho-mango/tree/master/tosho_mplus#authentication)

## Mengunduh

Semua perintah untuk mengunduh manga ada di `tosho [platform] download [id]`{lang=powershell}.<br />
Dan, untuk melihat daftar perintah tiap platform, bisa menggunakan `tosho [platform] --help`{lang=powershell}.

![Mengunduh dengan tosho](https://p.ihateani.me/fxdvesbw.gif)

Hasil unduhan akan tersedia di `${ROOT}/DOWNLOADS/${ID}`{lang=bash}

![Hasil unduhan](/assets/images/toshomango/01_downloadfolder.png)

## Merging

Terkadang ada beberapa chapter yang di-_split_ menjadi beberapa bagian, anda bisa mengabungkan chapter tersebut menjadi satu dengan perintah `tosho tools merge [folder]`{lang=bash} atau `tosho tools automerge [folder]`{lang=bash}.

`[folder]` merupakan folder lokasi hasil unduhan yang ada fail `_info.json` di dalamnya.

![File _info.json](/assets/images/toshomango/02_mergeinfo.png)

### Auto-merge

Auto-merging merupakan fitur di mana `tosho` akan mencoba menggabungkan semua chapter terpisah menjadi satu dengan menggunakan judul chapter dan memeriksa chapter yang kemungkinan merupakan bagian dari chapter yang sama.

Berikut adalah contoh informasi chapter yang akan di-_merge_:

![Auto-merge](/assets/images/toshomango/02_mergeautoask.png)

Auto-merge akan mengkonfirmasi terlebih dahulu jika anda ingin melanjutkan atau tidak, terkadang ini tidak sesuai harapan
atau tidak bisa di-_merge_ secara otomatis karena RegEx yang dipakai oleh kita berbeda dengan judul chapter yang ada.

Berikut adalah [RegEx](https://github.com/noaione/tosho-mango/blob/master/tosho/src/impl/tools/merger.rs#L18) yang digunakan untuk mencocokkan judul chapter:

```rs [tosho/src/impl/tools/merger.rs] lineNumbers startLine=17
/// Regex to match chapter title
static TITLE_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| {
    regex::Regex::new(
        r"(?:[\w\.]+ |#|[\w]+)(?P<base>0?[\d]+)?(?:[\(-\. ][\(-\. ]?)?(?P<split>[\d]+)?(?:[\)])?", // [!code focus]
    )
    .unwrap()
});
```

### Merge Manual

Jika auto-merge tidak berhasil, anda bisa menggunakan merge manual dengan perintah `tosho tools merge [folder]`{lang=bash}.

![Merge Manual](https://p.ihateani.me/bohfmjbl.gif)

Anda harus menulis chapter mana yang ingin digabungkan, lalu dengan <kbd>Up Arrow</kbd> dan <kbd>Down Arrow</kbd> untuk scroll, <kbd>Space</kbd> untuk menandai, dan <kbd>Enter</kbd> untuk menggabungkan.

::admonition{type="note" title="Catatan"}
Jika anda telah menggabungkan chapter sebelumnya, `tosho` akan otomatis
menghilangkan chapter yang telah digabungkan dari daftar pilihan.

Anda juga bisa lihat hasil info manual merge di file `_info_manual_merge.json` di folder unduhan.
::
