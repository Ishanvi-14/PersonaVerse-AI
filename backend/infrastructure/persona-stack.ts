import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class PersonaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for data storage (user uploads, media, etc.)
    const dataBucket = new s3.Bucket(this, 'PersonaDataBucket', {
      bucketName: `personaverse-data-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For hackathon - use RETAIN in production
    });

    // DynamoDB Table for persona state and metadata
    const personaTable = new dynamodb.Table(this, 'PersonaStateTable', {
      tableName: 'PersonaVerse-PersonaState',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'personaId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For hackathon - use RETAIN in production
    });

    // Add GSI for querying by persona type
    personaTable.addGlobalSecondaryIndex({
      indexName: 'PersonaTypeIndex',
      partitionKey: {
        name: 'personaType',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Lambda execution role with necessary permissions
    const lambdaRole = new iam.Role(this, 'PersonaLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        PersonaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
              ],
              resources: [`${dataBucket.bucketArn}/*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
              ],
              resources: [
                personaTable.tableArn,
                `${personaTable.tableArn}/index/*`,
              ],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeAgent',
              ],
              resources: ['*'], // Bedrock resources are region-specific
            }),
          ],
        }),
      },
    });

    // Placeholder Lambda functions for each endpoint
    const personaEngineFunction = new lambda.Function(this, 'PersonaEngineFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              message: 'Persona Engine endpoint - Implementation pending',
              path: event.path,
              method: event.httpMethod,
            }),
          };
        };
      `),
      role: lambdaRole,
      environment: {
        PERSONA_TABLE_NAME: personaTable.tableName,
        DATA_BUCKET_NAME: dataBucket.bucketName,
      },
    });

    const uploadFunction = new lambda.Function(this, 'UploadFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              message: 'Upload endpoint - Implementation pending',
              path: event.path,
              method: event.httpMethod,
            }),
          };
        };
      `),
      role: lambdaRole,
      environment: {
        PERSONA_TABLE_NAME: personaTable.tableName,
        DATA_BUCKET_NAME: dataBucket.bucketName,
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'PersonaVerseAPI', {
      restApiName: 'PersonaVerse API',
      description: 'API for PersonaVerse Digital Identity System',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Resources and Methods
    const v1 = api.root.addResource('v1');
    
    // Persona management endpoints
    const personas = v1.addResource('personas');
    personas.addMethod('GET', new apigateway.LambdaIntegration(personaEngineFunction));
    personas.addMethod('POST', new apigateway.LambdaIntegration(personaEngineFunction));
    
    const personaById = personas.addResource('{personaId}');
    personaById.addMethod('GET', new apigateway.LambdaIntegration(personaEngineFunction));
    personaById.addMethod('PUT', new apigateway.LambdaIntegration(personaEngineFunction));
    personaById.addMethod('DELETE', new apigateway.LambdaIntegration(personaEngineFunction));

    // Content generation endpoint
    const generate = v1.addResource('generate');
    generate.addMethod('POST', new apigateway.LambdaIntegration(personaEngineFunction));

    // Upload endpoint for media/text ingestion
    const upload = v1.addResource('upload');
    upload.addMethod('POST', new apigateway.LambdaIntegration(uploadFunction));

    // Audience simulation endpoint
    const mirror = v1.addResource('mirror');
    mirror.addMethod('POST', new apigateway.LambdaIntegration(personaEngineFunction));

    // Output important values
    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'DataBucketName', {
      value: dataBucket.bucketName,
      description: 'S3 Data Bucket Name',
    });

    new cdk.CfnOutput(this, 'PersonaTableName', {
      value: personaTable.tableName,
      description: 'DynamoDB Persona State Table Name',
    });
  }
}