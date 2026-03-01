/**
 * Health Check Lambda Handler
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      message: 'PersonaVerse AI - Serverless Backend is running!',
      timestamp: new Date().toISOString(),
      stage: process.env.STAGE,
      version: '1.0.0',
    }),
  };
};
