const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'LyricsPro',
    executableName: 'lyricspro',
    asar: false, // Desabilitar ASAR para facilitar debug
    icon: path.join(__dirname, 'public', 'icon'),
    extraResources: [],
    ignore: [
      /^\/\.git/,
      /^\/node_modules\/(?!(@prisma|\.prisma))/,
      /^\/out/,
      /^\/\.next\/cache/,
      /^\/nul$/,
      /^\/con$/,
      /^\/prn$/,
      /^\/aux$/,
      /^\/com[1-9]$/,
      /^\/lpt[1-9]$/,
    ],
  },
  rebuildConfig: {
    force: true,
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin', 'linux'],
    },
  ],
  plugins: [],
};
