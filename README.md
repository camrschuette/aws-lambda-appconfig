# Lambda + AppConfig

An AWS CDK application that uses the AppConfig extension (Lambda Layer) for Lambda to get feature flags or other freeform configuration data.

In the example, we have a configuration about a third-party API call.

---

## Prerequisites

* Nodejs (see [package engines](package.json) for version)
* Docker - used by CDK for building the lambda code

## Component Structure

The application contains:
* An AppConfig application, environment, configuration profile (hosted), and deployment strategy.
* Lambda extension (pulled in as a layer) for grabbing AppConfig data.
* Lambda pointed from `app/lambdas/demo/handler.ts`, containing code that pulls data from AppConfig and caches locally.

## How it works

![Flow](docs/diagram.png)

1. To access its configuration data, your function calls the AWS AppConfig extension at an HTTP endpoint.
2. The extension maintains a local cache of the configuration data.
3. If the data isn't in the cache, the extension calls the AWS SDK to...
4. Call AWS AppConfig to get the configuration data.
5. AWS AppConfig returns the data
6. The extension gets the data back from the SDK and....
7. Upon receiving the configuration from the service, the extension stores it in the local cache.
8. Configuration data is passed to the Lambda function.

*AWS AppConfig Lambda extension periodically checks for updates to your configuration data in the background. Each time your Lambda function is invoked, the extension checks the elapsed time since it retrieved a configuration. If the elapsed time is greater than the configured poll interval, the extension calls AWS AppConfig to check for newly deployed data, updates the local cache if there has been a change, and resets the elapsed time.*

## Deployment

Run `npx cdk deploy`. This will deploy the stack to your AWS account.

---

## Notes

* [AWS reference documentation about the AWS AppConfig extension.](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions.html)
