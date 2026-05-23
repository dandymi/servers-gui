// Mock js-yaml
const mockYaml = {
  load: (data) => {
    // If data is a string, try to parse it as YAML (very simple mock)
    // For simplicity, we'll return an object with a servers array if the string contains 'servers:'
    if (typeof data === 'string' && data.includes('servers:')) {
      return { servers: [] };
    }
    // Otherwise, return an empty object
    return {};
  },
  dump: (obj) => {
    // Return a simple YAML string
    return 'servers: []';
  },
};

module.exports = mockYaml;
