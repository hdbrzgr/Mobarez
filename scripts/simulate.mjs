import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'mobarez-sim-'));
try {
  const outfile = join(dir, 'simulate.mjs');
  await build({
    entryPoints: ['scripts/simulate.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
  });
  const { PROFILES, run } = await import(pathToFileURL(outfile).href);
  const wanted = process.argv[2];
  const days = Number(process.argv[3] ?? 30);
  for (const profile of PROFILES) {
    if (wanted && profile.name !== wanted) continue;
    const { rows } = run(profile, days);
    console.log(`\n=== ${profile.name} ===`);
    console.table(rows.filter((r) => r.day <= 3 || r.day % 3 === 0));
  }
} finally {
  await rm(dir, { recursive: true, force: true });
}
