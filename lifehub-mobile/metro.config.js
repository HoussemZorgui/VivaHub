const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    crypto: require.resolve('crypto-js'),
    url: require.resolve('url'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    path: require.resolve('path-browserify'),
    util: require.resolve('util'),
    process: require.resolve('process/browser'),
};

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
