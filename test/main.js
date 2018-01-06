gulpLessTree = require('../');
var should = require('should');
var fs = require('fs');
var path = require('path');
var assert = require('stream-assert');
var test = require('./test-stream');
var File = require('vinyl');
var gulp = require('gulp');
require('mocha');

var fixtures = function (glob) { return path.join(__dirname, 'fixtures', glob); }

var thirdBase = __dirname,
    thirdFile = 'third.less',
    thirdPath = path.join(thirdBase, thirdFile);

describe('gulp-less-tree', function() {


  // Create a third fixture, so we'll know it has the latest modified stamp.
  // It must not live in the test/fixtures directory, otherwise the test
  // 'should take path from latest file' will be meaningless.
  before(function(done){
    fs.writeFile(thirdPath, "@import 'fixtures/resource1.less';\n", done);
  });

  // We'll delete it when we're done.
  after(function(done){
    fs.unlink(thirdPath, done);
  });

  describe('gulpLessTree()', function() {
    it('should throw, when arguments is missing', function () {
        gulpLessTree.should.throw('gulp-less-tree: Missing file option');
    });

    it('should ignore null files', function (done) {
      var stream = gulpLessTree('fixtures/first.less');
      stream
        .pipe(assert.length(0))
        .pipe(assert.end(done));
      stream.write(new File());
      stream.end();
    });

    it('should emit error on streamed file', function (done) {
      gulp.src(fixtures('*'), { buffer: false })
        .pipe(gulpLessTree('test.js'))
        .once('error', function (err) {
          err.message.should.eql('gulp-less-tree: Streaming not supported');
          done();
        });
    });

    it('should generate dependencies of one file', function (done) {
        gulp.src(fixtures('first.less'), { buffer: true })
        .pipe(gulpLessTree('test.json'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) { d.contents.toString().should.eql('{"first":{"resource1.less":{}}}'); }))
        .pipe(assert.end(done));
    });

    it('should concat dependencies of multiple files', function (done) {
        gulp.src(fixtures('*'), { buffer: true })
        .pipe(gulpLessTree('test.json'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) { d.contents.toString().should.eql('{"first":{"resource1.less":{}},"resource1":{},"resource2":{},"second":{"resource2.less":{}}}'); }))
        .pipe(assert.end(done));
    });


    it('should take path from latest file', function (done) {
      gulp.src([fixtures('*'), thirdPath])
        .pipe(gulpLessTree('test.json'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (newFile) {
          var newFilePath = path.resolve(newFile.path);
          var expectedFilePath = path.resolve(path.join(thirdBase, 'test.json'));
          newFilePath.should.equal(expectedFilePath);
        }))
        .pipe(assert.end(done));
    });

    it('should preserve relative path from files', function (done) {
        gulp.src(fixtures('first.less'), { buffer: true })
        .pipe(gulpLessTree('test.json'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) { d.relative.should.eql('test.json'); }))
        .pipe(assert.end(done));
    });

    describe('should not fail if no files were input', function () {
      it('when argument is a string', function(done) {
        var stream = gulpLessTree('test.json');
        stream.end();
        done();
      });

      it('when argument is an object', function(done) {
        var stream = gulpLessTree({path: 'new.txt'});
        stream.end();
        done();
      });
    });

    describe('with object as argument', function () {
      it('should throw without path', function () {
        (function() {
            gulpLessTree({ path: undefined });
        }).should.throw('gulp-less-tree: Missing path in file options');
      });

      it('should create file based on path property', function (done) {
        gulp.src(fixtures('first.less'), { buffer: true })
          .pipe(gulpLessTree({path: 'new.txt'}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.path.should.eql('new.txt'); }))
          .pipe(assert.end(done));
      });

      it('should calculate relative path from cwd and path in arguments', function (done) {
        gulp.src(fixtures('first.less'), { buffer: true })
          .pipe(gulpLessTree({cwd: path.normalize('/home/contra'), path: path.normalize('/home/contra/test/new.txt')}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.relative.should.eql(path.normalize('test/new.txt')); }))
          .pipe(assert.end(done));
      });
    });
  });
});