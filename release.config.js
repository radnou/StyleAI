module.exports = {
  branches: [
    'master',
    { name: 'develop', prerelease: true },
    { name: 'beta', prerelease: true },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'npm run build',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'dist/*.aab', label: 'Android App Bundle' },
          { path: 'dist/*.apk', label: 'Android APK' },
          { path: 'dist/*.ipa', label: 'iOS App' },
        ],
      },
    ],
  ],
  preset: 'angular',
  tagFormat: 'v${version}',
  // Customize release rules
  releaseRules: [
    { type: 'feat', release: 'minor' },
    { type: 'fix', release: 'patch' },
    { type: 'perf', release: 'patch' },
    { type: 'revert', release: 'patch' },
    { breaking: true, release: 'major' },
    { scope: 'no-release', release: false },
  ],
  // Customize changelog generation
  parserOpts: {
    noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
  },
  writerOpts: {
    commitsSort: ['subject', 'scope'],
  },
};