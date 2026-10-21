import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const violations = [];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(absolute);
      return /\.(?:ts|tsx|js|mjs)$/.test(entry.name) ? [absolute] : [];
    }),
  );
  return files.flat();
}

function assertRule(file, source, pattern, message) {
  if (pattern.test(source)) violations.push(`${path.relative(root, file)}: ${message}`);
}

for (const file of await sourceFiles(path.join(root, 'backend/src'))) {
  const relative = path.relative(path.join(root, 'backend/src'), file).split(path.sep).join('/');
  const source = await readFile(file, 'utf8');

  if (relative.includes('/domain/')) {
    assertRule(
      file,
      source,
      /from\s+['"](?:express|react|@prisma\/client|.*\/(?:infrastructure|presentation)\/)/,
      'domain layer depends on a framework or outer layer',
    );
  }
  if (relative.includes('/application/')) {
    assertRule(
      file,
      source,
      /from\s+['"](?:express|react|@prisma\/client|.*\/(?:infrastructure|presentation)\/)/,
      'application layer depends on a framework or outer layer',
    );
  }
  if (relative.includes('/presentation/')) {
    assertRule(
      file,
      source,
      /from\s+['"][^'"]*infrastructure\//,
      'presentation imports infrastructure',
    );
    assertRule(file, source, /from\s+['"]@prisma\/client['"]/, 'presentation imports Prisma');
    assertRule(
      file,
      source,
      /new\s+(?:Manage|Submit|Read)[A-Z]\w*\s*\(/,
      'presentation constructs an application service',
    );
    assertRule(
      file,
      source,
      /\brepository\.(?:find|list|create|update|delete|save|unpublish)/,
      'presentation calls a repository directly',
    );
  }
  if (
    !relative.includes('/infrastructure/') &&
    !relative.startsWith('shared/database/') &&
    relative !== 'shared/http/error-handler.ts'
  ) {
    assertRule(
      file,
      source,
      /from\s+['"]@prisma\/client['"]/,
      'Prisma import is outside an infrastructure adapter',
    );
  }
}

for (const file of await sourceFiles(path.join(root, 'frontend/src/features'))) {
  const relative = path.relative(path.join(root, 'frontend/src'), file).split(path.sep).join('/');
  const source = await readFile(file, 'utf8');
  assertRule(file, source, /\bany\b/, 'frontend source must use explicit types instead of any');
  const importerFeature = relative.split('/')[1];
  for (const [, specifier] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    if (!specifier.startsWith('.')) continue;
    const target = path.normalize(path.join(path.dirname(file), specifier));
    const targetRelative = path
      .relative(path.join(root, 'frontend/src'), target)
      .split(path.sep)
      .join('/');
    const targetFeature = targetRelative.split('/')[1];
    if (
      targetRelative.startsWith('features/') &&
      targetFeature !== importerFeature &&
      importerFeature !== 'landing'
    ) {
      violations.push(`${relative}: feature imports sibling feature ${targetRelative}`);
    }
  }
}

if (violations.length) {
  console.error('Architecture checks failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('Architecture checks passed.');
}
