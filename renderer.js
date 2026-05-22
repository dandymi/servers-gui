// Renderer logic for the Servers GUI
document.addEventListener('DOMContentLoaded', async () => {
  const serverList = document.getElementById('server-list');
  const addServerBtn = document.getElementById('add-server');

  // Function to create a server item element
  function createServerItem(server, index) {
    const div = document.createElement('div');
    div.className = 'server-item';
    div.innerHTML = `
      <span class="server-name">${server.name}</span>
      <div class="indicator" id="indicator-${index}"></div>
      <button class="toggle-btn">Start</button>
      <button class="remove-btn">Remove</button>
      <input type="text" class="script-input" placeholder="Script path (e.g., ./start-stop.sh)" value="${server.script}">
    `;
    return div;
  }

  // Function to render the server list
  async function renderServers() {
    const servers = await window.electronAPI.readServers();
    serverList.innerHTML = '';
    for (let [index, server] of servers.entries()) {
      const serverItem = createServerItem(server, index);
      serverList.appendChild(serverItem);
      
      // Get elements
      const indicator = serverItem.querySelector(`#indicator-${index}`);
      const toggleBtn = serverItem.querySelector('.toggle-btn');
      const removeBtn = serverItem.querySelector('.remove-btn');
      const scriptInput = serverItem.querySelector('.script-input');
      const nameSpan = serverItem.querySelector('.server-name');

      // Update indicator based on current status
      updateIndicator(indicator, false); // default to off, will update after status check

      // Check initial status
      try {
        const result = await window.electronAPI.getServerStatus(server.script);
        // Assuming status script returns 0 when running, non-zero when not, or output contains 'running'
        const isRunning = result.code === 0 || (result.stdout && result.stdout.includes('running'));
        updateIndicator(indicator, isRunning);
        toggleBtn.textContent = isRunning ? 'Stop' : 'Start';
      } catch (error) {
        console.error('Failed to get server status:', error);
        updateIndicator(indicator, false);
        toggleBtn.textContent = 'Start';
      }

      // Toggle button
      toggleBtn.addEventListener('click', async () => {
        const isRunning = toggleBtn.textContent === 'Stop';
        if (isRunning) {
          try {
            await window.electronAPI.stopServer(server.script);
            updateIndicator(indicator, false);
            toggleBtn.textContent = 'Start';
          } catch (error) {
            console.error('Failed to stop server:', error);
          }
        } else {
          try {
            await window.electronAPI.startServer(server.script);
            updateIndicator(indicator, true);
            toggleBtn.textContent = 'Stop';
          } catch (error) {
            console.error('Failed to start server:', error);
          }
        }
      });

      // Remove button
      removeBtn.addEventListener('click', async () => {
        if (confirm(`Remove server "${server.name}"?`)) {
          try {
            const servers = await window.electronAPI.readServers();
            servers.splice(index, 1);
            await window.electronAPI.writeServers(servers);
            renderServers();
          } catch (error) {
            console.error('Failed to remove server:', error);
          }
        }
      });

      // Script input change
      scriptInput.addEventListener('change', async () => {
        const newScript = scriptInput.value.trim();
        if (newScript) {
          try {
            const servers = await window.electronAPI.readServers();
            servers[index].script = newScript;
            await window.electronAPI.writeServers(servers);
          } catch (error) {
            console.error('Failed to update script:', error);
          }
        }
      });

      // Name span double-click to edit (optional)
      nameSpan.addEventListener('dblclick', () => {
        const newName = prompt('Enter new server name:', server.name);
        if (newName !== null && newName.trim() !== '') {
          (async () => {
            try {
              const servers = await window.electronAPI.readServers();
              servers[index].name = newName.trim();
              await window.electronAPI.writeServers(servers);
              renderServers();
            } catch (error) {
              console.error('Failed to update server name:', error);
            }
          })();
        }
      });
    }
  }

  // Update indicator (round, green when on, grey when off)
  function updateIndicator(indicatorElement, isOn) {
    indicatorElement.className = 'indicator';
    if (isOn) {
      indicatorElement.classList.add('on');
    } else {
      indicatorElement.classList.add('off');
    }
  }

  // Add server button
  addServerBtn.addEventListener('click', async () => {
    try {
      const servers = await window.electronAPI.readServers();
      servers.push({
        name: 'New Server',
        script: './start-stop.sh',
        autostart: false
      });
      await window.electronAPI.writeServers(servers);
      renderServers();
    } catch (error) {
      console.error('Failed to add server:', error);
    }
  });

  // Initial render
  await renderServers();
});