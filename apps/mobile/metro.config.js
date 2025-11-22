const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root directory (two levels up from apps/mobile)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Configure Metro to resolve packages from the monorepo workspace
config.watchFolders = [workspaceRoot];

// Resolve node_modules from workspace root and mobile app
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// Add workspace package resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ensure Metro can resolve workspace packages
config.resolver.extraNodeModules = {
  '@12-step-companion/types': path.resolve(workspaceRoot, 'packages/types/src'),
};

// Note: Expo's default config already includes 'ts' and 'tsx' in sourceExts
// TypeScript path aliases are handled by tsconfig.json paths

module.exports = config;

