#!/usr/bin/env node
// Stop hook (Codex): append a cumulative token-usage snapshot for this
// session to the same global JSONL log Claude Code writes to.
//
// UNVERIFIED: built from public docs on ~/.codex/sessions/YYYY/MM/DD/
// rollout-<session-id>.jsonl, not tested against a real Codex install.
// If totals come out as 0, send a sample line from your rollout file
// (redact prompts) so the field names here can be fixed.
import { readFileSync, appendFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf-8'));
  } catch {
    return {};
  }
}

function findRollout(sessionId) {
  const base = join(homedir(), '.codex', 'sessions');
  if (!existsSync(base) || !sessionId) return null;
  const stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    let items;
    try {
      items = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const item of items) {
      const full = join(dir, item.name);
      if (item.isDirectory()) stack.push(full);
      else if (item.name === `rollout-${sessionId}.jsonl`) return full;
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

function summarize(path) {
  const lines = readFileSync(path, 'utf-8').split('\n').filter(Boolean);
  const totals = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
  const toolCalls = {};

  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    // Try common shapes: {usage:{input_tokens,output_tokens}} or
    // {usage:{prompt_tokens,completion_tokens}} nested at top level or
    // under .response.
    const usage = entry.usage || entry.response?.usage;
    if (usage) {
      totals.input_tokens += usage.input_tokens ?? usage.prompt_tokens ?? 0;
      totals.output_tokens += usage.output_tokens ?? usage.completion_tokens ?? 0;
      totals.cache_creation_input_tokens += usage.cache_creation_input_tokens ?? 0;
      totals.cache_read_input_tokens += usage.cached_tokens ?? usage.cache_read_input_tokens ?? 0;
    }

    const type = entry.type || entry.item?.type;
    if (type === 'function_call' || type === 'tool_call' || type === 'local_shell_call') {
      const name = entry.name || entry.item?.name || entry.tool_name || 'unknown_tool';
      toolCalls[name] = (toolCalls[name] || 0) + 1;
    }
  }

  return { totals, toolCalls };
}

const hookInput = readStdin();
const rolloutPath = findRollout(hookInput.session_id);
if (!rolloutPath) process.exit(0);

let summary;
try {
  summary = summarize(rolloutPath);
} catch {
  process.exit(0);
}

const logDir = join(homedir(), '.token-tracking');
const logPath = join(logDir, 'token-usage.jsonl');
mkdirSync(logDir, { recursive: true });

const entry = {
  timestamp: new Date().toISOString(),
  agent: 'codex',
  user: gitIdentity(),
  project: process.cwd().split(/[\\/]/).pop(),
  session_id: hookInput.session_id || null,
  totals: summary.totals,
  tool_calls: summary.toolCalls,
};

appendFileSync(logPath, JSON.stringify(entry) + '\n');
