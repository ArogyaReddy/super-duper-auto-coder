// env-config.js
// Usage: require('./env-config').getEnvConfig('QAFIT')

const configs = {
  QAFIT: {
    baseURL: 'https://runtoolapiportal-qafit.nj.adp.com',
  },
  IAT: {
    baseURL: 'https://runtoolapiportal-iat.nj.adp.com',
  },
};

module.exports = {
  getEnvConfig: (env) => configs[env] || configs.QAFIT,
};
