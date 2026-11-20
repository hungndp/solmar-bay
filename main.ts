// Solmar Bay v8 — handover program for the make.fun gta6-01 bounty.
// Copies game/ and screenshots/ into the output directory and writes the
// dossier with the kit's own library, exactly as the scorer rebuilds it.
// The output directory itself is never deleted: the grader runs as an
// unprivileged uid that may write inside /output but not remove it, so we
// clear only its contents and write into the directory as it stands.
import { buildDossier } from './vendor/makefun-game.ts';
import {
  chmodSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// cpSync preserves the source's permission bits, and a read-only repo
// copy would otherwise leave the output's directories unwritable — a
// second run over a non-empty output could then not clear its own work.
// Normalise permissions wherever we are about to delete or have copied.
function makeWritable(path: string): void {
  // Best effort: a foreign-owned leftover in the output cannot be chmodded
  // by this uid, but it can still be deleted (the output dir is writable),
  // so a failed chmod must not stop the run.
  const st = lstatSync(path);
  try { chmodSync(path, st.isDirectory() ? 0o755 : 0o644); } catch { /* delete still works */ }
  if (st.isDirectory()) {
    for (const name of readdirSync(path)) makeWritable(join(path, name));
  }
}

function clearContents(dir: string): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    makeWritable(p);
    rmSync(p, { recursive: true, force: true });
  }
}

function main(): void {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  mkdirSync(outDir, { recursive: true });
  clearContents(outDir);
  for (const part of ['game', 'screenshots']) {
    const from = join(here, part);
    if (!existsSync(from)) throw new Error(`missing ${part}/ in the entry`);
    cpSync(from, join(outDir, part), { recursive: true });
    makeWritable(join(outDir, part));
  }
  const dossier = buildDossier(outDir, CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`solmar-bay v8: wrote dossier (${dossier.length} bytes) to ${outDir}`);
}

main();
