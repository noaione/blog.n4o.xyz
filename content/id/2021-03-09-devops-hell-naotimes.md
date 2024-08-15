---
title: "DevOps Hell: Edisi naoTimes"
description: "Mencoba merasakan automatic-deployment untuk naoTimes"
image: "/assets/images/ci_cd_hell.png"
author: noaione
tags:
  - coding
  - devops
  - tutorial
  - devopshell
---

<div class="text-center">
  <p class="font-variable variation-slant-[-10]">Postigan ini merupakan pos pertama dari seri DevOps Hell</p>
</div>

naoTimes adalah bot Discord yang tak buat untuk tracking garapan Fansub, Bot ini juga bisa melakukan berbagai hal lain.

Seiring waktu, ada berbagai fitur private yang tidak ingin tak rilis ke public repository, akhirnya repository itu jadi tak abaikan.

## Automatic Deployment

Saya sendiri ingin bisa melakukan deploy secara otomatis karena gak enak juga mindahin file manual lalu reload cogs atau restart bot via SSH.<br />
Sampai saya ketemu Github Actions dengan nama `ssh-action`

:repo-card{username="appleboy" repo="ssh-action"}

Repo ini cukup berguna karena dengan action ini, saya bisa nge-execute skrip deploy yang saya buat untuk mempermudah urusan.<br />
Dengan ini, akhirnya saya ngebuat repository private dan menambahkan file deployment yang kurang lebih seperti ini.

```bash [deploy.sh]
#!/bin/bash
cd /opt/naoTimes_dev/

PATH=~/.nvm/versions/node/v14.15.1/bin:$PATH
echo "Polling latest commit..."
git pull
echo "Installing requirements..."
source ./env/bin/activate
pip install -r requirements.txt -U

deactivate

echo "Extracting assets..."
gunzip -d streaming_lists.json.gz -k -f
echo "Restarting pm2 process..."
pm2 --silent restart naoTimes
echo "Deployed!"
```

Stepnya adalah mengambil commit terbaru, masuk ke Virtual Environment, install requirements terbaru, extract beberapa assets lalu restart processnya via [PM2](https://pm2.keymetrics.io/).

[PM2](https://pm2.keymetrics.io/) sendiri support Python dengan venv, jadi tak gunakan karena gak nemu alternatif lain untuk sekarang.

Dengan script itu, saya cukup commit dengan teks `redeploy` dimanapun, dan script itu akan dieksekusi oleh Github Actions. 🚀

![stonks](/assets/images/naotimes-ci-cd/01_stonks.png)

Next step! Buat repo sync antara repository private dan repository public!

## Auto-sync

Coba nyari action yang cocok, tapi gak ada. Solusi rata-rata di Internet gak cocok sama use-case, akhirnya ngebuat script sendiri dan menggunakan `ssh-actions` lagi untuk execute script Python.

Scriptnya gak efisien, kalo misalkan ada file baru harus nambah manual tapi ya lebih enak dari solusi lain dan gak ribet juga nambah file baru.

**Pertama**, scriptnya akan checkout branch `rewrite` repo naoTimes, lalu pull changes.<br />
**Kedua**, scriptnya akan ngebuat branch baru dengan format: `naotimes_autosync_{timestamp in UTC}`<br />
**Ketiga**, copy semua file yang tak inginkan ke repo public<br />
**Keempat**, push ke branch autosync baru<br />
**Kelima**, checkout branch `rewrite` kembali<br />
**Keenam**, buat PR.

Setelah itu saya bisa merge PR itu secara manual.

```py [naotimes-repo-sync.py]
import os
import shutil
from datetime import datetime, timezone

import requests

allowed_files = [
    "file1"
    ...
    "another_file"
]

PR_BODY = """This PR is created via a script automation and CI.
It use the owner account to execute it, please ignore it.
"""


def create_pr(branch_name, date):
    requests.post(
        "https://api.github.com/repos/noaione/naoTimes/pulls",
        json={"head": branch_name, "base": "rewrite", "title": f"[auto-sync] {date}", "body": PR_BODY},
        headers={
            "Authorization": "token REDACTED",
            "Accept": "application/vnd.github.v3+json",
        },
    )


current_time = datetime.now(tz=timezone.utc)
strftime = current_time.strftime("%Y-%m-%d %H:%M UTC")
timestamp = int(round(current_time.timestamp()))

branch_name = f"naotimes_autosync_{timestamp}"
commit_msg = f"""[auto-sync] {strftime}

This commit is created automatically using the a custom auto-sync function
Please review the PR to merge with base.
"""


naotimes_dev = "/opt/naoTimes_dev"
naotimes_main = "/opt/ntmain"

os.chdir(naotimes_dev)
os.system("git pull")

os.chdir(naotimes_main)
os.system("git checkout rewrite")
os.system("git pull origin rewrite")
os.system(f"git checkout -b {branch_name} rewrite")

for file in allowed_files:
    from_path = os.path.join(naotimes_dev, file)
    target_path = os.path.join(naotimes_main, file)
    shutil.copy(from_path, target_path)

os.chdir(naotimes_main)
os.system("git add .")
os.system(f'git commit -am "{commit_msg}"')
os.system(f"git push origin {branch_name}")
os.system("git checkout rewrite")
create_pr(branch_name, strftime)
```

Script akan dieksekusi jika ada kata `sync-repo` di commit.

![stonks](/assets/images/naotimes-ci-cd/02_stonksmk2.png)

Dan PR-nya:

![pr sample](/assets/images/naotimes-ci-cd/03_samplepr.png)

:RushiaArmsSway: :RushiaArmsSway: :RushiaArmsSway: :RushiaArmsSway:

Semuanya bisa, sekarang gak usah ribet SSH ke server, cukup commit dengan pesan khusus untuk deploy ulang atau sync.

Productivity :rocket:
