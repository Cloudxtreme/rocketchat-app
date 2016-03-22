FROM cloudron/base:0.8.0
MAINTAINER Johannes Zellner <johannes@cloudron.io>

EXPOSE 3000

ENV PATH /usr/local/node-0.10.40/bin:$PATH

RUN apt-get update && apt-get install -y graphicsmagick && rm -r /var/cache/apt /var/lib/apt/lists

RUN mkdir -p /app/code
WORKDIR /app/code

RUN curl -SLf "https://rocket.chat/releases/0.23.0/download" | tar -zxf - -C /app/code \
  && cd /app/code/bundle/programs/server \
  && npm install \
  && npm cache clear

ADD start.sh /app/code/start.sh

CMD [ "/app/code/start.sh" ]
