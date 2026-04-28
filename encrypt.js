const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PASSWORD = process.argv[2] || 'SIRFAS2026';
const CONTENT_PATH = path.join(__dirname, 'src', 'proposal-content.html');
const OUTPUT_PATH = path.join(__dirname, 'index.html');
const SHELL_PATH = path.join(__dirname, 'src', 'shell.html');

const content = fs.readFileSync(CONTENT_PATH, 'utf8');
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(PASSWORD, salt, 100000, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

let encrypted = cipher.update(content, 'utf8', 'base64');
encrypted += cipher.final('base64');
const tag = cipher.getAuthTag().toString('base64');

const payload = JSON.stringify({
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  tag: tag,
  data: encrypted
});

const shell = fs.readFileSync(SHELL_PATH, 'utf8');
const output = shell.replace('__ENCRYPTED_PAYLOAD__', payload);
fs.writeFileSync(OUTPUT_PATH, output, 'utf8');

console.log(`Encrypted with password: "${PASSWORD}"`);
console.log(`Output: ${OUTPUT_PATH}`);
console.log(`Content size: ${content.length} chars → Encrypted: ${encrypted.length} chars`);
