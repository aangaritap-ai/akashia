// Neon's free-tier database auto-suspends after a few minutes idle, and the
// first connection after that can take longer than Prisma's default timeout
// to wake it back up. That alone has failed several production builds with
// a P1002 "database server was reached but timed out" error even though
// nothing was wrong with the code. Retrying a few times with a short delay
// gives the database time to wake up instead of failing the whole deploy.
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 5;
const DELAY_MS = 8000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      return;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        console.error(
          `prisma migrate deploy failed after ${MAX_ATTEMPTS} attempts.`
        );
        process.exit(1);
      }
      console.warn(
        `prisma migrate deploy failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${DELAY_MS / 1000}s...`
      );
      await sleep(DELAY_MS);
    }
  }
}

main();
