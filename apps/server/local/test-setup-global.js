const dynamodbLocal = require("aws-dynamodb-local")
const path = require("path")
const execSync = require('child_process').execSync;

module.exports = async () => {
  const service = JSON.parse(execSync('npx serverless print --format json', { encoding: 'utf-8' }))

  // Start DynamoDB local
  dynamodbLocal.start({
    port: 8005,
    installPath: path.join(__dirname, '..', '.dynamodb'),
    sharedDb: false, // So each test gets its own database
  })

  // Store the table CloudFormation resources in the __DYNAMODB_TABLES environment variable
  process.env.__DYNAMODB_TABLES = JSON.stringify(
    Object.values(service.resources.Resources)
      .filter((resource) => resource.Type === "AWS::DynamoDB::Table")
      .map((resource) => resource.Properties)
  )
}
