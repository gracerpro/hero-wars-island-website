FROM nginx:alpine

RUN apk add --no-cache bash
RUN apk add --no-cache curl

WORKDIR /var/www

CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
