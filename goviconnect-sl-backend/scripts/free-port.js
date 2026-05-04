const { execFileSync } = require('child_process');
const os = require('os');

const port = Number(process.argv[2] || process.env.PORT || 5000);
const currentPid = process.pid;

if (!Number.isInteger(port) || port <= 0) {
  console.error(`Invalid port: ${process.argv[2]}`);
  process.exit(1);
}

const run = (command, args) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const findWindowsPids = () => {
  const output = run('netstat', ['-ano', '-p', 'tcp']);
  return unique(
    output
      .split(/\r?\n/)
      .filter((line) => line.includes(`:${port}`) && /\bLISTENING\b/i.test(line))
      .map((line) => line.trim().split(/\s+/).pop())
      .filter((pid) => pid && Number(pid) !== currentPid)
  );
};

const findUnixPids = () => {
  try {
    return unique(
      run('lsof', ['-ti', `tcp:${port}`])
        .split(/\r?\n/)
        .map((pid) => pid.trim())
        .filter((pid) => pid && Number(pid) !== currentPid)
    );
  } catch {
    return [];
  }
};

try {
  const isWindows = os.platform() === 'win32';
  const pids = isWindows ? findWindowsPids() : findUnixPids();

  if (pids.length === 0) {
    process.exit(0);
  }

  for (const pid of pids) {
    if (isWindows) {
      execFileSync('taskkill', ['/PID', pid, '/F', '/T'], { stdio: 'ignore' });
    } else {
      execFileSync('kill', ['-9', pid], { stdio: 'ignore' });
    }
    console.log(`Freed port ${port} by stopping process ${pid}`);
  }
} catch (error) {
  console.error(`Could not free port ${port}: ${error.message}`);
  process.exit(1);
}
