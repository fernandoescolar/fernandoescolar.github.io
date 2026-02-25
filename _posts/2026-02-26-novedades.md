---
published: true
title: "Novedades en developerro"
author: Fernando Escolar
post_date: 2026-02-25 01:00:00
layout: post
tags: blog jekyll ia codex docker devops
background: '/assets/uploads/bg/home.png'
---

Si has entrado estos días, lo has visto: el blog ha cambiado. No "un poco". Ha cambiado en plan "¿seguro que estoy en la misma URL?".

He tocado el diseño, he recolocado cosas, he saneado páginas que llevaban demasiado tiempo viviendo en el "ya si eso".<!--break--> Y, ya que estaba metiendo las manos en el barro, también me he puesto a arreglar esas pequeñas fricciones que no se ven en una captura pero se notan cuando lo usas. Indexado de tags, navegación, estructura interna, los típicos detalles que nadie aplaude pero que si fallan te hacen cerrar la pestaña con violencia.

<img src="{{ "/assets/logos/developerro.svg" | relative_url }}" alt="developerro" width="256" height="256">

Todo esto tiene una parte estética y una parte utilitaria. La estética te da el "vale, me quedo un rato". La utilitaria te da el "vale, vuelvo mañana".

Y aquí viene lo interesante:

## La sección de actualidad

He añadido una [sección de actualidad](/news/) con noticias de tecnología que se autogenera todas las noches. No es "un RSS y ya". No es "copio y pego cuatro titulares". Es una generación automática que, cada día, crea un Markdown nuevo en el repositorio, lo commitea y lo publica.

¿La hora? A las 05:00 (hora de Madrid). Porque por algún motivo romántico pensamos que las máquinas trabajan mejor cuando nosotros estamos dormidos.

La idea es simple: si el blog ya vive en Git, y el contenido del blog son ficheros, entonces el acto de publicar noticias puede ser… exactamente lo mismo que publicar cualquier otro post. Solo que en piloto automático.

Para eso monté una tool mínima. Un contenedor. Un cron. Git. Y un CLI que habla con un modelo sin convertirlo en una conversación interminable.

## Una tool que cabe en una carpeta

Yo lo tengo así, en una carpeta tipo `news-bot/`. No hay microservicios, no hay colas, no hay "observabilidad" de 17 capas para un cron que escribe un fichero.

Lo primero que define el proyecto es la estructura, porque cuando el diseño es simple, el árbol de archivos ya te está contando la historia.

```
news-bot/
  Dockerfile
  docker-compose.yml
  entrypoint.sh
  run_daily_news.sh
  codex_prompt.txt
```

Y ahora sí: te lo dejo todo, fichero por fichero, intercalado con el porqué.

## Dockerfile: meter herramientas, no meter secretos

La imagen hace lo mínimo imprescindible. Node porque Codex CLI se instala con npm. Git porque vamos a hacer commit/push. SSH porque sin eso no hay vida. `tzdata` porque si no fijas la zona horaria acabarás publicando "noticias de mañana" hoy.

```dockerfile
FROM node:20-alpine

# System deps
RUN apk add --no-cache \
    bash \
    git \
    openssh-client \
    tzdata \
    ca-certificates \
    coreutils \
    curl

# Install Codex CLI
RUN npm i -g @openai/codex

# App files
WORKDIR /app
COPY entrypoint.sh /app/entrypoint.sh
COPY run_daily_news.sh /app/run_daily_news.sh
COPY codex_prompt.txt /app/codex_prompt.txt

# Default timezone
ENV TZ=Europe/Madrid


USER bot
RUN chmod +x /app/entrypoint.sh /app/run_daily_news.sh

# Workspace paths (you will mount /workspace from host)
ENV WORKSPACE=/workspace
ENV REPO_DIR=/workspace/fernandoescolar.github.io

ENTRYPOINT ["/app/entrypoint.sh"]
```

Fíjate en lo que no está aquí: credenciales. Ni la API key ni la SSH key van dentro de la imagen. Eso se monta desde fuera. La imagen tiene que ser portable. Los secretos, no.

## docker-compose.yml: persistencia y variables sin drama

El compose hace dos cosas prácticas. Monta un workspace persistente (para la clave y para el repo clonado), y persiste el home de Codex CLI porque estos CLIs suelen cachear configuración y no quieres que cada arranque sea "hola, soy nuevo, ¿quién eres?".

```yaml
services:
  news-bot:
    build: .
    container_name: news-bot
    environment:
      - TZ=Europe/Madrid
      - WORKSPACE=/workspace
      - REPO_DIR=/workspace/xxxxxxxx.github.io
      - CODEX_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      # Opcional: forzar modelo
      # - CODEX_MODEL=gpt-5-codex
    volumes:
      # Monta un workspace persistente (aquí debes tener .ssh o .shh)
      - ./workspace:/workspace
      # Persiste config/cache del CLI (muy recomendado)
      - ./codex_home:/root
    restart: unless-stopped
```

