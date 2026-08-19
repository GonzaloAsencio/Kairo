#!/usr/bin/env node
// Stop hook: append a cumulative token-usage snapshot for this session to
// a global, per-machine JSONL log. Never touches the repo.
import { readFileSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf-8'));
  } catch {
    return {};
  }
}

function findTranscript(hookInput) {
  if (hookInput.transcript_path) return hookInput.transcript_path;
  const sessionId = hookInput.session_id;
  if (!sessionId) return null;
  const projectsDir = join(homedir(), '.claude', 'projects');
  let dirs = [];
  try {
    dirs = readdirSync(projectsDir);
  } catch {
    return null;
  }
  for (const d of dirs) {
    const candidate = join(projectsDir, d, `${sessionId}.jsonl`);
    try {
      readFileSync(candidate);
      return candidate;
    } catch {
      // not here, keep looking
    }
  }
  return null;
}

function gitIdentity() {
  try {
    const name = execSync('git config user.name', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (name) return name;
  } catch {}
  return process.env.USERNAME || process.env.USER || 'unknown';
}

function summarizeTranscript(path) {
  const lines = readFileSync(path, 'utf-8').split('\n').filter(Boolean);
  const totals = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };
  const toolCalls = {};

  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const msg = entry.message;
    if (!msg) continue;

    if (entry.type === 'assistant' && msg.usage) {
      totals.input_tokens += msg.usage.input_tokens || 0;
      totals.output_tokens += msg.usage.output_tokens || 0;
      totals.cache_creation_input_tokens += msg.usage.cache_creation_input_tokens || 0;
      totals.cache_read_input_tokens += msg.usage.cache_read_input_tokens || 0;
    }

    const content = Array.isArray(msg.content) ? msg.content : [];
    for (const block of content) {
      if (block.type === 'tool_use' && block.name) {
        toolCalls[block.name] = (toolCalls[block.name] || 0) + 1;
      }
    }
  }

  return { totals, toolCalls };
}

const hookInput = readStdin();
const transcriptPath = findTranscript(hookInput);
if (!transcriptPath) process.exit(0);

let summary;
try {
  summary = summarizeTranscript(transcriptPath);
} catch {
  process.exit(0);
}

const logDir = join(homedir(), '.token-tracking');
const logPath = join(logDir, 'token-usage.jsonl');
mkdirSync(logDir, { recursive: true });

const entry = {
  timestamp: new Date().toISOString(),
  agent: 'claude-code',
  user: gitIdentity(),
  project: process.cwd().split(/[\\/]/).pop(),
  session_id: hookInput.session_id || null,
  totals: summary.totals,
  tool_calls: summary.toolCalls,
};

appendFileSync(logPath, JSON.stringify(entry) + '\n');
