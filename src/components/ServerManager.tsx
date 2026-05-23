import React, { useState, useRef } from 'react';

interface Server {
  id: number;
  title: string;
  script: string;
  running: boolean;
}

const ServerManager: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddServer = () => {
    fileInputRef.current?.click();
  };

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

  const handleStopServer = (id: number) => {
    setServers(prev =>
      prev.map(server =>
        server.id === id ? { ...server, running: false } : server
      )
    );
    // In a real app, you would stop the server process here via IPC
    console.log(`Stopping server ${id}`);
  };

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