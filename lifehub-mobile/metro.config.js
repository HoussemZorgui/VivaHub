const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolution to fix Axios identifying itself as Node.js
config.resolver.extraNodeModules = {
    crypto: require.resolve('crypto-js'), // Fallback if someone tries to import crypto
};

module.exports = config;
