import '@testing-library/jest-dom/extend-expect';
import { readServers, writeServers, startServer, stopServer, getServerStatus } from './serverService';

// Mock the modules
jest.mock('fs');
jest.mock('js-yaml');
jest.mock('child_process');

describe('serverService', () => {
  const fs = require('fs');
  const yaml = require('js-yaml');
  const { exec } = require('child_process');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readServers', () => {
    it('returns empty array on file not found', () => {
      fs.readFileSync.mockImplementation(() => { throw new Error(); });
      expect(readServers()).toEqual([]);
    });

    it('returns parsed servers', () => {
      fs.readFileSync.mockReturnValue('servers:\n- name: test\n  script: test.sh');
      yaml.load.mockReturnValue({ servers: [{ name: 'test', script: 'test.sh' }] });
      expect(readServers()).toEqual([{ name: 'test', script: 'test.sh' }]);
    });

    it('returns empty array on invalid yaml', () => {
      fs.readFileSync.mockReturnValue('invalid');
      yaml.load.mockImplementation(() => { throw new Error(); });
      expect(readServers()).toEqual([]);
    });

    it('returns empty array when no servers property', () => {
      fs.readFileSync.mockReturnValue('other: data');
      yaml.load.mockReturnValue({ other: 'data' });
      expect(readServers()).toEqual([]);
    });
  });

  describe('writeServers', () => {
    it('returns true on success', () => {
      fs.writeFileSync.mockImplementation(() => {});
      expect(writeServers([])).toBe(true);
    });

    it('returns false on failure', () => {
      fs.writeFileSync.mockImplementation(() => { throw new Error(); });
      expect(writeServers([])).toBe(false);
    });
  });

  describe('startServer', () => {
    it('resolves on success', async () => {
      (exec as jest.Mock).mockImplementation((command, cb) => cb(null, 'out', ''));
      await expect(startServer('test.sh')).resolves.toEqual({ stdout: 'out', stderr: '' });
    });

    it('resolves when already running (special case)', async () => {
      const error = new Error() as any;
      error.code = 1;
      error.message = '';
      (exec as jest.Mock).mockImplementation((command, cb) => cb(error, 'Server is already running', ''));
      await expect(startServer('test.sh')).resolves.toEqual({ stdout: 'Server is already running', stderr: '' });
    });

    it('rejects on error', async () => {
      const error = new Error('failed') as any;
      error.code = 1;
      (exec as jest.Mock).mockImplementation((command, cb) => cb(error, '', 'stderr'));
      await expect(startServer('test.sh')).rejects.toEqual({ error: 'failed', stderr: 'stderr' });
    });
  });

  describe('stopServer', () => {
    it('resolves on success', async () => {
      (exec as jest.Mock).mockImplementation((command, cb) => cb(null, 'out', ''));
      await expect(stopServer('test.sh')).resolves.toEqual({ stdout: 'out', stderr: '' });
    });

    it('resolves when not running (special case)', async () => {
      const error = new Error() as any;
      error.code = 1;
      error.message = '';
      (exec as jest.Mock).mockImplementation((command, cb) => cb(error, 'Server is not running', ''));
      await expect(stopServer('test.sh')).resolves.toEqual({ stdout: 'Server is not running', stderr: '' });
    });

    it('rejects on error', async () => {
      const error = new Error('failed') as any;
      error.code = 1;
      (exec as jest.Mock).mockImplementation((command, cb) => cb(error, '', 'stderr'));
      await expect(stopServer('test.sh')).rejects.toEqual({ error: 'failed', stderr: 'stderr' });
    });
  });

  describe('getServerStatus', () => {
    it('resolves on success', async () => {
      (exec as jest.Mock).mockImplementation((command, cb) => cb(null, 'out', ''));
      await expect(getServerStatus('test.sh')).resolves.toEqual({ stdout: 'out', stderr: '', code: 0 });
    });

    it('resolves with error code when error but output exists', async () => {
      const error = new Error() as any;
      error.code = 3;
      (exec as jest.Mock).mockImplementation((command, cb) => cb(error, 'out', 'err'));
      await expect(getServerStatus('test.sh')).resolves.toEqual({ stdout: 'out', stderr: 'err', code: 3 });
    });

    it('rejects when error and no output', async () => {
      const error = new Error('failed') as any;
      error.code = 3;
      (exec as jest.Mock).mockImplementation((command, cb) => cb(error, '', ''));
      await expect(getServerStatus('test.sh')).rejects.toEqual({ error: 'failed' });
    });
  });
});