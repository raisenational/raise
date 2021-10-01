import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDBClient = process.env.IS_OFFLINE
  ? new DynamoDBClient({ region: 'localhost', endpoint: 'http://localhost:8004', credentials: { accessKeyId: 'DEFAULT_ACCESS_KEY', secretAccessKey: 'DEFAULT_SECRET' } })
  : new DynamoDBClient({})

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false
  },
  unmarshallOptions: {
    wrapNumbers: false
  }
});

export default dynamoDBDocumentClient;