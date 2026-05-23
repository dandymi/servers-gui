// src/serverService.ts
import * as path from 'path'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

/**
 * Represents a server configuration.
 */
export interface Server {
  /** Human-readable name of the server */
  name: string
  /** Path to the server script */
  script: string
  /** Whether to start the server automatically on app launch */
  autostart?: boolean
}

/**
 * Result of executing a server script command.
 */
export interface ExecResult {
  /** Standard output from the command */
  stdout: string
  /** Standard error from the command */
  stderr: string
}

/**
 * Reads and parses the servers.yml configuration file.
 * @returns Array of Server objects (empty array if file doesn't exist or is invalid)
 */
export function readServers (): Server[] {
  try {
    const filePath = path.join(__dirname, '../servers.yml')
    const data = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.load(data)
    // Check if parsed is an object and has a servers property
    if (parsed && typeof parsed === 'object' && 'servers' in parsed) {
      return parsed.servers as Server[]
    }
    return [] as Server[]
  } catch (error) {
    console.error('Error reading servers.yml:', error)
    return [] as Server[]
  }
}

/**
 * Writes the server array to servers.yml.
 * @param servers Array of Server objects to write
 * @returns True if successful, false otherwise
 */
export function writeServers (servers: Server[]): boolean {
  try {
    const filePath = path.join(__dirname, '../servers.yml')
    const data = yaml.dump({ servers })
    fs.writeFileSync(filePath, data, 'utf8')
    return true
  } catch (error) {
    console.error('Error writing servers.yml:', error)
    return false
  }
}

/**
 * Starts a server script.
 * @param script Path to the server script
 * @returns Promise resolving to command execution result
 */
export function startServer (script: string): Promise<ExecResult> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} start`, (error: Error | null, stdout: string, stderr: string) => {
      // If the script reports already running, treat as success
      if (error && typeof (error as { code?: number | string }).code === 'number' && (error as { code?: number | string }).code === 1 && !stderr && stdout.includes('Server is already running')) {
        resolve({ stdout, stderr })
      } else if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

/**
 * Stops a server script.
 * @param script Path to the server script
 * @returns Promise resolving to command execution result
 */
export function stopServer (script: string): Promise<ExecResult> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} stop`, (error: Error | null, stdout: string, stderr: string) => {
      // If the script reports not running (no PID file), treat as success
      if (error && typeof (error as { code?: number | string }).code === 'number' && (error as { code?: number | string }).code === 1 && !stderr && stdout.includes('Server is not running')) {
        resolve({ stdout, stderr })
      } else if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

/**
 * Gets the status of a server script.
 * @param script Path to the server script
 * @returns Promise resolving to status object with stdout, stderr, and exit code
 */
export function getServerStatus (script: string): Promise<{ stdout: string; stderr: string; code: number }> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} status`, (error: Error | null, stdout: string, stderr: string) => {
      // Some scripts might return non-zero for status but still provide output
      if (error && !stdout && !stderr) {
        reject({ error: error.message })
      } else {
        const code = (error as { code?: number | string })?.code ?? 0
        resolve({ stdout, stderr, code: typeof code === 'number' ? code : 0 })
      }
    })
  })
}