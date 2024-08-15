---
title: "Migrasi Blog ke Nuxt"
description: "Fourth-time the charm"
image: "/assets/images/blog-migration/ogthumb.png"
tags:
  - coding
author: noaione
---

<div class="text-center">
  <p class="font-variable variation-slant-[-10] text-[0.9rem] opacity-80">Gambar asli di buat saat blog ini masih menggunakan Next.js</p>
</div>

Jika anda tidak tahu, blog ini sudah melewati 3x iterasi sejak pertama kali dibuat.

Blog ini awalnya dibuat menggunakan tema Jekyll dan di hosting di GitHub.<br />
Saya sendiri lupa sih pakai tema apaan untuk Blog awal itu, tapi blog itu lumayan enak untuk dipakai.

## Blog v1

![Tampilan lama blog](/assets/images/blog-migration/blog-v1.png)

Blog itu dipakai dari 2019, dengan modifikasi oleh saya sendiri untuk nambah beberapa fitur tambahan seperti VideoJS.

Setelah itu sekitar awal tahun 2021, saya pindah atau lebih tempatnya coba-coba Hugo, nemu theme yang lumayan enak yaitu [uBlogger](https://github.com/uPagge/uBlogger).

## Blog v2

![Tampilan blog dengan uBlogger dan Hugo](/assets/images/blog-migration/blog-v2.png)

Menurut saya sendiri, uBlogger dan Hugo punya fitur yang lumayan enak. Tapi terlalu ribet untuk tak otak atik jadi gak terlalu melakukan banyak perubahan.

Perubahannya rata-rata cuma penyesuaian untuk penggunaan pribadi.

## Blog v3

![Tampilan blog dengan Next.js](/assets/images/blog-migration/blog-v3.png)

Maju ke 2021 pada bulan Mei awal-awal, saya mau coba migrasi blog lagi dari Hugo ke Next.JS atau Gatsby. Setelah panjang mencari solusi, akhirnya dapet sebuah tema yang lumayan
yaitu [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog).

Tema ini menggunakan Tailwind yang saya sendiri cukup familiar, dan karena akhir-akhir ini juga mulai belajar Next.JS dan React hidup jadi lebih mudah jika ingin buat modifikasi karena saya sendiri lumayan mengerti cara menggunakan React.

Pas awal-awal coba pake blog itu, banyak sekali fitur yang tak pakai dari web Hugo tapi tidak ada di versi ini. Salah satunya fitur i18n. Akhirnya mulailah tak rombak base codenya agar sesuai dengan yang tak butuhkan.

Jadilah blog baru ini, dibuat dengan menggunakan framework Next.JS + ReactJS dan dengan bantuan TailwindCSS.

## Blog v4

![Tampilan blog dengan Nuxt](/assets/images/blog-migration/blog-v4.png)

Dengan basis dari v3, blog saya rewrite total karena ada masalah hosting di Vercel. Akhirnya tak ubah ke Nuxt + Vue 3 karena pengen
aja gitu nyoba Nuxt Content dan lain-lain.

Website masih pake stack yang sama kurang lebih tetapi diubah dari React ke Vue dan framework dari Next.js ke Nuxt

Beberapa hal dihapus seperti:

- Laman Proyek
- Sistem upvote/downvote

Beberapa hal diubah:

- Website lebih "minimal" dengan font monospaced-sans (Monaspace Xenon)
- Beberapa font lebih dikecilkan
- Simplifikasi kode, sekarang lebih tidak ribet untuk nambah hal baru
- Simplifikasi lokalisasi, sekarang lebih mudah untuk nambah bahasa baru
- Area teks lebih lebar
- Pemindahan beberapa API ke server sendiri

Beberapa hal baru:

- _Support_ untuk penulis lebih dari satu
- Perbaikan typography/penulisan seperti _title case_ dan lain-lain
