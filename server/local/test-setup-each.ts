import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { auditContext } from "../src/helpers/auditContext"
import { dbClient } from "../src/helpers/db"

// Retrieve the table CloudFormation resources from the __DYNAMODB_TABLES environment variable
const DYNAMODB_TABLES = JSON.parse(process.env.__DYNAMODB_TABLES!)

beforeEach(async () => {
  auditContext.value = process.env.DISABLE_MOCK_AUDIT_CONTEXT ? undefined : {
    subject: "test",
    sourceIp: "127.0.0.1",
    userAgent: "test",
    route: "unknown",
    routeRaw: "unknown",
  }

  // Variables to be lazy initialized
  let dynamoDBClient: DynamoDBClient
  let internalDbClient: DynamoDBDocumentClient

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

      // Call ourself, so we use the mockImplementation below
      return dbClient.send(command)
    })
    .mockImplementation((command) => internalDbClient.send(command))
})
