#!/usr/bin/env node

/**
 * Security Audit Script
 * Checks for common security issues and dependency vulnerabilities
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔒 Running Security Audit...\n');

let issues = [];
let warnings = [];

// Check for npm audit
try {
  console.log('📦 Checking for dependency vulnerabilities...');
  const auditResult = execSync('npm audit --json', { 
    cwd: join(__dirname, '..'),
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  const audit = JSON.parse(auditResult);
  
  if (audit.vulnerabilities) {
    const vulnCount = Object.keys(audit.vulnerabilities).length;
    if (vulnCount > 0) {
      issues.push(`Found ${vulnCount} dependency vulnerabilities. Run 'npm audit fix' to resolve.`);
    } else {
      console.log('✅ No known vulnerabilities in dependencies\n');
    }
  }
} catch (error) {
  warnings.push('Could not run npm audit. Make sure npm is installed.');
}

// Check for required environment variables
console.log('🔐 Checking environment variables...');
try {
  const envExample = readFileSync(join(__dirname, '..', '.env.example'), 'utf8');
  const requiredVars = envExample
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#') && line.includes('='))
    .map(line => line.split('=')[0].trim())
    .filter(Boolean);
  
  console.log(`✅ Found ${requiredVars.length} environment variables in .env.example\n`);
} catch (error) {
  warnings.push('.env.example file not found');
}

// Check for security headers in server.js
console.log('🛡️  Checking security headers...');
try {
  const serverCode = readFileSync(join(__dirname, '..', 'server.js'), 'utf8');
  
  const securityChecks = {
    'Helmet.js': serverCode.includes('helmet'),
    'CORS': serverCode.includes('cors'),
    'Rate Limiting': serverCode.includes('rateLimit'),
    'CSRF Protection': serverCode.includes('csrf') || serverCode.includes('CSRF'),
    'Request ID': serverCode.includes('requestId') || serverCode.includes('X-Request-ID'),
    'HTTPS Redirect': serverCode.includes('x-forwarded-proto'),
  };
  
  Object.entries(securityChecks).forEach(([check, present]) => {
    if (present) {
      console.log(`✅ ${check} configured`);
    } else {
      warnings.push(`${check} not found`);
    }
  });
  console.log('');
} catch (error) {
  warnings.push('Could not read server.js');
}

// Summary
console.log('\n📊 Security Audit Summary:');
if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ No security issues found!\n');
  process.exit(0);
} else {
  if (issues.length > 0) {
    console.log('\n❌ Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('\n💡 Recommendations:');
  console.log('  - Run "npm audit fix" to fix dependency vulnerabilities');
  console.log('  - Ensure all environment variables are set');
  console.log('  - Review security headers configuration');
  console.log('  - Test CSRF protection');
  console.log('');
  
  process.exit(issues.length > 0 ? 1 : 0);
}

