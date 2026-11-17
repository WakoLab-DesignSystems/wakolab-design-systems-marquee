# Acceptance with Docker only (temporary procedure)

**What this is.** A temporary procedure for reviewing one exact commit of Marquee on a machine that has Docker but **neither Node.js nor a Marquee clone** on the host. Everything (clone, Node 24, install, build, server, checks) happens inside a disposable container.

**What this is not.** It is **not the maintained Docker kit**. The kit (a versioned Dockerfile or image, documented start and stop, and support across releases) is a later batch of [#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-marquee/issues/1). This page may change or disappear when the kit lands; do not build tooling on it.

## Requirements

- Docker on the host, with access to Docker Hub (`node:24`) and github.com.
- Port 5192 free on the host's loopback interface.
- The exact commit to review, as a full 40-character SHA (given in the review request). Nothing below uses a branch name.

Set it once in the host shell (bash):

```bash
export MARQUEE_SHA=<full-40-character-sha>
```

## 1. Demo: clone, build and serve inside one container

```bash
docker run -d --rm --name marquee-acceptance -p 127.0.0.1:5192:5192 -e MARQUEE_SHA node:24 bash -c 'set -e; git clone --quiet https://github.com/WakoLab-DesignSystems/wakolab-design-systems-marquee.git /work; cd /work; git checkout --quiet --detach "$MARQUEE_SHA"; test "$(git rev-parse HEAD)" = "$MARQUEE_SHA"; echo "reviewing $(git rev-parse HEAD) with node $(node --version)"; npm ci; exec npx vite --config examples/vite.config.ts --host 0.0.0.0'
```

- `npm ci` installs the locked dependencies and builds `dist/` through `prepare`.
- `--host 0.0.0.0` lets the published port reach the server inside the container; the host only exposes it on `127.0.0.1`.
- Follow the start-up until Vite prints its address:

```bash
docker logs -f marquee-acceptance
```

Then open `http://127.0.0.1:5192/demo/` in a browser on the host. The first log line states the commit and Node version actually used.

**Stop (targeted).** This stops and removes only that container (it was started with `--rm`):

```bash
docker stop marquee-acceptance
```

## 2. Checks: the same commit in a one-shot container

```bash
docker run --rm --name marquee-checks -e MARQUEE_SHA node:24 bash -c 'set -e; git clone --quiet https://github.com/WakoLab-DesignSystems/wakolab-design-systems-marquee.git /work; cd /work; git checkout --quiet --detach "$MARQUEE_SHA"; test "$(git rev-parse HEAD)" = "$MARQUEE_SHA"; echo "checking $(git rev-parse HEAD) with node $(node --version)"; npm ci; npx playwright install --with-deps chromium; npm run check; npm test'
```

- `npx playwright install --with-deps chromium` downloads the Chromium build that matches the locked Playwright version, with its system libraries, inside the container only.
- `npm test` runs the package checks and the three Playwright suites (see the README's *Checks*). The container exits when they finish and is removed; nothing remains on the host.
- If it must be interrupted, stop only this container:

```bash
docker stop marquee-checks
```

The external-consumer check (`npm run consumer`) and the parity run (`npm run parity`, which needs a separate frontend checkout) are not part of this procedure.

## Inspected or executed

This page lists commands; the review report states, for the reviewed SHA, which of them were **executed** (and where) and which were only **inspected**. A command only described here has not been run unless the report says so.