Sí, `CODEX_API_KEY` entra por variable de entorno. Y sí, eso significa que el secreto está en tu `.env` local. Que es exactamente donde quiero que esté. En tu máquina, no en el Dockerfile, y desde luego no en Git.

## entrypoint.sh: cron dentro del contenedor, y crond en primer plano

Aquí está uno de los puntos donde la gente suele tropezar. Si pones cron dentro del contenedor, tienes que mantener `crond` en primer plano. Si no, el contenedor termina y tu automatización muere sin avisar, como una planta que "no necesitaba tanta agua".

Este entrypoint crea el crontab de root y arranca `crond -f`.

```bash
#!/usr/bin/env bash
set -euo pipefail

export TZ="${TZ:-Europe/Madrid}"
echo "[entrypoint] TZ=$TZ"

# Ensure cron is available (busybox crond in alpine)
# Create crontab: every day at 05:00 run the job
CRON_FILE="/etc/crontabs/root"
mkdir -p /etc/crontabs

cat > "${CRON_FILE}" <<'EOF'
# m h dom mon dow command
0 5 * * * /app/run_daily_news.sh >> /workspace/news_bot.log 2>&1
EOF

echo "[entrypoint] Installed cron:"
cat "${CRON_FILE}"

# Optional: run once at container start if desired (disabled by default)
# /app/run_daily_news.sh || true

echo "[entrypoint] Starting crond in foreground..."
crond -f -l 8
```

Hay una decisión pequeña pero útil: los logs van a `/workspace/news_bot.log`. Eso vive fuera del contenedor. Si algo falla, queda rastro aunque reinicies.

## codex_prompt.txt: el "programa" real

Aquí es donde se decide si esto genera algo publicable o un collage de humo.

Yo lo forcé a responder solo con Markdown final. Sin explicaciones. Sin texto extra. Sin "claro, aquí tienes…". Porque cualquier palabra fuera del fichero rompe Jekyll y te obliga a meter un post-procesado tonto que, sorpresa, también se rompe.

```text
Necesito que generes el CONTENIDO COMPLETO de un archivo Markdown para una web Jekyll.

Requisitos:
- Responde SOLO con el Markdown final (sin explicaciones, sin texto extra, sin bloques de código).
- Debe incluir el frontmatter YAML y después las noticias.
- Idioma: español.
- Usa búsqueda web (si está disponible) para encontrar novedades de las últimas 24–72h.

Temas:
- .NET (C#), ASP.NET, Blazor, EF Core
- AI/ML (LLMs, RAG, agentes, tooling)
- Azure y GCP
- Go (Golang)
- Docker, Kubernetes, cloud-native
- Hardware doméstico homelab: NAS, mini-PCs, GPUs/NPUs para IA local, redes, almacenamiento, UPS, etc.

Cantidad:
- Entre 6 y 12 noticias.
- Evita duplicados: si la misma noticia está en varias fuentes, elige la fuente más oficial o completa.

Formato (OBLIGATORIO):
---
published: true
title: 'Noticias del {fecha en formato "lunes 1 de mayo de 2025"}'
author: bot
post_date: yyyy-MM-dd HH:mm:ss
layout: news
tags: golang csharp proxy
---

## noticia 1
{resumen 2-5 líneas}
{link}

## noticia 2
{resumen 2-5 líneas}
{link}

...

Reglas:
- Cada noticia debe tener un título corto y descriptivo tras "##".
- El link debe ir en una línea separada debajo del resumen.
- No inventes versiones, fechas ni claims. Si no aparece en la fuente, no lo afirmes.
- Orden sugerido: primero Cloud/Dev, luego homelab.
```

Ese "no inventes" parece redundante hasta que te acuerdas de que esto corre cada noche sin que tú lo leas antes. En sistemas automáticos, la redundancia no es un defecto. Es una barandilla.

## run_daily_news.sh: Git + generación + commit, con SSH sin llantos

Este es el músculo. Hace clone/pull. Genera el fichero del día en `_news`. Luego commit y push.

La parte más delicada es SSH: yo busco la clave en `workspace/.ssh/id_rsa` o en `workspace/.shh/id_rsa` (sí, existe porque la vida real existe). Luego la copio a `/tmp` para asegurar permisos sin pelearme con mounts de solo lectura. Y fijo `GIT_SSH_COMMAND` para que Git use esa identidad y un `known_hosts` controlado.

