/**
 * @fileoverview Test suite for the main.ts file.
 * Tests the core functionality of the Electron main process.
 */

// We need to mock the modules that main.ts depends on before importing it
jest.mock('fs');
jest.mock('js-yaml');
jest.mock('child_process');

// Now we can import the functions we want to test
import { readServers, writeServers, startServer, stopServer, getServerStatus } from '../main';

describe('main.ts functions', () => {
  const fs = require('fs');
  const yaml = require('js-yaml');
  const { exec } = require('child_process');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readServers', () => {
    it('should return an empty array when servers.yml does not exist', () => {
      // Mock fs.readFileSync to throw an error (file not found)
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      const result = readServers();
      expect(result).toEqual([]);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('servers.yml'),
        'utf8'
      );
    });

    it('should return parsed servers when servers.yml is valid', () => {
      // Mock fs.readFileSync to return some YAML content
      fs.readFileSync.mockReturnValue('servers:\n  - name: "test"\n    script: "/path/to/test.sh"');
      // Mock js-yaml.load to return the parsed object
      yaml.load.mockReturnValue({
        servers: [
          { name: 'test', script: '/path/to/test.sh' }
        ]
      });

      const result = readServers();
      expect(result).toEqual([
        { name: 'test', script: '/path/to/test.sh' }
      ]);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('servers.yml'),
        'utf8'
      );
      expect(yaml.load).toHaveBeenCalledWith(
        'servers:\n  - name: "test"\n    script: "/path/to/test.sh"'
      );
    });

    it('should return an empty array when servers.yml is invalid YAML', () => {
      // Mock fs.readFileSync to return some content
      fs.readFileSync.mockReturnValue('invalid: yaml: :');
      // Mock js-yaml.load to throw an error
      yaml.load.mockImplementation(() => {
        throw new Error('YAML parsing error');
      });

      const result = readServers();
      expect(result).toEqual([]);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('servers.yml'),
        'utf8'
      );
      expect(yaml.load).toHaveBeenCalledWith(
        'invalid: yaml: :'
      );
    });

    it('should return an empty array when parsed object has no servers property', () => {
      // Mock fs.readFileSync to return some content
      fs.readFileSync.mockReturnValue('some: other: data');
      // Mock js-yaml.load to return an object without servers property
      yaml.load.mockReturnValue({ other: 'data' });

      const result = readServers();
      expect(result).toEqual([]);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('servers.yml'),
        'utf8'
      );
      expect(yaml.load).toHaveBeenCalledWith(
        'some: other: data'
      );
    });
  });

  describe('writeServers', () => {
    it('should return true when writing is successful', () => {
      // Mock fs.writeFileSync to do nothing (success)
      fs.writeFileSync.mockImplementation(() => {});

      const testServers = [
        { name: 'test1', script: '/path/to/test1.sh' },
        { name: 'test2', script: '/path/to/test2.sh' }
      ];
      const result = writeServers(testServers);
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('servers.yml'),
        expect.any(String),
        'utf8'
      );
    });

    it('should return false when writing fails', () => {
      // Mock fs.writeFileSync to throw an error
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = writeServers([]);
      expect(result).toBe(false);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('servers.yml'),
        expect.any(String),
        'utf8'
      );
    });
  });

  describe('startServer', () => {
    it('should resolve when the server starts successfully', async () => {
      // Mock exec to resolve with success
      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback(null, 'Server started', '');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      const result = await startServer('/path/to/script.sh');
      expect(result).toEqual({ stdout: 'Server started', stderr: '' });
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh start', expect.any(Function));
    });

    it('should resolve when the server reports already running', async () => {
      // Mock exec to resolve with the specific error condition for already running
      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Command failed');
        error.code = 1;
        callback(error, 'Server is already running', '');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      const result = await startServer('/path/to/script.sh');
      expect(result).toEqual({ stdout: 'Server is already running', stderr: '' });
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh start', expect.any(Function));
    });

    it('should reject when the server fails to start', async () => {
      // Mock exec to reject with an error
      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Failed to start');
        callback(error, '', 'Something went wrong');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      await expect(startServer('/path/to/script.sh')).rejects.toEqual(
        expect.objectContaining({ error: 'Failed to start', stderr: 'Something went wrong' })
      );
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh start', expect.any(Function));
    });
  });

  describe('stopServer', () => {
    it('should resolve when the server stops successfully', async () => {
      // Mock exec to resolve with success
      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback(null, 'Server stopped', '');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      const result = await stopServer('/path/to/script.sh');
      expect(result).toEqual({ stdout: 'Server stopped', stderr: '' });
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh stop', expect.any(Function));
    });

    it('should resolve when the server reports not running', async () => {
      // Mock exec to resolve with the specific error condition for not running
      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Command failed');
        error.code = 1;
        callback(error, 'Server is not running', '');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      const result = await stopServer('/path/to/script.sh');
      expect(result).toEqual({ stdout: 'Server is not running', stderr: '' });
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh stop', expect.any(Function));
    });

    it('should reject when the server fails to stop', async () => {
      // Mock exec to reject with an error
      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Failed to stop');
        callback(error, '', 'Something went wrong');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      await expect(stopServer('/path/to/script.sh')).rejects.toEqual(
        expect.objectContaining({ error: 'Failed to stop', stderr: 'Something went wrong' })
      );
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh stop', expect.any(Function));
    });
  });

  describe('getServerStatus', () => {
    it('should resolve with status output when successful', async () => {
      // Mock exec to resolve with success
      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback(null, 'Server is running (PID: 1234)', '');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      const result = await getServerStatus('/path/to/script.sh');
      expect(result).toEqual({ stdout: 'Server is running (PID: 1234)', stderr: '', code: 0 });
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh status', expect.any(Function));
    });

    it('should resolve with code from error when error occurs but stdout/stderr present', async () => {
      // Mock exec to resolve with an error but with output
      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Command failed');
        error.code = 3;
        callback(error, 'Some output', 'Some error');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      const result = await getServerStatus('/path/to/script.sh');
      expect(result).toEqual({ stdout: 'Some output', stderr: 'Some error', code: 3 });
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh status', expect.any(Function));
    });

    it('should reject when error occurs and no output', async () => {
      // Mock exec to reject with an error and no output
      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Command failed');
        callback(error, '', '');
        // Return a mock ChildProcess
        return {
          pid: 0,
          killed: false,
          send: jest.fn(),
          disconnect: jest.fn(),
          ref: jest.fn(),
          unref: jest.fn(),
          stderr: null,
          stdin: null,
          stdout: null,
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
          setEncoding: jest.fn(),
          stdin: { setEncoding: jest.fn(), write: jest.fn(), end: jest.fn(), destroy: jest.fn(), pause: jest.fn(), resume: jest.fn() },
          stdout: { on: jest.fn(), once: jest.fn() },
          stderr: { on: jest.fn(), once: jest.fn() },
        } as any;
      });

      await expect(getServerStatus('/path/to/script.sh')).rejects.toEqual(
        expect.objectContaining({ error: 'Command failed' })
      );
      expect(exec).toHaveBeenCalledWith('/path/to/script.sh status', expect.any(Function));
    });
  });
});