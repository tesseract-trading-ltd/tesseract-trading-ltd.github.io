#!/usr/bin/env node
/**
 * Publication gate: keep internal implementation detail off the public site.
 *
 * What we publish is the Guild itself and the two systems meant for an outside
 * audience. Which internal system owns which capability, how the estate is
 * organised, and where the private design documents live are all internal
 * matters — none of it belongs on a site customers and press read.
 *
 * Scans the FULL file including code blocks and JSON payloads: an internal
 * identifier pasted into a sample document discloses just as much as one
 * written in prose.
 *
 * Adapted on 2026-09-24 from the Guild site's gate and calibrated against THIS
 * site's pages before it was switched on (the lesson from the Guild site: a word
 * list copied across sites misfires). Public names here are the Guild, Tesseract,
 * ARX and custos (the custos repository is public; linking it is fine). "Crucible" is matched only as the capitalised proper noun,
 * because the lower-case English word is ordinary prose.
 *
 * This file is excluded from publication via _config.yml — it necessarily
 * contains every term it forbids.
 *
 * Escape hatch: append a same-line comment `disclosure-ok: <reason>` when a
 * term genuinely must appear. Use sparingly — the reason is reviewed.
 *
 * Usage:
 *   node scripts/check-disclosure.mjs [dir]
 *
 * Exit codes:
 *   0 = clean
 *   1 = disclosure found
 *   2 = runtime error
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/**
 * Extensions that end up in front of a reader.
 *
 * SVG is here because it is markup, not a picture: a mark's <title> and <desc>
 * travel with the file and are read by assistive technology and crawlers.
 * Manifests and config are here because they ship too, and because a JSON file
 * is no less legible for having an unusual extension.
 */
const SCANNED = new Set([
  '.html', '.json', '.md', '.css', '.js', '.txt', '.xml',
  '.svg', '.webmanifest', '.yml', '.yaml',
]);

/** Never scanned: build output, tooling, and this gate's own word list. */
const SKIPPED_DIRS = new Set(['.git', 'node_modules', '_site', 'scripts', '.jekyll-cache']);

/**
 * Banned patterns grouped by what they would reveal. Each entry carries the
 * guidance an author needs to rewrite the line, not just a refusal.
 */
const BANNED = [
  {
    group: 'internal system names',
    patterns: [
      /\bCrucible\b/, // proper noun only; lower-case 'crucible' is plain English
      /\bcrucible[-_]rust\b/i,
      /\bSpeculum\b/i,
      /\bSynedrion\b/i,
      /\bAthanor\b/i,
      /\bArgus\b/i,
      /\bElenchus\b/i,
      /\bNummus\b/i,
      /\bFama\b/i,
      /\bphilosophers[-_]stone\b/i,
      /\bGrimoire\b/i,
      /\bScriptorium\b/i,
      /\bVademecum\b/,
      /\bMateria\b/,
    ],
    guidance:
      'Name only ARX, custos, or Collegium. Describe what the capability does for the reader; which internal system provides it is not public.',
  },
  {
    group: 'internal storage identifiers',
    patterns: [/\b\w+_control\b/, /\b\w+_live\b/, /\b\w+_sim\b/, /\bsearch_path\b/, /\bDSN\b/],
    guidance:
      'Storage layout is an internal matter. State the guarantee — that environments stay isolated — not how it is arranged.',
  },
  {
    group: 'internal architecture vocabulary',
    patterns: [
      /\boutbox\b/i,
      /\bsaga\b/i,
      /\bDeploymentSpec\b/,
      /\bRunnerFacts\b/,
      // Layer numbering appears both as an identifier and as display text.
      /\bl[123][-\s·]+(foundation|kernel|edge)\b/i,
      /\bstack_layer\b/,
      // "canonical owner", "canonical business owners", "canonical state authority".
      /\bcanonical\s+(?:\w+\s+)?(owner|authority|authorities|owners)\b/i,
      /\bphase\s+[34]\b/i,
    ],
    guidance:
      'Describe the behaviour a reader can rely on, not the mechanism that delivers it. Layer names and message types are internal.',
  },
  {
    group: 'private repositories and internal documents',
    patterns: [
      /CLAUDE\.md/,
      /codex\/projects/,
      /ecosystem-authority/,
      /make\s+check-authority/,
      /\.forge\//,
      // Private repositories, enumerated rather than matched by org prefix:
      // the org name itself is public and appears in this site's own repo name.
      /\b(?:the-alephain-guild|alchymia-labs|tesseract-trading(?:-ltd)?|aegis-labs)\/(?:alchemy|brand-guide|codex|curia|forge|get-shit-done|grimoire|paperclip-guild|sanctum|scriptorium|synedrion|synedrion-ui|athanor|philosophers-stone|speculum|materia|arx|crucible-rust|the-crucible|vademecum|fama|nummus|argus|aletheia|elenchus|guild-ops|tabularium)\b/,
    ],
    guidance:
      'External readers cannot open these. Link to public documentation, or point at where the thing lives in the product.',
  },
];

