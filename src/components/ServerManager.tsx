import React, { useState, useRef } from 'react';

/**
 * Properties for the ServerManager component.
 * Currently no props are used, but this interface allows for future extension.
 */
interface ServerManagerProps {
  // No props for now, but we can extend later
}

/**
 * Represents a server being managed by the application.
 */
interface Server {
  /** Unique identifier for the server (timestamp-based) */
  id: number;
  /** Display name of the server (typically the filename) */
  title: string;
  /** Filesystem path to the server script */
  script: string;
  /** Current running state of the server */
  running: boolean;
}

/**
 * Main component for managing server processes.
 * Provides UI for adding servers via file chooser and controlling their state.
 * Features light brown background (#f5deb3) layout with server rows containing:
 * title, script path, start/stop/remove buttons, and running status indicator.
 */
const ServerManager: React.FC<ServerManagerProps> = () => {
  /** Array of servers currently being managed */
  const [servers, setServers] = useState<Server[]>([]);
  /** Reference to the hidden file input element for server script selection */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Triggers the file chooser dialog when the "Add Server" button is clicked.
   * The input element is hidden and activated programmatically.
   */
  const handleAddServer = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles file selection from the file chooser dialog.
   * Reads the selected file as text and adds it as a new server entry.
   * @param e - React change event from the file input element
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const script = event.target?.result as string;
      const newServer: Server = {
        id: Date.now(),
        title: file.name,
        script,
        running: false,
      };
      setServers(prev => [...prev, newServer]);
    };
    reader.readAsText(file);
    // Reset the input to allow same file to be selected again
    e.target.value = '';
  };

  /**
   * Updates the running state of a server to true (started).
   * In a production implementation, this would invoke Electron IPC to start the actual process.
   * @param id - Unique identifier of the server to start
   */
  const handleStartServer = (id: number) => {
    setServers(prev =>
      prev.map(server =>
        server.id === id ? { ...server, running: true } : server
      )
    );
    // In a real app, you would start the server process here via IPC
    console.log(`Starting server ${id}`);
    // For now, we'll just update the UI - in production this would call electronAPI
  };

  /**
   * Updates the running state of a server to false (stopped).
   * In a production implementation, this would invoke Electron IPC to stop the actual process.
   * @param id - Unique identifier of the server to stop
   */
  const handleStopServer = (id: number) => {
    setServers(prev =>
      prev.map(server =>
        server.id === id ? { ...server, running: false } : server
      )
    );
    // In a real app, you would stop the server process here via IPC
    console.log(`Stopping server ${id}`);
  };

  /**
   * Removes a server from the management list.
   * @param id - Unique identifier of the server to remove
   */
  const handleRemoveServer = (id: number) => {
    setServers(prev => prev.filter(server => server.id !== id));
  };

  return (
    <div style={{ backgroundColor: '#f5deb3', minHeight: '100vh', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={handleAddServer} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Add Server
        </button>
        <input
          type="file"
          ref={fileInputRef}
          data-testid="file-input"
          style={{ display: 'none' }}
          accept=".txt,.js,.ts,.json,.sh"
          onChange={handleFileChange}
        />
      </div>

      {servers.length === 0 ? (
        <p>No servers added yet.</p>
      ) : (
        <div>
          {servers.map(server => (
            <div
              key={server.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #ddd',
              }}
            >
              {/* Title */}
              <div style={{ flex: '1', minWidth: '150px' }}>
                <strong>{server.title}</strong>
              </div>
              {/* Script */}
              <div style={{ flex: '2', minWidth: '200px', fontFamily: 'monospace', fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {server.script.length > 50 ? server.script.substring(0, 50) + '...' : server.script}
              </div>
              {/* Start Button */}
              <button
                onClick={() => handleStartServer(server.id)}
                disabled={server.running}
                style={{ margin: '0 5px', padding: '6px 12px' }}
              >
                Start
              </button>
              {/* Stop Button */}
              <button
                onClick={() => handleStopServer(server.id)}
                disabled={!server.running}
                style={{ margin: '0 5px', padding: '6px 12px' }}
              >
                Stop
              </button>
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveServer(server.id)}
                style={{ margin: '0 5px', padding: '6px 12px', backgroundColor: '#ff6b6b', color: 'white', border: 'none' }}
              >
                Remove
              </button>
              {/* Running Light */}
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: server.running ? '#4caf50' : '#f44336',
                  marginLeft: 'auto',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServerManager;