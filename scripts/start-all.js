import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
    server: '\x1b[36m', // Cyan
    client: '\x1b[32m', // Green
    prisma: '\x1b[35m', // Magenta
    reset: '\x1b[0m'
};

function runCommand(command, args, name, color) {
    const cmd = spawn(command, args, {
        shell: true,
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
    });

    cmd.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.log(`${color}[${name}]${colors.reset} ${line.trim()}`);
            }
        });
    });

    cmd.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.error(`${color}[${name}]${colors.reset} ${line.trim()}`);
            }
        });
    });

    return cmd;
}

console.log('🚀 Starting Swiss CV Builder Development Environment...');

// 1. Run Prisma Generate & Migrate (Wait for completion)
console.log('📦 Setting up database...');
const prisma = spawn('npx', ['prisma', 'migrate', 'dev', '--name', 'init'], {
    shell: true,
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
});

prisma.on('close', (code) => {
    if (code !== 0) {
        console.error('❌ Database setup failed. Continuing anyway (might be already running)...');
    } else {
        console.log('✅ Database ready.');
    }

    // 2. Start Backend
    const server = runCommand('npx', ['tsx', '--watch', 'server/index.ts'], 'SERVER', colors.server);

    // 3. Start Frontend
    const client = runCommand('npx', ['vite'], 'CLIENT', colors.client);

    // Cleanup on exit
    const cleanup = () => {
        console.log('\n🛑 Shutting down...');
        server.kill();
        client.kill();
        process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
});
