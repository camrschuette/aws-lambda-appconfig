#!/usr/bin/env node
import 'source-map-support/register';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as appconfig from 'aws-cdk-lib/aws-appconfig';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class AwsLambdaAppConfigStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        const application = new appconfig.CfnApplication(this, 'AppConfigApplication', {
            name: 'DemoApplication'
        });
        
        const environment = new appconfig.CfnEnvironment(this, 'AppConfigEnvironment', {
            applicationId: application.ref,
            name: 'Development'
        });
        
        const configurationProfile = new appconfig.CfnConfigurationProfile(this, 'AppConfigConfigurationProfile', {
            applicationId: application.ref,
            locationUri: 'hosted',
            name: 'DemoConfigurationProfile',
        });
        
        const hostedConfigurationProfile = new appconfig.CfnHostedConfigurationVersion(this, 'AppConfigHostedConfigurationProfile', {
            applicationId: application.ref,
            configurationProfileId: configurationProfile.ref,
            contentType: 'application/json',
            content: JSON.stringify({
                someApi: {
                    host: 'http://some-api',
                    rateLimit: {
                        pMin: 100
                    }
                }
            })
        });
        
        const deploymentStrategy = new appconfig.CfnDeploymentStrategy(this, 'AppConfigDeploymentStrategy', {
            name: 'Custom.AllAtOnce',
            deploymentDurationInMinutes: 0,
            growthFactor: 100,
            replicateTo: 'NONE',
            growthType: 'LINEAR',
        });
        
        const deployment = new appconfig.CfnDeployment(this, 'AppConfigDeployment', {
            applicationId: application.ref,
            configurationProfileId: configurationProfile.ref,
            configurationVersion: '1',
            deploymentStrategyId: deploymentStrategy.ref,
            environmentId: environment.ref,
        });
        deployment.addDependsOn(hostedConfigurationProfile);
    
        /**
         * This needs to match your specified region and lambda architecture
         * @see {@link https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions-versions.html#appconfig-integration-lambda-extensions-versions-find} to find your version
         */
        const layer = LayerVersion.fromLayerVersionArn(this, 'AppConfigExtensionLayer', 'arn:aws:lambda:us-east-1:027255383542:layer:AWS-AppConfig-Extension:69');
        
        const lambda = new NodejsFunction(this, 'AppConfigDemoFunction', {
            entry: join(__dirname, `./app/lambdas/demo/handler.ts`),
            handler: 'handler',
            depsLockFilePath: join(__dirname, `./package-lock.json`),
            runtime: Runtime.NODEJS_14_X,
            layers: [ layer ],
            environment: {
                AWS_APPCONFIG_APPLICATION: application.name,
                AWS_APPCONFIG_ENVIRONMENT: environment.name,
                AWS_APPCONFIG_CONFIGURATION: configurationProfile.name
            }
        });
        
        lambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'appconfig:StartConfigurationSession',
                'appconfig:GetLatestConfiguration'
            ],
            resources: [
                `arn:aws:appconfig:${this.region}:${this.account}:application/${application.ref}/environment/${environment.ref}/configuration/${configurationProfile.ref}`
            ]
        }));
    }
}

const app = new App();
new AwsLambdaAppConfigStack(app, 'AwsLambdaAppConfigStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' }
});
