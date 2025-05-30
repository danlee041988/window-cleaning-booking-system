#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const environment = process.env.NODE_ENV || 'development';
const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');

let sourceSchema;

if (environment === 'production') {
  sourceSchema = path.join(prismaDir, 'schema.production.prisma');
} else {
  sourceSchema = path.join(prismaDir, 'schema.development.prisma');
}

// Check if source schema exists
if (!fs.existsSync(sourceSchema)) {
  console.error(`Source schema not found: ${sourceSchema}`);
  process.exit(1);
}

// Copy the appropriate schema
try {
  fs.copyFileSync(sourceSchema, schemaPath);
  console.log(`✓ Switched to ${environment} schema`);
} catch (error) {
  console.error('Error switching schema:', error);
  process.exit(1);
}