'use strict';

const path = require('path');
const parse = require('parse-less-import');
const addExtLess = require('./addExt')(['less','css']);
module.exports = file => {
  return parse(file.contents.toString())
    .map(dep => { return {path:addExtLess(path.resolve(path.dirname(file.path), dep.path)), attributes:dep.keywords}});
};
