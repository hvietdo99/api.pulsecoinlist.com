# api.pulsecoinlist.com

This README would normally document whatever steps are necessary to get your application up and running.

## Description

Describe what this service does.

## Dependencies

* Nodejs v14.17.0
* NPM v6.14.10
* PM2 v4.4.0
* Husky v4.3.8

## Installation

* Run the below commands:

```bash
yarn
```

## Running the app

* Run the below commands:

```bash
yarn build
```

## Generate api classes

* Run the below commands:

```bash
./node_modules/.bin/swagger-typescript-api -p ./output-specs/api.pulsecoinlist.com.json -o ./output-specs/ -n api.pulsecoinlist.com.ts --axios --responses --module-name-index 2
```