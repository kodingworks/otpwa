# otpwa

## Description

[otpwa](https://github.com/kodingworks/otpwa) is a ready-to-go application to build your own WhatsApp Bot in a few steps.

## Table of content

- [otpwa](#otpwa)
  - [Table of content](#table-of-content)
  - [Library](#library)
  - [Folder Structure](#folder-structure)
  - [Files that you will see frequently](#files-that-you-will-see-frequently)
  - [Documentation](#documentation)
  - [Resources](#resources)
  - [Usage](#usage)
    - [System Requirements](#system-requirements)
    - [Tools](#tools)
    - [Environment Variables](#environment-variables)
    - [Install all the dependencies](#install-all-the-dependencies)
    - [Running Development server](#running-development-server)
    - [Running it using Docker](#running-it-using-docker)
    - [Build the app](#build-the-app)
    - [Test the app](#test-the-app)
    - [How to contribute on api development](#how-to-contribute-on-api-development)
  - [License](#license)

## Library

- [NestJS](https://nestjs.com/)
- [Husky](https://github.com/typicode/husky) for configuring Git Hooks
- [Jest](https://jestjs.io/)

## Folder Structure

```
otpwa/
├── src/
│  ├── bot/                  # Source for the Bot Module/Endpoints ( `/whatsapp` )
│  │  ├── webhook/           # Source for all the webook functions, event handlers for the [Baileys Events](https://github.com/adiwajshing/Baileys#handling-events),
│  │  │
│  ├── config/               # Source for config module/endpoints ( `/config` ), this endpoint currently used for setting up the config for webhook.
│  ├── notification/         # Source for handling the notification likes sending a message to telegram or sending an email for otp.
│  ├── otp/                  # Source for handling the otp functionallity/logic like creating & verifying an otp.
│  ├── redis/                # Source for managing cache using [Redis](https://redis.io/) or [In-Memory Cache](https://docs.nestjs.com/techniques/caching#in-memory-cache).
│  ├── shared/
│  │  ├── environemnt/       # Source for managing the environtment variables along with it's type-checking with TypeScript Interfaces.
│  │  ├── filter/            # Shared TypeScript classes that used for filtering & formatting the error message based on the error codes.
│  │  ├── helper/            # Shared function that can be used anywhere, such as Token Validator, Message Replacer/Parser, etc.
│  │  ├── interface/         # Shared TypeScript interfaces that can be used in many files.
│  │  └── provider/          # Shared class or codes that used as a HTTP Response constructor for each request.
│  └── main.ts               # The entry file of the application which uses the core function NestFactory
│                              to create a Nest application instance.
├── tests/                   # Source for testing all the endpoints, functions, etc.
└── tools/                   # Scripts used to help the applicaton build process.
```

## Files that you will see frequently

```
├── *.dto.ts
├── *.controller.ts
├── *.module.ts
└── *.service.ts
```

| Name              | Description                                                                                                                                                                                                                                           | Docs                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `.dto.ts`         | Contains all the TypeScript interface or Data-Transfer Object ( DTO ) class for specifying all the fields that will be used as a request constructor or a structure which acts as a contract in our application. Dto also can be used for validation. | https://docs.nestjs.com/techniques/validation   |
| `*.controller.ts` | Controllers are responsible for handling incoming requests and returning responses to the client.                                                                                                                                                     | https://docs.nestjs.com/controllers#controllers |
| `*.module.ts`     | A module is a class annotated with a @Module() decorator. The @Module() decorator provides metadata that Nest makes use of to organize the application structure.                                                                                     | https://docs.nestjs.com/modules                 |
| `*.service.ts`    | Services are responsible for providing some data or do the business logic, which can be reused across the application.                                                                                                                                | https://docs.nestjs.com/providers#services      |

## Documentation

- [API Docs](https://documenter.getpostman.com/view/10037396/UyrBhvMx)

## Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [NestJS Modules](https://docs.nestjs.com/modules)

## Usage

### System Requirements

- [Node.js](https://nodejs.org/en/) >= 16.0.0

### Tools

- [NestJS CLI](https://docs.nestjs.com/cli/overview)

### Environment Variables

Place the environment variables ( `.env` ) at the [root directory](/) of the project.

Here's the properties

| Name   | Description                   | Required | Example |
| ------ | ----------------------------- | :------: | ------- |
| `PORT` | Your app port, default:`3000` |    ❌    | `8000`  |

-- **Todo Complete the Enviroment Variable descriptions.**

Complete example of Environment Variables :

```
NODE_ENV=local
TZ=Asia/Jakarta
PORT=3000

# App
BASE_URL=    # Base URL of the app/where the app is hosted.

# Redis
REDIS_HOST=localhost   # Default Redis Host
REDIS_PORT=6379.       # Default Redis Port
REDIS_TTL=604800       # Default 7 Days

# Encryption
ENCRYPTION_ALGORITHM=    # i.e sha256, sha512, etc.
ENCRYPTION_SECRET=

# Token
TOKEN=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

# SMTP
SMTP_HOST=
SMTP_STARTTLS_PORT=
SMTP_TLS_WRAPPER_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_IS_SECURE=
SMTP_SENDER_EMAIL=

# General
DEFAULT_OTP_TARGET_TYPE=
ENABLE_WHATSAPP_BOT=
COMPANY_NAME=
TESTING_OTPS=
TESTING_RECIPIENTS=

# Telegram Bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_MONITORING_GROUP_CHAT_ID=
TELEGRAM_GROUP_ID_WELCOME_MESSAGE=

# Webhook Configuration
DEFAULT_WEBHOOK_URL=
```

### Install all the dependencies

With [yarn](https://yarnpkg.com/) install, run

```
$ yarn install
```

### Running Development server

To run the app in development server you can run

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

Once the app is started, you can navigate to http://localhost:3000 or http://locahost:8000. The app will automatically reload if you change any of the source files on `watch mode`.

### Running it using Docker

Use the [Docker Compose](https://docs.docker.com/compose/) to run this project using Docker.

```
# Build the App first
$ docker-compose build --no-cache

# Run the app
$ docker-compose up -d
```

### Build the app

To build the project, you can run

```
$ yarn build
```

### Running Application in Production ( Built )

To build the project, you can run

```
$ yarn start:prod
```

or

```
node dist/src/main
```

The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Test the app

You can use the commands bellow in order run the test script.

#### Running unit tests

To execute the unit tests via [Jest](https://jestjs.io), run

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

#### How to contribute on api development

Let say you want to create a module called `sector` inside of the `bot` module/folder. All you need to do is :

1. Install the [NestJS CLI](https://docs.nestjs.com/cli/overview) ( this one is beneficial, rather than create all the required files one by one, you can simplify all the things by using this tools ).
2. Run `nest g resource bot/sector` & choose **REST API**.
3. It will ask you to generate CRUD entry points, answer it with `Y` ( Yes ).
4. After that the [NestJS CLI](https://docs.nestjs.com/cli/overview) will automatically update the `bot.module.ts` file & give you bunch of a new file so that you can use your new module immediately. All the new files includes :

```
├── sector
 ├── 📂dto
 │ ├── 📜create-sector.dto.ts
 │ └── 📜update-sector.dto.ts
 ├── 📂entities
 │ └── 📜sector.entity.ts
 ├── 📜sector.controller.spec.ts
 ├── 📜sector.controller.ts
 ├── 📜sector.module.ts
 ├── 📜sector.service.spec.ts
 └── 📜sector.service.ts
```

## License

otpwa is [MIT licensed](LICENSE).
