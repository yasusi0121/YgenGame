#!/usr/bin/env node
/**
 * YgenGame Static Security, Privacy, Quality & Architecture Checker
 * Run before every commit: `node scripts/static-check.mjs`
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const errors = [];

const FORBIDDEN_FILE_PATTERNS = [
  /\.env(\..+)?$/i,
  /\.(pem|key|p12|pfx|jks|keystore)$/i,
  /\.(jpg|jpeg|heic|mp4|mov|m4a|mp3|wav)$/i
];

// Patterns checked across all tracked text files (excluding AGENTS.md & this checker itself)
const SECRET_AND_PII_PATTERNS = [
  { name: 'GitHub PAT',            re: /\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { name: 'OpenAI / Stripe key',   re: /\b(sk-[A-Za-z0-9]{20,}|pk_live_[A-Za-z0-9]{16,})\b/ },
  { name: 'Google API key',        re: /\bAIza[0-9A-Za-z_-]{25,}\b/ },
  { name: 'AWS Access Key',        re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Slack Token',           re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { name: 'Private Key Block',     re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'Hardcoded Secret Key',  re: /\b(api[_-]?key|client[_-]?secret|access[_-]?token|private[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { name: 'Personal Email',        re: /[a-zA-Z0-9._%+-]+@(gmail|yahoo|icloud|outlook|hotmail|docomo|ezweb|softbank|me)\.[a-z]{2,}/i },
  { name: 'Japanese Phone Number', re: /\b0[789]0-\d{4}-\d{4}\b/ },
  { name: 'Local Machine Path',    re: /(\/Users\/[A-Za-z0-9._-]+\/|\/home\/[A-Za-z0-9._-]+\/|C:\\Users\\[A-Za-z0-9._-]+\\)/ },
  { name: 'Private LAN IP',        re: /\b(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/ }
];

function getTrackedFiles() {
  const out = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' });
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

const files = getTrackedFiles();

// 1. Forbidden file check
for (const f of files) {
  if (f === '.env.example') continue;
  for (const pat of FORBIDDEN_FILE_PATTERNS) {
    if (pat.test(f)) {
      errors.push(`[FORBIDDEN FILE] ${f}`);
    }
  }
}

// 2. Secret, PII, Local Path & Emoji check on text files
const textExts = new Set(['.js', '.mjs', '.html', '.css', '.json', '.md', '.svg']);
const emojiRe = /\p{Extended_Pictographic}/u;

for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  if (!textExts.has(ext)) continue;
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');

  // Skip rule-documentation files for regex examples
  if (f !== 'AGENTS.md' && f !== 'scripts/static-check.mjs') {
    for (const rule of SECRET_AND_PII_PATTERNS) {
      const m = content.match(rule.re);
      if (m) {
        errors.push(`[SECURITY/${rule.name}] ${f}: matched "${m[0].slice(0, 40)}"`);
      }
    }
    // Check Unicode emojis in UI/game source files
    if (ext === '.js' || ext === '.html' || ext === '.css') {
      const em = content.match(emojiRe);
      if (em) {
        errors.push(`[NO-EMOJI RULE] ${f}: found Unicode emoji "${em[0]}"`);
      }
    }
  }

  // 3. Syntax check on all JS/MJS modules
  if (ext === '.js' || ext === '.mjs') {
    try {
      execFileSync(process.execPath, ['--check', full], { stdio: 'pipe' });
    } catch (err) {
      errors.push(`[SYNTAX ERROR] ${f}: ${err.stderr ? err.stderr.toString().trim() : err.message}`);
    }
  }
}

// 4. Git author email privacy check
try {
  const email = execFileSync('git', ['config', 'user.email'], { cwd: ROOT, encoding: 'utf8' }).trim();
  if (email && !email.endsWith('noreply@github.com') && !email.endsWith('@users.noreply.github.com')) {
    errors.push(`[GIT EMAIL] user.email is "${email}" (use noreply@github.com)`);
  }
} catch (_) {}

if (errors.length > 0) {
  console.error('STATIC CHECK FAILED:');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log(`STATIC CHECK PASSED! (${files.length} tracked files verified: 0 secrets, 0 PII, 0 local paths, 0 emojis, syntax OK)`);
