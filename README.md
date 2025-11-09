# Hero-wars island

## Project setup

Add to `/etc/hosts` file on host computer this text

```txt
127.0.0.1 hero-wars.local
```

[Install docker](https://docs.docker.com/engine/install/)
and
[docker-compose](https://docs.docker.com/compose/install/) on host computer.

Download the source code

```bash
git clone git@github.com:gracerpro/hero-wars-island-website.git
```

Copy `docker-compose.dist.yml` into `docker-compose.yml` and configure it. Change a port 8082 etc.

Configre an environments by `.env` file.

TODO: For variable VITE_BACKEND_API_URL need a backend server, mock all client methods.

Up the docker containers

```bash
docker-compose up --detach --build --force-recreate
```

Install the dependencies

```bash
docker exec hero-wars-website__node npm install
```

And run the dev server

```bash
docker exec hero-wars-website__node npm run dev
```

Go to `http://hero-wars.local:8082`

The end.

## Build the release

Get commits history

```bash
git log --since=2025-11-09 --pretty=format:"%cD %s"
```

Run some commands

```bash
npm run format
npm run lint
npm run test

npm run build
```

## Deploy

```bash
npm run generate
```

build the `swagger.json` and move it to `/dist/static/backend-api`

copy `dist/static/*` to `/public` on server

## Debug SSG

todo

build static files `dist/static`

```bash
./node_modules/.bin/vite build --outDir dist/static --ssrManifest .vite/ssr-manifest.json
```

```bash
NODE_ENV=production ./node_modules/.bin/ts-node --project tsconfig.ssg.json prerender.ts --clean=0
```

## Quick hints

```bash
# Up the containers
docker compose up --detach
docker compose up --detach --build --force-recreate

# Log in to the container
docker exec -it hero-wars-website__node bash
npm run dev

# Run a command, without log in to the container
docker exec hero-wars-website__node npm run lint
docker exec hero-wars-website__node npm run format
```
