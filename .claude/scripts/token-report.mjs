#!/usr/bin/env node
// Reads the global JSONL token log and (re)generates a markdown summary.
// Never appends — regenerated fully each run, safe to commit.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const logPath = join(homedir(), '.token-tracking', 'token-usage.jsonl');
const outPath = process.argv[2] || join(process.cwd(), 'docs', 'token-usage-report.md');

if (!existsSync(logPath)) {
  console.error(`No log found at ${logPath}`);
  process.exit(1);
}

const lines = readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);

// Dedup: the Stop hook logs a cumulative snapshot each turn, so keep only
// the latest entry per session_id.
const latestBySession = new Map();
for (const line of lines) {
  let entry;
  try {
    entry = JSON.parse(line);
  } catch {
    continue;
  }
  const key = entry.session_id || `${entry.user}:${entry.timestamp}`;
  const prev = latestBySession.get(key);
  if (!prev || entry.timestamp > prev.timestamp) {
    latestBySession.set(key, entry);
  }
}

const entries = [...latestBySession.values()];

function emptyTotals() {
  return { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
}

const byUser = new Map();
const byUserTools = new Map();
const grandTotal = emptyTotals();

for (const e of entries) {
  const u = e.user || 'unknown';
  const t = byUser.get(u) || emptyTotals();
  for (const k of Object.keys(t)) {
    t[k] += e.totals?.[k] || 0;
    grandTotal[k] += e.totals?.[k] || 0;
  }
  byUser.set(u, t);

  const tools = byUserTools.get(u) || {};
  for (const [name, count] of Object.entries(e.tool_calls || {})) {
    tools[name] = (tools[name] || 0) + count;
  }
  byUserTools.set(u, tools);
}

function billable(t) {
  return t.input_tokens + t.output_tokens + t.cache_creation_input_tokens + t.cache_read_input_tokens;
}

const fmt = (n) => n.toLocaleString('en-US');

let md = `# Token Usage Report\n\n`;
md += `_Generated ${new Date().toISOString()} from ${entries.length} session(s)._\n\n`;

md += `## Total\n\n`;
md += `| Metric | Value |\n|---|---|\n`;
md += `| Input tokens | ${fmt(grandTotal.input_tokens)} |\n`;
md += `| Output tokens | ${fmt(grandTotal.output_tokens)} |\n`;
md += `| Cache creation | ${fmt(grandTotal.cache_creation_input_tokens)} |\n`;
md += `| Cache read | ${fmt(grandTotal.cache_read_input_tokens)} |\n`;
md += `| **Total** | **${fmt(billable(grandTotal))}** |\n\n`;

md += `## By Collaborator\n\n`;
md += `| User | Input | Output | Cache Creation | Cache Read | Total |\n`;
md += `|---|---|---|---|---|---|\n`;
for (const [user, t] of byUser) {
  md += `| ${user} | ${fmt(t.input_tokens)} | ${fmt(t.output_tokens)} | ${fmt(t.cache_creation_input_tokens)} | ${fmt(t.cache_read_input_tokens)} | ${fmt(billable(t))} |\n`;
}

md += `\n## Tool Calls by Collaborator\n\n`;
for (const [user, tools] of byUserTools) {
  md += `**${user}**\n\n`;
  md += `| Tool | Calls |\n|---|---|\n`;
  for (const [name, count] of Object.entries(tools).sort((a, b) => b[1] - a[1])) {
    md += `| ${name} | ${count} |\n`;
  }
  md += `\n`;
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, md);
console.log(`Wrote ${outPath}`);
