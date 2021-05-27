FROM nginx:1.16.1-alpine
USER root
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update && apk upgrade && apk add bash && apk add bash-doc && apk add bash-completion && bash
COPY ./config/nginx.default.conf /etc/nginx/conf.d/default.conf
COPY dist/ /app
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod -R 777 /app/entrypoint.sh
WORKDIR /app
ENTRYPOINT ["./entrypoint.sh"]