const dynamodbLocal = require("dynamodb-localhost")

module.exports = () => dynamodbLocal.stop(8005)
