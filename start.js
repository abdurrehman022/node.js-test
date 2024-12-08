const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const servers = [
  { id: '1', name: 'Callback-based Server', file: 'callback-server.js' },
  { id: '2', name: 'Async/Await Server', file: 'async-server.js' },
  { id: '3', name: 'Promise-based Server', file: 'promises-server.js' },
  { id: '4', name: 'Stream-based Server', file: 'streams-server.js' }
];

// Path to local nodemon
const nodemonBin = path.join(
  __dirname,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'nodemon.cmd' : 'nodemon'
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Verify nodemon exists
if (!fs.existsSync(nodemonBin)) {
  console.error('Nodemon not found. Please run: npm install');
  process.exit(1);
}

console.log('\nSelect Server to Start:');
servers.forEach(server => {
  console.log(`${server.id}. ${server.name} (${server.file})`);
});

rl.question('\nEnter choice (1-4): ', (choice) => {
  const selected = servers.find(s => s.id === choice);
  const serverFile = selected ? selected.file : servers[0].file;

  if (!selected) {
    console.log(`Invalid choice. Starting default ${servers[0].file}`);
  }

  // Verify server file exists
  if (!fs.existsSync(path.join(__dirname, serverFile))) {
    console.error(`Error: ${serverFile} not found!`);
    rl.close();
    process.exit(1);
  }

  const nodemon = spawn(nodemonBin, [serverFile], { 
    stdio: 'inherit',
    shell: true
  });
  
  nodemon.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  rl.close();
});