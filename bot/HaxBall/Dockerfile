# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:16

# Set variables
ARG ROOM=room
ARG USER=node
ARG TASK=prod

ENV TOKEN=${TOKEN}
ENV TASK=${TASK}

# Set working directory
WORKDIR /home/$ROOM

RUN chown -R ${USER}:${USER} /home/$ROOM

## Install dependencies
## A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=${USER}:${USER} package*.json ./

RUN npm install -g node-pre-gyp
RUN npm install -g grunt-cli

## Set non-root user
USER ${USER}

RUN mkdir -p node_modules

RUN npm install

# Copy the source files
COPY --chown=${USER}:${USER} . .

RUN chmod +x start.sh

# Open the room
ENTRYPOINT ./start.sh $TASK
