// Mock fs module
const mockFs = {
  readFileSync: (path, encoding) => {
    // Return a default servers.yml content if the path matches
    if (path.endsWith('servers.yml')) {
      return 'servers: []';
    }
    // For other files, return empty string or throw error if needed
    return '';
  },
  writeFileSync: (path, data, encoding) => {
    // Do nothing, just pretend to write
    return undefined;
  },
};

module.exports = mockFs;
