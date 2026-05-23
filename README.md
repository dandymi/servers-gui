# Servers GUI

A desktop application for managing and monitoring server processes built with Electron, React, and TypeScript.

## Features

- Light brown theme (#f5deb3) for easy viewing
- Add server scripts via file chooser (top-left button)
- Server management: start, stop, remove processes
- Visual running status indicator (green/red light)
- YAML-based server configuration persistence
- Auto-start configured servers on application launch
- Cross-platform Linux distribution (AppImage and Debian package)

## Installation

### Pre-built Binaries (Recommended)

Download the latest release from the [GitHub Releases page](https://github.com/yourusername/servers-gui/releases):

1. **AppImage** (universal Linux):
   ```bash
   chmod +x Servers-GUI-1.0.0.AppImage
   ./Servers-GUI-1.0.0.AppImage
   ```

2. **Debian Package** (Debian/Ubuntu):
   ```bash
   sudo dpkg -i servers-gui_1.0.0_amd64.deb
   # Then launch from menu or run: servers-gui
   ```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/servers-gui.git
cd servers-gui

# Install dependencies
npm install

# Run in development mode
npm start
```

## Usage

### Adding a Server

1. Click the **"Add Server"** button in the top-left corner
2. Select a server script file from your filesystem (supports .txt, .js, .ts, .json, .sh)
3. The server will appear in the list with its filename as the title

### Managing Servers

Each server row displays:
- **Title**: Server name (filename)
- **Script**: Path to the server script (truncated if long)
- **Start Button**: Starts the server process (disabled when running)
- **Stop Button**: Stops the server process (disabled when stopped)
- **Remove Button**: Deletes the server from the list
- **Running Light**: 
  - ● Green: Server is running
  - ● Red: Server is stopped

### Server Script Format

The application expects server scripts to support three commands:
- `script start` - Starts the server process
- `script stop` - Stops the server process
- `script status` - Returns server status (optional)

Example server script (`myserver.sh`):
```bash
#!/bin/bash
PIDFILE="/tmp/myserver.pid"

case "$1" in
  start)
    echo "Starting server..."
    # Your server start command here
    nohup node myserver.js > server.log 2>&1 &
    echo $! > $PIDFILE
    ;;
  stop)
    echo "Stopping server..."
    if [ -f $PIDFILE ]; then
      kill $(cat $PIDFILE)
      rm $PIDFILE
    else
      echo "Server is not running"
      exit 1
    fi
    ;;
  status)
    if [ -f $PIDFILE ]; then
      echo "Server is running (PID: $(cat $PIDFILE))"
    else
      echo "Server is not running"
      exit 1
    fi
    ;;
esac
```

## Configuration

Server configurations are stored in `servers.yml` in the application directory:

```yaml
servers:
  - name: "My Server"
    script: "/path/to/myserver.sh"
    autostart: true
```

The application automatically reads this file on startup and writes changes when servers are added/removed.

## Building from Source

```bash
# Install build dependencies
npm install

# Build the application
npm run build

# Create distributable packages
npm run dist
```

The build artifacts will be available in the `release/` directory:
- `Servers GUI-1.0.0.AppImage`
- `servers-gui_1.0.0_amd64.deb`

## Project Structure

```
servers-gui/
├── src/
│   ├── main.ts             # Electron main process
│   ├── components/
│   │   └── ServerManager.tsx # React component for server management
│   ├── renderer.tsx        # React entry point
│   ├── preload.js          # Electron preload script
│   └── index.html          # Main HTML file
├── servers.yml             # Server configuration (auto-generated)
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── release/                # Built distributables (AppImage, .deb)
```

## Code Documentation

### Main Process (`src/main.ts`)

#### Interfaces
- `Server`: Defines server configuration (`name`, `script`, optional `autostart`)
- `ExecResult`: Contains command execution results (`stdout`, `stderr`)

#### Functions
- `createWindow()`: Creates and configures the Electron BrowserWindow
- `readServers()`: Reads and parses `servers.yml` into Server[]
- `writeServers(servers: Server[])`: Writes server array to `servers.yml`
- `startServer(script: string)`: Executes `{script} start` via child_process
- `stopServer(script: string)`: Executes `{script} stop` via child_process
- `getServerStatus(script: string)`: Executes `{script} status` via child_process

#### IPC Handlers
- `read-servers`: Returns current server list
- `write-servers`: Saves updated server list
- `start-server`: Starts a server script
- `stop-server`: Stops a server script
- `get-server-status`: Gets status of a server script

### Renderer Process (`src/renderer.tsx`)

- Entry point for React application
- Renders `<ServerManager />` component into root DOM element

### ServerManager Component (`src/components/ServerManager.tsx`)

#### Props
- `ServerManagerProps`: Currently empty (extensible)

#### State
- `servers: Server[]`: Array of server objects being managed
- `fileInputRef`: Reference to hidden file input element

#### Server Interface
- `id`: Unique identifier (timestamp)
- `title`: Server display name (filename)
- `script`: Path to server script
- `running`: Boolean status indicator

#### Event Handlers
- `handleAddServer()`: Triggers file chooser dialog
- `handleFileChange(e)`: Processes selected file and adds new server
- `handleStartServer(id)`: Updates server running state to true
- `handleStopServer(id)`: Updates server running state to false
- `handleRemoveServer(id)`: Removes server from state

#### Styles
- Background color: `#f5deb3` (light brown)
- Responsive flex layout for server rows
- Visual running indicator (green/red circle)
- Disabled states for start/stop buttons based on running status

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request