```bash
#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
WORKSPACE="${WORKSPACE:-/workspace}"
REPO_DIR="${WORKSPACE}/xxxxxxxx.github.io"
REMOTE_SSH="git@github.com:xxxxxxxx/xxxxxxxx.github.io.git"

CODEX_MODEL="${CODEX_MODEL:-}"
PROMPT_FILE="${WORKSPACE}/codex_prompt.txt"

# Date/time
DATE_YYYY_MM_DD="$(date +%F)"                 # yyyy-MM-dd
NOW_TS="$(date '+%F %T')"                     # yyyy-MM-dd HH:mm:ss

echo "[job] Starting daily news job at ${NOW_TS}"
echo "[job] WORKSPACE=${WORKSPACE}"
echo "[job] REPO_DIR=${REPO_DIR}"
echo "[job] DATE=${DATE_YYYY_MM_DD}"

# --- SSH key discovery (.ssh or .shh) ---
SSH_KEY=""
if [[ -f "${WORKSPACE}/.ssh/id_rsa" ]]; then
  SSH_KEY="${WORKSPACE}/.ssh/id_rsa"
else
  echo "[error] No SSH key found at ${WORKSPACE}/.ssh/id_rsa or ${WORKSPACE}/.shh/id_rsa"
  exit 1
fi

echo "[job] Using SSH key: ${SSH_KEY}"

# Prepare a writable SSH dir for known_hosts (avoid writing into mounted key dir if read-only)
RUNTIME_SSH_DIR="/tmp/ssh"
mkdir -p "${RUNTIME_SSH_DIR}"
chmod 700 "${RUNTIME_SSH_DIR}"

# Copy key (so we can chmod safely even if mount is read-only)
cp "${SSH_KEY}" "${RUNTIME_SSH_DIR}/id_rsa"
chmod 600 "${RUNTIME_SSH_DIR}/id_rsa"

# known_hosts
ssh-keyscan -t rsa github.com >> "${RUNTIME_SSH_DIR}/known_hosts" 2>/dev/null || true
chmod 600 "${RUNTIME_SSH_DIR}/known_hosts"

export GIT_SSH_COMMAND="ssh -i ${RUNTIME_SSH_DIR}/id_rsa -o IdentitiesOnly=yes -o UserKnownHostsFile=${RUNTIME_SSH_DIR}/known_hosts -o StrictHostKeyChecking=yes"

# --- Clone if needed ---
if [[ ! -d "${REPO_DIR}/.git" ]]; then
  echo "[job] Repo not found, cloning..."
  mkdir -p "$(dirname "${REPO_DIR}")"
  git clone "${REMOTE_SSH}" "${REPO_DIR}"
fi

cd "${REPO_DIR}"

# --- Pull latest ---
echo "[job] git pull"
git pull

# --- Generate markdown with Codex ---
NEWS_DIR="${REPO_DIR}/_news"
mkdir -p "${NEWS_DIR}"
OUT_FILE="${NEWS_DIR}/${DATE_YYYY_MM_DD}.md"
TMP_OUT="/tmp/${DATE_YYYY_MM_DD}.md"

echo "[job] Generating Markdown via Codex -> ${OUT_FILE}"

# Build codex command args
CODEX_ARGS=(--search exec --full-auto --output-last-message "${TMP_OUT}")

if [[ -n "${CODEX_MODEL}" ]]; then
  CODEX_ARGS+=(--model "${CODEX_MODEL}")
fi

# Feed the prompt content + a tiny dynamic context for timestamps
PROMPT="$(cat "${PROMPT_FILE}")

Contexto adicional para este run:
- Fecha de hoy (yyyy-MM-dd): ${DATE_YYYY_MM_DD}
- post_date debe ser exactamente: ${NOW_TS}
- El título debe usar la fecha humana en español (por ejemplo: \"martes 25 de febrero de 2026\").
"

# Run codex
codex "${CODEX_ARGS[@]}" "${PROMPT}"

if [[ ! -s "${TMP_OUT}" ]]; then
  echo "[error] Codex produced empty output at ${TMP_OUT}"
  exit 1
fi

# Write to repo
mv "${TMP_OUT}" "${OUT_FILE}"

# --- Commit & push ---
git add "${OUT_FILE}"

if git diff --cached --quiet; then
  echo "[job] No changes to commit."
  exit 0
fi

COMMIT_MSG="noticias del día ${DATE_YYYY_MM_DD}"
echo "[job] git commit -m \"${COMMIT_MSG}\""
git config user.email "bot@developerro.com"
git config user.name "developerro_bot"
git commit -m "${COMMIT_MSG}"

echo "[job] git push"
git push

echo "[job] Done. Wrote: ${OUT_FILE}"
```

Aquí el detalle importante es cómo llamo a Codex: `--search` para que tenga capacidad de buscar fuentes, `--full-auto` y `--output-last-message` para que no haya interacción y lo que quede en el fichero sea exactamente el Markdown final.

Si algo falla, prefiero que falle fuerte (`set -euo pipefail`) y lo vea en logs. Los "fallos silenciosos" son el deporte nacional de la automatización.

## Lo que se gana y lo que se controla

La gracia de todo esto no es "mira, una IA escribe". La gracia es que el blog ahora puede tener una parte viva sin que yo esté cada día ejecutando tareas mecánicas.

Pero también hay un límite claro. La actualidad puede automatizarse porque es repetitiva y estructurada. El criterio editorial no. Ese sigue siendo manual, porque si lo automatizas también, entonces ya no tienes un blog. Tienes una fábrica. Y yo no quería montar una fábrica.

Quería dormir. Y levantarme con un commit.


