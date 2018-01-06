'use strict';

const fs = require('fs-extra');
const File = require('vinyl');
const treeify = require('treeify');
const parseDep = require('./parseDep');
const objectify = require('./objectify');
let cache = {};

const createFileTree = filePath => {
  if (!cache[filePath]) {
    let file = new File({
      path: filePath,
      contents: fs.readFileSync(filePath)
    });
    file.children = parseDep(file).map(createFileTree);
    file.toTreeObject = () => objectify(file);
    file.toTreeString = () => treeify.asTree(file.toTreeObject(), true);
    cache[filePath] = file;
  }
  return cache[filePath];
};

module.exports = createFileTree;