const ALLOW_MARKER = /disclosure-ok:/;

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (SKIPPED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (SCANNED.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/** Report every banned hit in a file, honouring same-line escape markers. */
export function scanDisclosure(text) {
  const findings = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (ALLOW_MARKER.test(line)) return;
    for (const { group, patterns, guidance } of BANNED) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          findings.push({
            line: index + 1,
            group,
            term: match[0],
            guidance,
            excerpt: line.trim().slice(0, 90),
          });
          break;
        }
      }
    }
  });
  return findings;
}

/**
 * The gate proves it can see before it is trusted: a scanner that reads nothing
 * or matches nothing reports the same "0 issues" as a clean site.
 */
function selfTest() {
  const mustHit = [
    'Our backtests run on Speculum.',
    'Execution goes through the Crucible engine.',
    'See github.com/the-alephain-guild/brand-guide for the palette.',
    'rows land in arx_control first',
  ];
  const mustPass = [
    'In the crucible of rigorous analysis, chaos becomes structure.',
    'ARX and custos are the parts you operate.',
    'Speculum is named here on purpose. disclosure-ok: test fixture',
  ];
  const missed = mustHit.filter((t) => scanDisclosure(t).length === 0);
  const falsePositives = mustPass.filter((t) => scanDisclosure(t).length > 0);
  if (missed.length || falsePositives.length) {
    for (const t of missed) process.stderr.write(`self-test: should have flagged: ${t}\n`);
    for (const t of falsePositives) process.stderr.write(`self-test: should have passed: ${t}\n`);
    process.exit(2);
  }
  process.stdout.write(`✅ disclosure self-test: ${mustHit.length} flagged, ${mustPass.length} passed\n`);
}

async function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const target = process.argv[2] ? path.resolve(process.argv[2]) : ROOT;
  const stat = await fs.stat(target).catch(() => null);
  if (!stat) {
    process.stderr.write(`check-disclosure: no such path: ${target}\n`);
    process.exit(2);
  }
  const files = stat.isDirectory() ? await walk(target) : [target];

  if (files.length === 0) {
    process.stderr.write(
      `check-disclosure: scanned 0 files under ${target}.\n` +
        'A gate that reads nothing reports success for the wrong reason. ' +
        'Check the extension list and the skipped directories before trusting a pass.\n',
    );
    process.exit(2);
  }

  let total = 0;
  const byGroup = new Map();

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const findings = scanDisclosure(await fs.readFile(file, 'utf8'));
    for (const finding of findings) {
      process.stderr.write(
        `❌ ${rel}:${finding.line} [${finding.group}] "${finding.term}"\n` +
          `   ${finding.excerpt}\n` +
          `   → ${finding.guidance}\n`,
      );
      total++;
      byGroup.set(finding.group, (byGroup.get(finding.group) ?? 0) + 1);
    }
  }

  if (total > 0) {
    process.stderr.write(`\n${total} disclosure issue(s) across ${files.length} file(s):\n`);
    for (const [group, count] of byGroup) {
      process.stderr.write(`  ${count} × ${group}\n`);
    }
    process.stderr.write(
      '\nIf a term genuinely must appear, append `disclosure-ok: <reason>` on that line.\n',
    );
    process.exit(1);
  }

  process.stdout.write(`✅ disclosure check: ${files.length} file(s) scanned, 0 issue(s)\n`);
  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`check-disclosure fatal: ${err?.stack ?? err}\n`);
  process.exit(2);
});
