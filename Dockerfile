FROM cloudron/base:0.4.0

# install meteor
RUN curl https://install.meteor.com | /bin/sh

RUN mkdir -p /app/code /app/bundle

# get the codes and build into /app/bundle
# it's important to keep the build in a single command (https://groups.google.com/forum/#!topic/meteor-talk/_WFeZUZQCqY)
WORKDIR /app/code

# Replace shell with bash so we can source files (required for nvm)
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV NVM_DIR /usr/local/nvm

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install v0.10.40 \
    && nvm use v0.10.40

ENV PATH $NVM_DIR/v0.10.40/bin:$PATH

RUN curl -L https://github.com/RocketChat/Rocket.Chat/archive/v0.5.0.tar.gz | tar -xz --strip-components 1 -f - && \
    meteor build --directory /app/build --server=http://localhost:3000 && \
    cd /app/build/bundle/programs/server && \
    npm install && \
    mv /app/build/bundle /app && \
    rm -rf /app/build

ADD start.sh /app/code/start.sh

ENV PORT 3000
EXPOSE 3000

CMD [ "/app/code/start.sh" ]
