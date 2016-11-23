var readDir = require('./lib/readDir');
var fs = require('fs');
var path = require('path');
var svg2ttf = require('svg2ttf');
var ttf2eot = require('ttf2eot');
var ttf2woff = require('ttf2woff');
var svgicons2svgfont = require('svgicons2svgfont');
var generateCss = require('./lib/generatecss');
var writeFile = require('./lib/writeFile');
var TTFStream = require('./lib/svg2ttfstream');

module.exports = function(options, callback) {
  options = options || {};
  var isDeep = options.deep;
  var svgsDir = options.dir;
  var outDir = options.out;
  var fontName = options.font || 'custom-font';
  if (!svgsDir || !outDir) {
    return callback(new Error('请指定svg所在目录和字体文件输出目录.'));
  }
  readDir({
    dirpath: svgsDir,
    isDeep: isDeep,
    callback: function(err, list) {
      if (err) {
        callback(err);
        return;
      }
      if (!list.length) {
        callback(null, '');
        return;
      }
      var fontFilePath = path.join(outDir, fontName+'.svg');
      var ttfFilePath = path.join(outDir, fontName+'.ttf');
      var woffFilePath = path.join(outDir, fontName+'.woff');
      var eotFilePath = path.join(outDir, fontName+'.eot');
      writeFile.mkdirs(path.dirname(fontFilePath), function() {
        var svgStream = svgicons2svgfont(list, {
          fontName: fontName,
          normalize: true
        });
        svgStream.pipe(fs.createWriteStream(fontFilePath));
        var ttfStream = svgStream.pipe(new TTFStream({fp: ttfFilePath}));
        ttfStream.on('end', function(data) {
          console.log('ttf created.');
          var ttfcontent = new Uint8Array(data);
          var woffcontent = new Buffer(ttf2woff(ttfcontent).buffer);
          var eotcontent = new Buffer(ttf2eot(ttfcontent).buffer);
          writeFile(woffFilePath , woffcontent, 'utf-8', function() {
            if (!err) {
              console.log('woff created.');
            } else {
              console.log('create woff failed.');
              console.error(err)
            }
          });
          writeFile(eotFilePath , eotcontent, 'utf-8', function() {
            if (!err) {
              console.log('eot created.');
            } else {
              console.log('create eot failed.');
              console.error(err)
            }
          });
        });
      });
      callback(null, generateCss(fontName, list));
    }
  });
};
