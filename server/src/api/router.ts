import type { APIGatewayProxyEventV2, APIGatewayProxyResult, Handler as AWSHandler } from "aws-lambda"

// This router allows us to run the server with a single AWS Lambda. Doing this means:
// - it is kept warm between time-proximate requests to different endpoints, e.g. when navigating around admin pages
// - we can set up provisioned capacity for all endpoints at the minimum level of 1 without it being too costly
// Both of these reduce cold starts, making our back-end more responsive
// This does come with the downside that we lose a little granularity for some AWS Lambda metrics
export const main: AWSHandler<APIGatewayProxyEventV2, APIGatewayProxyResult> = async (event, context) => {
  const [method, route] = event.routeKey.split(" ")
  return (await import(`.${route}/${method.toLowerCase()}`)).main(event, context)
}
