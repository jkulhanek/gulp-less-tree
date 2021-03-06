'use strict';

const path = require('path');
const objectify = (file, root) => {
  let rst = {};
  if(file.attributes&& file.attributes.length > 0)
    rst["_attributes"] = file.attributes;
  file.children.forEach(child => rst[path.relative(path.dirname(root.path), child.path)] = objectify(child, root));  
  return rst;
};
module.exports = file => objectify(file, file);
