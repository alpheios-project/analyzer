import resolve from 'rollup-plugin-node-resolve';
import string from 'rollup-plugin-string';
export default {
    entry: 'src/tufts/adapter.js',
    plugins: [
      string({
        include: ['tests/data/**/*.json'],
      }),
      resolve({
        module: true, // Default: true
        jsnext: true,  // Default: false
        main: true,  // Default: true
        browser: true,  // Default: false
        namedExports: {
        }
      })
    ],
    moduleName: 'alpheios-analyzer',
    targets: [
      {
        dest: "dist/alpheios-analyzer.js",
        format: "umd"
      }
    ]
};