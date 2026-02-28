/**
 * DynamoDB Setup Script
 * Creates required tables for PersonaVerse production deployment
 */

import { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand,
  ResourceInUseException 
} from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

interface TableConfig {
  tableName: string;
  keySchema: any[];
  attributeDefinitions: any[];
  globalSecondaryIndexes?: any[];
}

const tables: TableConfig[] = [
  // Users table
  {
    tableName: process.env.DYNAMODB_TABLE_USERS || 'personaverse-users',
    keySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    attributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    globalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ]
  },
  // Calendar table
  {
    tableName: process.env.DYNAMODB_TABLE_CALENDAR || 'personaverse-calendar',
    keySchema: [
      { AttributeName: 'scheduleId', KeyType: 'HASH' }
    ],
    attributeDefinitions: [
      { AttributeName: 'scheduleId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    globalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ]
  },
  // User history table (existing)
  {
    tableName: process.env.DYNAMODB_TABLE_HISTORY || 'personaverse-user-history',
    keySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' }
    ],
    attributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' }
    ]
  },
  // Personas table (existing)
  {
    tableName: process.env.DYNAMODB_TABLE_PERSONAS || 'personaverse-personas',
    keySchema: [
      { AttributeName: 'personaId', KeyType: 'HASH' }
    ],
    attributeDefinitions: [
      { AttributeName: 'personaId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    globalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ]
  }
];

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    return false;
  }
}

async function createTable(config: TableConfig): Promise<void> {
  const { tableName, keySchema, attributeDefinitions, globalSecondaryIndexes } = config;

  console.log(`\nCreating table: ${tableName}...`);

  try {
    // Check if table already exists
    if (await tableExists(tableName)) {
      console.log(`✓ Table ${tableName} already exists`);
      return;
    }

    const command = new CreateTableCommand({
      TableName: tableName,
      KeySchema: keySchema,
      AttributeDefinitions: attributeDefinitions,
      GlobalSecondaryIndexes: globalSecondaryIndexes,
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await client.send(command);
    console.log(`✓ Table ${tableName} created successfully`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`✓ Table ${tableName} already exists`);
    } else {
      console.error(`✗ Failed to create table ${tableName}:`, error);
      throw error;
    }
  }
}

async function setupDynamoDB(): Promise<void> {
  console.log('='.repeat(60));
  console.log('PersonaVerse DynamoDB Setup');
  console.log('='.repeat(60));
  console.log(`AWS Region: ${process.env.AWS_REGION || 'ap-south-1'}`);
  console.log(`AWS Access Key: ${process.env.AWS_ACCESS_KEY_ID ? '✓ Configured' : '✗ Not Set'}`);
  console.log('='.repeat(60));

  try {
    for (const tableConfig of tables) {
      await createTable(tableConfig);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✓ DynamoDB setup completed successfully!');
    console.log('='.repeat(60));
    console.log('\nCreated tables:');
    tables.forEach(t => console.log(`  - ${t.tableName}`));
    console.log('\nYour PersonaVerse backend is ready for production! 🚀');
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ DynamoDB setup failed');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

// Run setup
setupDynamoDB();
