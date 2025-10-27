import { spawnSync } from 'node:child_process'
import { existsSync, unlinkSync } from 'node:fs'

// Force an isolated SQLite DB for tests
process.env.DATABASE_URL = 'file:./test.db'

// Always start with a clean DB for quiet, deterministic test runs
try {
  if (existsSync('test.db')) unlinkSync('test.db')
} catch {}

// Ensure DB schema is applied before tests that use Prisma (idempotent)
const prismaBin = process.platform === 'win32' ? '.\\node_modules\\.bin\\prisma.cmd' : './node_modules/.bin/prisma'

function runPush(shell: boolean) {
  const res = spawnSync(prismaBin, ['db', 'push', '--schema', 'prisma/schema.prisma'], {
    stdio: 'pipe',
    shell,
    env: { ...process.env },
  })
  return res.status === 0
}

if (!runPush(false) && !runPush(true)) {
  throw new Error('Failed to apply Prisma schema for tests')
}
