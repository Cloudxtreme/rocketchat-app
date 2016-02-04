FROM cloudron/base:0.8.0
MAINTAINER Johannes Zellner <johannes@cloudron.io>

EXPOSE 3000

ENV PATH /usr/local/node-0.10.40/bin:$PATH

RUN mkdir -p /app/code
WORKDIR /app/code

RUN npm install nave -g
RUN nave usemain 0.10

RUN curl https://install.meteor.com/ | sh

RUN curl -fSL "https://github.com/RocketChat/Rocket.Chat/archive/0.16.0.tar.gz" -o rocket.chat.tgz \
&&  tar zxvf ./rocket.chat.tgz --strip 1\
&&  rm ./rocket.chat.tgz
RUN sed -e "s/+ ' (LDAP)'//" -i /app/code/packages/rocketchat-ui-login/login/form.coffee
RUN meteor build --server "localhost" --directory .
RUN cd ./bundle/programs/server && npm install

RUN mkdir -p /var/www/rocket.chat/ && ln -s /app/data/www /var/www/rocket.chat/

ADD start.sh /app/code/start.sh

CMD [ "/app/code/start.sh" ]
