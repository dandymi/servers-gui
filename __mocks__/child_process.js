const { exec } = require('child_process');

// We'll mock the exec function to return a promise that resolves or rejects based on the command.
const mockExec = (command) => {
  return new Promise((resolve, reject) => {
    // We'll simulate different commands
    if (command.includes('start')) {
      // Simulate starting a server
      resolve({ stdout: 'Server started', stderr: '' });
    } else if (command.includes('stop')) {
      // Simulate stopping a server
      resolve({ stdout: 'Server stopped', stderr: '' });
    } else if (command.includes('status')) {
      // Simulate status: running or not
      // We'll alternate or base on something? For simplicity, let's say it's running if the script name contains 'running'
      if (command.includes('running')) {
        resolve({ stdout: 'Server is running', stderr: '' });
      } else {
        resolve({ stdout: 'Server is not running', stderr: '' });
      }
    } else {
      // Default: resolve with empty output
      resolve({ stdout: '', stderr: '' });
    }
  });
};

module.exports = {
  exec: mockExec,
};
