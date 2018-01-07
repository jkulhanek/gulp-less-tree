'use strict';

const fs = require('fs-extra');
const File = require('vinyl');
const treeify = require('treeify');
const parseDep = require('./parseDep');
const objectify = require('./objectify');
const _ = require('lodash');
let cache = {};

const createFileTree = (filePath,attributes) => {
  var value;
  if (!cache[filePath]) {
    let file = new File({
      path: filePath,
      contents: fs.readFileSync(filePath)
    });
    var deps = parseDep(file);
    file.children = deps.map(x => createFileTree(x.path, x.attributes));
    cache[filePath] = file;
    value = file;
  }
  else{
    value = _.clone(cache[filePath]);
    delete value.attributes;
  }

  value.toTreeObject = () => objectify(value);
  value.toTreeString = () => treeify.asTree(value.toTreeObject(), true);  
  value.attributes = attributes;
  return value;
};

module.exports = createFileTree;
