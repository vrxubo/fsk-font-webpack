module.exports = function(fontName, glyphs) {
  var cssText = '';
  glyphs.forEach(function(glyph) {
    cssText += '.icon-' + glyph.name + ':before {\n' ;
    cssText += '  content: "\\' + glyph.codepoint.toString(16) + '";\n' ;
    cssText += '}\n';
  });
  return cssText;
};

