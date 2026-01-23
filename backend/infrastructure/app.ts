#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PersonaStack } from './persona-stack';

const app = new cdk.App();

new PersonaStack(app, 'PersonaVerseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'PersonaVerse AI - Digital Identity System Infrastructure',
});