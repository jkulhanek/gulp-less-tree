"use strict";

// through2 is a thin wrapper around node transform streams
let through = require('through2');
let PluginError = require('plugin-error');
let path = require('path');
var File = require('vinyl');
let filename = require('file-name');
let lessTree = require('less-tree');

// Consts
const PLUGIN_NAME = 'gulp-less-tree';

function gulpLessTree(file, opt){
    if (!file) {
        throw new Error('gulp-less-tree: Missing file option');
      }
      opt = opt || {};
    
      // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
      if (typeof opt.newLine !== 'string') {
        opt.newLine = '\n';
      }
    
      var isUsingSourceMaps = false;
      var latestFile;
      var latestMod;
      var fileName;

      // object containing dependency tree
      var tree = {};
    
      if (typeof file === 'string') {
        fileName = file;
      } else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
      } else {
        throw new Error('gulp-less-tree: Missing path in file options');
      }
    
      function bufferContents(file, enc, cb) {
        // ignore empty files
        if (file.isNull()) {
          cb();
          return;
        }
    
        // we don't do streams (yet)
        if (file.isStream()) {
          this.emit('error', new Error('gulp-less-tree: Streaming not supported'));
          cb();
          return;
        }
        
        // set latest file if not already set,
        // or if the current file was modified more recently.
        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
          latestFile = file;
          latestMod = file.stat && file.stat.mtime;
        }
    
        // add file to tree instance
        var fileKey = filename(file.relative);
        if(tree.hasOwnProperty(fileKey)){
            this.emit('error', new Error('gulp-less-tree: There is a duplicity in file names - "'+ fileKey+'"'));
            cb();
            return;
        }

        // create less vinyl file tree 
        let root = lessTree(path.join(file.base, file.relative));
        tree[fileKey] = root.toTreeObject();
        cb();
      }
    
      function endStream(cb) {
        // no files passed in, no file goes out
        if (!latestFile || !tree) {
          cb();
          return;
        }
    
        var joinedFile;
    
        // if file opt was a file path
        // clone everything from the latest file
        if (typeof file === 'string') {
          joinedFile = latestFile.clone({contents: false});
          joinedFile.path = path.join(latestFile.base, file);
        } else {
          joinedFile = new File(file);
        }
    
        joinedFile.contents = new Buffer(JSON.stringify(tree));
    
        this.push(joinedFile);
        cb();
      }
    
      return through.obj(bufferContents, endStream);
}

// Exporting the plugin main function
module.exports = gulpLessTree;