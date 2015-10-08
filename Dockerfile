FROM cloudron/base:0.4.0

# install meteor
RUN curl https://install.meteor.com | /bin/sh

RUN mkdir -p /app/code /app/bundle

# get the codes and build into /app/bundle
# it's important to keep the build in a single command (https://groups.google.com/forum/#!topic/meteor-talk/_WFeZUZQCqY)
WORKDIR /app/code
RUN curl -L https://github.com/RocketChat/Rocket.Chat/archive/master.tar.gz | tar -xz --strip-components 1 -f - && \
    meteor build --directory /app/build --server=http://localhost:3000 && \
    cd /app/build/bundle/programs/server && \
    npm install && \
    mv /app/build/bundle /app && \
    rm -rf /app/build

ADD start.sh /app/code/start.sh

ENV PORT 3000
EXPOSE 3000

CMD [ "/app/code/start.sh" ]
