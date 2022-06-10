FROM node:16-alpine3.15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY tsconfig.json tsconfig.build.json yarn.lock nest-cli.json package*.json ./

RUN apk add --no-cache git
RUN npm install yarn -g --force
RUN yarn install
# If you are building your code for production
RUN yarn build

# Bundle app source
COPY . .

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon:
EXPOSE 3000

# Last but not least, define the command to run your app using CMD which defines your runtime. Here we will use node server.js to start your server:
CMD [ "node", "dist/main"]
