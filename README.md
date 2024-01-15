# Hero-wars island

## Docker

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

Install docker and docker-compose on host computer.

Download a sourse code.

Configure a docker-compose file...

Up a docker containers.

Install dependencies

```bash
docker exec hero-wars-website__vue npm install
```

Build

```
docker exec hero-wars-website__vue npm run build
```
