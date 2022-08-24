#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsLambdaAppConfigStack } from '../lib/aws-lambda-appconfig-stack';

const app = new cdk.App();
new AwsLambdaAppConfigStack(app, 'AwsLambdaAppConfigStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
