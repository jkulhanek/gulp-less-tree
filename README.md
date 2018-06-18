# gulp-less-tree
Gulp adapter for less-tree module. Generates less-tree json file.

![status](https://secure.travis-ci.org//jkulhanek/gulp-less-tree.svg?branch=master)

## Installation

Install package with NPM and add it to your development dependencies:

`npm install --save-dev gulp-less-tree`

## Information

<table>
<tr>
<td>Package</td><td>gulp-less-tree</td>
</tr>
<tr>
<td>Description</td>
<td>Concatenates files</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.10</td>
</tr>
</table>

## Usage

```js
var gulpLessTree = require('gulp-less-tree');

gulp.task('scripts', function() {
  return gulp.src('./src/*.less')
    .pipe(gulpLessTree('dependencies.json'))
    .pipe(gulp.dest('./dist/'));
});
```

This will generate single file dependencies.json, containing dependency structure of your less files. The input file names (without the less extensions) will be used as keys and json objects containing dependencies will be the property values of the object. The resulting object is a json file. Example of such a generated file for files 'first.less', 'second.less' is:

```
{
  "first.less":{
    "dependency1.less":{}
   },
   "second.less":{
    "dependency2.less":{}
   }
}
```

