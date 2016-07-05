FROM cloudron/base:0.8.1
MAINTAINER Johannes Zellner <johannes@cloudron.io>

EXPOSE 3000

ENV PATH /usr/local/node-0.10.40/bin:$PATH

RUN apt-get update && apt-get install -y graphicsmagick && rm -r /var/cache/apt /var/lib/apt/lists

RUN mkdir -p /app/code
WORKDIR /app/code

RUN curl -SLf "https://rocket.chat/releases/0.29.0/download" | tar -zxf - -C /app/code \
  && cd /app/code/bundle/programs/server \
  && npm install \
  && npm cache clear

# For some reason, setting BABEL_CACHE_PATH env var doesn't work
RUN ln -s /run/rocket.chat/babel-cache /home/cloudron/.babel-cache

ADD start.sh /app/code/start.sh

CMD [ "/app/code/start.sh" ]
