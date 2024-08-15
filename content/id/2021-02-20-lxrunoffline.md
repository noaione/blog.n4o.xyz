---
title: "WSL dengan LxRunOffline"
description: "Instalasi WSL dengan menggunakan LxRunOffline"
image: "/assets/images/lxrunoffline/thumb.png"
author: noaione
tags:
  - tutorial
  - coding
---

_Ditulis sebagai tambahan untuk postingan Bootcamp_

::admonition{type="warning" title="Notice"}
Diperuntukan bagi yang tidak bisa install WSL melalui Microsoft Store.
::

Sebelum mulai, mohon aktifkan `Windows Subsystem for Linux` terlebih dahulu dengan cara:

1. Buka PowerShell dengan hak administrator
2. Ketik:

```ps
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

Lalu restart komputer anda.

## Instalasi

Mari download program LxRunOffline: [GitHub](https://github.com/DDoSolitary/LxRunOffline/releases)<br />
Pilih `-mingw` lalu extract.

Setelah diextract, pindahkan file `LxRunOffline.exe` ke `C:\WINDOWS`

Setelah itu, buka CMD/PowerShell dengan hak admin, dan ketik:

```bat
lxrunoffline version
```

Jika muncul kurang lebih gini:

```
LxRunOffline v3.5.0
```

Berarti LxRunOffline telah sukses diinstall.

![LxRunOffline terinstall](https://p.ihateani.me/wrdylxlm.png)

---

Selanjutnya mari kita install Ubuntu 20.04!<br />
Klik link berikut untuk mengunduh Imagenya: [Ubuntu 20.04](https://lxrunoffline.apphb.com/download/ubuntu/focal)

Harusnya akan mulai mengunduh file `ubuntu-focal-core-cloudimg-amd64-root.tar.gz`

Jika sudah, buat folder `WSL` atau apapun namanya di drive selain `C` kalau bisa, setelah itu pindahkan file `.tar.gz` tadi ke folder tersebut<br />
Misalkan kita akan pakai folder di drive `D` dengan nama `WSLInstall`

Buka PowerShell Administrator, lalu ketik command berikut

```ps
LxRunOffline install -n Ubuntu -d D:\WSLInstall" -f D:\WSLInstall\ubuntu-focal-core-cloudimg-amd64-root.tar.gz
```

`D:\WSLInstall` merupakan folder yang dibuat tadi.<br />
`D:\WSLInstall\ubuntu-focal-core-cloudimg-amd64-root.tar.gz` merupakan file yang di download tadi.

Masih di PowerShell Admin, ketik:

```ps
lxrunoffline sd -n Ubuntu
```

Setelah itu cukup ketik: `wsl` untuk masuk ke WSL

## Setup

Ketika sudah masuk di WSL, harusnya kita jalan sebagai `root`, kita akan buat user pribadi agar lebih aman.

Setelah kita ketik `wsl`, ketik semua command ini

```sh
apt-get update && apt-get install sudo -y
useradd --create-home -d /home/USERNAME_YANG_SITU_MAU USERNAME_YANG_SITU_MAU
passwd USERNAME_YANG_SITU_MAU
usermod -aG sudo USERNAME_YANG_SITU_MAU
```

`USERNAME_YANG_SITU_MAU` merupakan username yang situ inginkan

::admonition{type="info" title="Ketika ketik password tidak muncul?"}
Normal, di Linux ketika kita ketik password tidak akan muncul apa-apa tetapi tetap terketik.
::

Jika sudah, ketik:

```sh
sh - USERNAME_YANG_SITU_MAU
```

Ini akan masuk ke user situ, ketik `bash` untuk menggunakan Shell Bash

### Atur Default User

Di user anda, ketik:

```sh
echo $UID
```

Untuk mendapatkan User ID anda, simpan di notepad atau semacamnya.

Sekarang keluar dari WSL dengan cara ketik `exit` sampai kembali ke Powershell

Setelah itu, ketik hal berikut:

```ps
lxrunoffline su -n Ubuntu -v UID
```

`UID` merupakan User ID yang disimpan tadi.

Kembali lagi ke WSL dengan ketik `wsl` lalu ketik:

```sh
chsh -s /bin/bash
```

Jika tidak muncul apa-apa, abaikan saja.

Keluar dari WSL dengan ketik `exit` sampai balik ke Powershell, lalu ketik `wsl` kembali.<br />
Seharusnya akan muncul kurang lebih seperti ini:

```sh
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

username@DESKTOP_NAME:/mnt/c/Windows/system32$
```

WSL telah siap dipakai!

## Ada error?

Jika muncul error ini

```bash
bash: cannot create temp file for here-document: Permission denied
```

Pastikan folder WSL yang dibuat ada akses yang sesuai, cara aturnya adalah:

1. Klik kanan folder WSL [contoh diatas pake D:\WSLInstall]
2. Klik Security
3. Klik Edit
4. Klik Add
5. Di kolom teks, ketik: Everyone
6. Klik Check Names, terus Ok
7. Di kolom Allow, centang Full Control
8. Klik Apply, terus Ok

![Permission Fix](https://p.ihateani.me/kqvujoqr.gif)

