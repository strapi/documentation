#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');

const target = path.resolve(__dirname, '..', 'validate-llms-code.js');
const args = [target, ...process.argv.slice(2)];
const child = spawn(process.execPath, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code));

