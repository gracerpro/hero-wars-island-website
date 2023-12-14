# Hero-wars website

## Как запускать

Для поднятия контейнеров

```bash
docker-compose up --detach
docker-compose up --detach --build --force-recreate
```

Для выполнения команды, без захода в контейнер

```
docker exec [контейнер] [команда]
docker exec hero-wars-website__vue npm run build
docker exec hero-wars-website__vue npm run lint --fix
```

Для захода в **vue** контейнер

```bash
docker exec -it --user "$(id -u):$(id -g)" hero-wars__vue bash
```

## Project setup

Добавить в `/etc/hosts` на хостовом компьютере.

127.0.0.1 hero-wars.vyacheslaff.local

Скачать проект на компьютер. Установить зависимости

```bash
docker exec hero-wars__vue npm install
```
