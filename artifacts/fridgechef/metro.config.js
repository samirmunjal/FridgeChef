const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Include workspace lib packages so Metro can resolve their internal source files
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, "../../lib"),
];

// Allow symlinks (required for pnpm workspace packages)
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
