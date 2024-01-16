# Hero-wars island

## Quick hints

Up the containers

```bash
docker-compose up --detach
docker-compose up --detach --build --force-recreate
```

Run a command, without log in to the container

```
docker exec [container] [command]
docker exec hero-wars-website__vue npm run build
docker exec hero-wars-website__vue npm run lint --fix
```

Log in to the container

```bash
docker exec -it --user "$(id -u):$(id -g)" hero-wars-website__vue bash
```

## Project setup

Add to `/etc/hosts` file on host computer this text

```
127.0.0.1 hero-wars.vyacheslaff.local
```

[Install docker](https://docs.docker.com/engine/install/)
and
[docker-compose](https://docs.docker.com/compose/install/) on host computer.

Download the source code

```
git clone git@github.com:gracerpro/hero-wars-island-website.git
```

Copy `docker-compose.dist.yml` into `docker-compose.yml` and configure it. Change a port 8082 etc.

Configre an environments by `.env` file.
TODO: for variable VUE_APP_BACKEND_API_URL need backend server, mock all client methods.

Up the docker containers

```
docker-compose up --detach --build --force-recreate
```

Install the dependencies

```bash
docker exec hero-wars-website__vue npm install
```

And build

```
docker exec hero-wars-website__vue npm run build
```

Go to `http://hero-wars.vyacheslaff.local:8082`

The end.
