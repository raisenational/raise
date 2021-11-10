// NB: we use dynamodb-localhost as it's the same as serverless-offline, and reduces our dependencies
const dynamodbLocal = require("dynamodb-localhost")
const path = require("path")
const Serverless = require("serverless")

module.exports = async () => {
  // Set up a serverless instance
  const serverless = new Serverless()
  process.stdin.isTTY = false // prevent plugin errors
  await serverless.init()

  // Fix log from dynamodb-localhost as "Determining test suites to run..." misses trailing newline
  console.log()

  // Start dynamodb-localhost
  dynamodbLocal.start({
    port: 8004,
    install_path: serverless.config && path.join(__dirname, '../.dynamodb'),
    sharedDb: false, // So each test gets its own database
  })

  // Store the table CloudFormation resources in the __DYNAMODB_TABLES environment variable
  const service = await serverless.variables.populateService()
  process.env.__DYNAMODB_TABLES = JSON.stringify(
    Object.values(service.resources.Resources)
      .filter((resource) => resource.Type === "AWS::DynamoDB::Table")
      .map((resource) => resource.Properties)
  )
}
