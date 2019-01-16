module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 11']
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false,
        loose: true
      }
    ],
    '@babel/typescript'
  ],
  plugins: [
    // don't use `loose` mode here - need to copy symbols when spreading
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread'
  ]
}