'use strict';

const _ = require('lodash');

module.exports = extnames => 
    filePath => {
        for(var i = 0;i < extnames.length;++i){
            if(_.endsWith(filePath, `.${extnames[i]}`)){
                return filePath;
            }

            return `${filePath}.${extnames[0]}`;
        }
    }
