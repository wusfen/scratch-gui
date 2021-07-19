const path = require('path');
const glob = require('glob');

var files = glob.sync(`**`, {
  nodir: true,
  absolute: true,
  cwd: __dirname,
});
// console.debug(files);

module.exports = files.map(filePath => ({
  loader: 'path-replace-loader',
  options: {
    path: path.resolve(filePath.replace(__dirname.split(/[/\\]+/).pop(), '')), // root/[parent]/files => root/files
    replacePath: path.resolve(filePath), // root/[parent]/.../file
  }
}));

// console.log('replace files:', module.exports);
