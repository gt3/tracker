import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

export default [
  // ES
  {
    input: 'src/index.ts',
    output: { file: 'build/index.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        extensions: ['.ts', '.js']
      }),
      babel({ extensions: ['.ts', '.js'] })
    ]
  },
  // UMD Production
  {
    input: 'src/index.ts',
    output: {
      file: 'build/tracker.min.js',
      format: 'umd',
      name: 'TrackerMW',
      indent: false
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        extensions: ['.ts', '.js']
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.ts', '.js']
      }),
      // replace({
      //   'process.env.NODE_ENV': JSON.stringify('production')
      // }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
]
