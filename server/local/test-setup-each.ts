import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { auditContext } from "../src/helpers/auditContext"
import { dbClient } from "../src/helpers/db"

// Retrieve the table CloudFormation resources from the __DYNAMODB_TABLES environment variable
const DYNAMODB_TABLES = JSON.parse(process.env.__DYNAMODB_TABLES!)

beforeEach(async () => {
  // Mock audit context (you can override this by setting auditContext.value)
  auditContext.value = {
    subject: "test",
    sourceIp: "127.0.0.1",
    userAgent: "test",
    route: "unknown",
    routeRaw: "unknown",
  }

  // Suppress logging (you can override this with unsupressConsole from test helpers)
  jest.spyOn(console, "error").mockImplementation()
  jest.spyOn(console, "warn").mockImplementation()
  jest.spyOn(console, "info").mockImplementation()
  jest.spyOn(console, "log").mockImplementation()

  // Variables to be lazy initialized
  let dynamoDBClient: DynamoDBClient
  let internalDbClient: DynamoDBDocumentClient
  let ready = false

  dbClient.send = jest.fn()
    .mockImplementationOnce(async (command) => {
      // The first time, we lazy initiate the clients and create the tables
      dynamoDBClient = new DynamoDBClient({
        region: "localhost",
        endpoint: "http://localhost:8005",
        credentials: { accessKeyId: `DEFAULT_ACCESS_KEY${Math.random()}`, secretAccessKey: "DEFAULT_SECRET" },
      })
      internalDbClient = DynamoDBDocumentClient.from(dynamoDBClient, {
        marshallOptions: {
          convertEmptyValues: false,
          removeUndefinedValues: false,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      })
      await Promise.all(DYNAMODB_TABLES.map((table: any) => dynamoDBClient.send(new CreateTableCommand(table))))
      ready = true

      // Call ourself, so we use the mockImplementation below
      return dbClient.send(command)
    })
    .mockImplementation(async (command) => {
      if (!ready) {
        await new Promise<void>((resolve) => {
          const timeout = setInterval(() => {
            if (ready) {
              clearInterval(timeout)
              resolve()
            }
          }, 50)
        })
      }
      return internalDbClient.send(command)
    })
})
