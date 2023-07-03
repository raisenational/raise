const dynamodbLocal = require("aws-dynamodb-local")

module.exports = () => dynamodbLocal.stop(8005)
