---
title: "Encoding: Descaling"
description: "Resizing ❌ | Descaling ✔"
lastmod: 2021-01-19T13:41:00+07:00
author: noaione
tags:
  - fansub
  - encoding
  - tutorial
---

_insert generic intro here_

<!--more-->

Yang dibutuhin:

- Mata
- PC & Monitor
- Vapoursynth dan segalanyas
- x264

Silakan ikuti langkah instalasi Vapoursynth berikut terlebih dahulu:

:gist{id="6f8583c32a8f23e367688ebac0c9d0e0"}

## Intro

Resizing Anime sama Descaling Anime menghasilkan hal yang berbeda, Descaling menggunakan algoritma lain agar
Anime dapat dikembalikan ke resolusi asli (Native Resolution).

Ada beberapa macam kernel yang dipakai sama Web streaming, atau studio animasinya.

Kernel yang sering dipakai biasanya Bicubic (1/3 1/3) untuk upscale Anime dari resolusi asli.

Untuk permulaan, buatlah file baru dan tambah kode seperti ini (Ekstensi file: `.vpy`)

```py [manaria01_descale.vpy] lineNumbers
import vapoursynth as vs
from vapoursynth import core

import fvsfunc as fvf
import descale
import MaskDetail as maskD
```

![Import script ke file manaria01_descale.vpy](/assets/images/descale1.png)

Selanjutnya import video yang ada dan buat outputnya dan coba klik `F5`

```py [manaria01_descale.vpy] {8-11} lineNumbers
import vapoursynth as vs
from vapoursynth import core

import fvsfunc as fvf
import descale
import MaskDetail as maskD

src = core.ffms2.Source('Manaria Friends - 01v2 (AbemaTV 1080p).mkv')
src = fvf.Depth(src, 16)

src.set_output()
```

![Import video (src) + dithering ke 16bit](/assets/images/descale2.png)
![Output dari frameserver (F5)](/assets/images/descale3.png)

Itu basic dari importing video dan sebagainya, sekarang kita mulai mencoba descaling.

## Descaling: For real

Video yang tak gunakan merupakan Manaria Friends, resolusi aslinya jika nggak salah itu 810p, jadi sekarang kita coba descale ke 810p.

```py [manaria01_descale.vpy] {11} lineNumbers startLine=10
import vapoursynth as vs
from vapoursynth import core

import fvsfunc as fvf
import descale
import MaskDetail as maskD

src = core.ffms2.Source('Manaria Friends - 01v2 (AbemaTV 1080p).mkv')
src = fvf.Depth(src, 16)

v = descale.Debicubic(src, width=1440, height=810, b=1/3, c=1/3, yuv444=True)

v.set_output()
```

![Source 1080p](/assets/images/manaria01-1080p.png)
![Descaled 810p](/assets/images/manaria01-810p.png)

Silakan gambarnya di buka di Tab baru agar lebih enak.

Selesai sudah, cukup segitu aja kalo emang cuma mau descaling video, gak ribet gak lama karena dah ada orang yang buat script descaling gini biar mempermudah orang lain.

Tapi kadang descaling gak bekerja dengan baik karena studio animasi suka nempel 1080p overlay (teks credit, dsb.) ke resolusi aslinya, jadi semua overlay 1080p pasti ancur.

![Zoom in ke teks jepang, bisa diliat ada artifact halo/ringing](/assets/images/manaria01-810pbroken.png)

Ada satu cara menghilangkannya, yaitu pake **MaskDetail**.

**MaskDetail** akan ngebuat mask pada teks credit dan sebagainya agar teks credit itu bisa menggunakan resizer biasa dibanding descaler agar tidak ada artifact

```py [manaria01_descale.vpy] {12} lineNumbers
import vapoursynth as vs
from vapoursynth import core

import fvsfunc as fvf
import descale
import MaskDetail as maskD

src = core.ffms2.Source('Manaria Friends - 01v2 (AbemaTV 1080p).mkv')
src = fvf.Depth(src, 16)

v = descale.Debicubic(src, width=1440, height=810, b=1/3, c=1/3, yuv444=True) # Descaler
mask = maskD.maskDetail(src, 1440, 810, kernel='bicubic')
resizer = core.resize.Bicubic(src, width=1440, height=810, format=vs.YUV444P16) # Resizer, silakan ganti YUV444P16 menjadi YUV420P16 jika `yuv444=False`

mask.set_output()
```

![Hasil mask](/assets/images/manaria01-810pmask.png)

## Penutup

Selamat! sekarang anda tinggal encode dan nikmati hasilnya \:D

**Anime yang digunakan**: Manaria Friends - 01<br />
**Source**: AbemaTV

