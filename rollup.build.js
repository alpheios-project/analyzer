const rollup = require('rollup')
const string = require('rollup-plugin-string')
const resolve = require('rollup-plugin-node-resolve')

const defaultPlugins = [
  string({
    include: ['src/lib/engine/data/**/*.json', 'src/**/*.json']
  }),
  resolve({
    module: true, // Default: true
    jsnext: true,  // Default: false
    main: true,  // Default: true
    browser: true,  // Default: false
    namedExports: {
    }
  })
]

// Standalone bundle
rollup.rollup({
  entry: 'src/adapter.js',
  moduleName: 'AlpheiosTuftsAdapter',
  plugins: defaultPlugins
}).then(bundle => {
  bundle.write({
    format: 'es',
    dest: 'dist/alpheios-tufts-adapter.standalone.js',
    sourceMap: true
  })
}).catch(reason => {
  'use strict'
  console.error(reason)
})

// Module bundle
rollup.rollup({
  entry: 'src/adapter.js',
  external: ['alpheios-data-models'],
  moduleName: 'AlpheiosTuftsAdapter',
  plugins: defaultPlugins
}).then(bundle => {
  bundle.write({
    format: 'es',
    dest: 'dist/alpheios-tufts-adapter.module-external.js',
    sourceMap: false
  })
}).catch(reason => {
  'use strict'
  console.error(reason)
})
