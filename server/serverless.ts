/* eslint-disable guard-for-in,no-restricted-syntax */
import type { AWS } from "@serverless/typescript"
import { readdirSync } from "fs"
import { resolve } from "path"

import env from "./env"

const SERVICE_NAME = "raise-server"
const STAGE = "dev"

const allowedMethods = ["get", "post", "patch", "put", "delete"]

const envCase = (s: string): string => s.replace(/[/_\- ]+/g, () => "_").toUpperCase()
const camelCase = (s: string): string => s.replace(/[/_\- ]+([a-zA-Z])/g, (g) => g.charAt(g.length - 1).toUpperCase())
const pascalCase = (s: string): string => s.replace(/(^|[/_\- ]+)([a-zA-Z])/g, (g) => g.charAt(g.length - 1).toUpperCase())

const defineTables = (definitions: { name: string, pk: string, sk?: string }[]): { env: Record<string, string>, resources: NonNullable<NonNullable<AWS["resources"]>["Resources"]> } => definitions.reduce<{ env: Record<string, string>, resources: NonNullable<NonNullable<AWS["resources"]>["Resources"]> }>((acc, def) => {
  const TableName = `${SERVICE_NAME}-${STAGE}-${def.name}`

  const resourceKey = `${pascalCase(def.name)}Table`
  if (acc.resources[resourceKey] !== undefined) throw new Error(`Duplciate table resource key ${resourceKey}`)
  acc.resources[resourceKey] = {
    Type: "AWS::DynamoDB::Table",
    DeletionPolicy: STAGE === "dev" ? "Delete" : "Retain",
    Properties: {
      AttributeDefinitions: [{
        AttributeName: def.pk,
        AttributeType: "S", // String
      }, ...(def.sk !== undefined ? [{
        AttributeName: def.sk,
        AttributeType: "S", // String
      }] : [])],
      KeySchema: [{
        AttributeName: def.pk,
        KeyType: "HASH",
      }, ...(def.sk !== undefined ? [{
        AttributeName: def.sk,
        KeyType: "RANGE",
      }] : [])],
      BillingMode: "PAY_PER_REQUEST",
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: STAGE !== "dev",
      },
      TableName,
    },
  }

  const envKey = `TABLE_NAME_${envCase(def.name)}`
  if (acc.env[envKey] !== undefined) throw new Error(`Duplciate table environment key ${envKey}`)
  acc.env[envKey] = TableName

  return acc
}, { env: {}, resources: {} })

const tables = defineTables([{
  name: "fundraiser",
  pk: "id",
}, {
  name: "donation",
  pk: "fundraiserId",
  sk: "id",
}])

const recursivelyFindFunctionsIn = (basePath: string, path: string = basePath): NonNullable<AWS["functions"]> => {
  const result: AWS["functions"] = {}
  const files = readdirSync(path, { withFileTypes: true })
  for (const file of files) {
    if (file.name.startsWith("_")) {
      // ignore
    } else if (file.isFile()) {
      const method = file.name.slice(0, file.name.lastIndexOf("."))
      if (!allowedMethods.includes(method)) {
        throw new Error(`Unexpected method ${method} at path ${path} found when scanning for functions`)
      }

      const relativePath = ((`${path}/`).slice(basePath.length + 1) + method)

      const name = camelCase(relativePath.replace(/\{.*?\}/g, ""))
      result[name] = {
        handler: `src/functions/${relativePath}.main`,
        events: [
          {
            httpApi: {
              method,
              path: path.slice(basePath.length),
            },
          },
        ],
      }
    } else if (file.isDirectory()) {
      Object.assign(result, recursivelyFindFunctionsIn(basePath, resolve(path, file.name)))
    } else {
      throw new Error(`Unexpected file ${file.name} at path ${path} found when scanning for functions`)
    }
  }
  return result
}

const functions = recursivelyFindFunctionsIn(resolve(__dirname, "src", "functions"))

const serverlessConfiguration: AWS = {
  service: SERVICE_NAME,
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: {
        forceExclude: [
          // When the aws-sdk v3 is included in the lambda environment, we should exclude all of it
          "@aws-sdk/types",
        ],
      },
    },
    "serverless-offline": {
      httpPort: 8001,
      websocketPort: 8002,
      lambdaPort: 8003,
    },
    dynamodb: { // serverless-dynamodb-local
      stages: [STAGE], // https://github.com/99x/serverless-dynamodb-local/issues/225
      start: {
        port: 8004,
        migrate: true,
        seed: true,
      },
      seed: {
        sample: {
          sources: [{
            table: tables.env.TABLE_NAME_FUNDRAISER,
            sources: ["./local/table_fundraiser.json"],
          }, {
            table: tables.env.TABLE_NAME_DONATION,
            sources: ["./local/table_donation.json"],
          }],
        },
      },
    },
  },
  plugins: [
    "serverless-webpack",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    stage: STAGE,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    httpApi: {
      payload: "2.0",
      cors: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      STAGE,
      ...env,
    },
    lambdaHashingVersion: "20201221",
    memorySize: 256,
    timeout: 10,
    iam: {
      role: {
        statements: Object.keys(tables.resources).map((tableName) => ({
          Effect: "Allow",
          Action: "dynamodb:*",
          Resource: {
            "Fn::GetAtt": [tableName, "Arn"],
          },
        })),
      },
    },
  },
  functions,
  resources: {
    Resources: {
      // Using multiple DynamoDB tables as a concious choice for maintainability.
      // The docs promote a single-table design - for max perf/min costs this may
      // be the case, however for us database access time and DynamoDB costs are
      // not limiting factors. Instead, simplicity and maintainability are so a
      // multiple table design makes sense. As we're using on-demand mode billing
      // (as opposed to provisioned capacity) the costs aren't much higher.
      ...tables.resources,
    },
  },
}

module.exports = serverlessConfiguration
