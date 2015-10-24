FROM cloudron/base:0.7.0
MAINTAINER Johannes Zellner <johannes@cloudron.io>

EXPOSE 3000

ENV PATH /usr/local/node-0.10.40/bin:$PATH

RUN mkdir -p /app/code
WORKDIR /app/code

RUN curl -fSL "https://s3.amazonaws.com/rocketchatbuild/rocket.chat-v.latest.tgz" -o rocket.chat.tgz \
&&  tar zxvf ./rocket.chat.tgz \
&&  rm ./rocket.chat.tgz  \
&&  cd /app/code/bundle/programs/server \
&&  npm install

RUN ln -s /app/data/www /var/www/rocket.chat/

ADD start.sh /app/code/start.sh

CMD [ "/app/code/start.sh" ]
