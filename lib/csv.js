var TimeSeriesData, DASH_PATTERN, BLANK_LINE_PATTERN, COMMENT_PATTERN, STRIP_PATTERN, CSVData, exports, _, _n;
_ = require('underscore');
_n = require('underscore.nested');
TimeSeriesData = require('./timeseries');
DASH_PATTERN = /-/g;
BLANK_LINE_PATTERN = /^(\s*)$/;
COMMENT_PATTERN = /\s*(#|\/\/).*$/;
STRIP_PATTERN = /(^\s*|\s*)$/g;
CSVData = (function(superclass){
  CSVData.displayName = 'CSVData';
  var prototype = __extend(CSVData, superclass).prototype, constructor = CSVData;
  prototype.DEFAULT_OPTIONS = {
    colSep: ',',
    rowSep: '\n',
    defaultType: 'float',
    customBars: false,
    customSep: ';',
    errorBars: false,
    fractions: false,
    fractionSep: '/',
    skipBlankLines: true,
    blankLinePat: BLANK_LINE_PATTERN,
    removeCommentedText: true,
    commentPat: COMMENT_PATTERN,
    replaceMissing: false,
    replaceMissingValue: 0,
    replaceNaN: false,
    replaceNaNValue: 0,
    padRows: false,
    padRowsValue: 0
  };
  function CSVData(data, opts){
    superclass.apply(this, arguments);
  }
  /* * * *  CSV Parsing  * * * */
  prototype.parseNumber = function(s){
    return parseFloat(s);
  };
  prototype.parseHiLo = function(s){
    return s.split(this.options.customBars).map(this.parseNumber, this);
  };
  prototype.parseFraction = function(s){
    return s.split(this.options.fractionSep).map(this.parseNumber, this);
  };
  prototype.parseDate = function(s){
    return new Date(s.replace(DASH_PATTERN, '/'));
  };
  /**
   * Parses and imports a CSV string.
   * 
   * @private
   * @returns {this}
   */
  prototype.parseData = function(rawData){
    var o, lines, first, delim, rows, parser, hasHeaders, i, line, cols, date, fields, __len, __this = this;
    this.rawData = rawData;
    if (typeof rawData !== 'string') {
      return this;
    }
    o = this.options;
    lines = rawData.split(o.rowSep);
    if (!lines.length) {
      return [];
    }
    first = lines[0];
    delim = o.colSep;
    if (first.indexOf(delim) === -1 && first.indexOf('\t') >= 0) {
      delim = '\t';
    }
    rows = this.rows = [];
    this.columns = [];
    parser = this.parseNumber;
    if (o.customBars) {
      parser = this.parseHiLo;
    }
    if (o.fractions) {
      parser = this.parseFraction;
    }
    hasHeaders = this.labels.length !== 0;
    for (i = 0, __len = lines.length; i < __len; ++i) {
      line = lines[i];
      if (o.removeCommentedText) {
        line = line.replace(o.commentPat, '');
      }
      if (o.skipBlankLines && (line.length === 0 || o.blankLinePat.test(line))) {
        continue;
      }
      cols = line.split(delim);
      if (!hasHeaders) {
        hasHeaders = true;
        this.labels = cols.map(__fn);
        continue;
      }
      if (!(cols.length > 1)) {
        continue;
      }
      date = this.parseDate(cols.shift());
      fields = cols.map(parser, this);
      if (o.errorBars) {
        fields = fields.reduce(__fn1, []);
      }
      fields.unshift(date);
      rows.push(fields);
      fields.forEach(__fn2);
    }
    this.untransformedRows = _n.merge([], this.rows);
    return this;
    function __fn(it){
      return it.replace(STRIP_PATTERN, '');
    }
    function __fn1(acc, v){
      var last;
      last = acc[acc.length - 1];
      if (!(last && last.length < 2)) {
        acc.push(last = []);
      }
      last.push(v);
      return acc;
    }
    function __fn2(v, idx){
      if (!__this.columns[idx]) {
        __this.columns.push([]);
      }
      return __this.columns[idx].push(v);
    }
  };
  return CSVData;
}(TimeSeriesData));
module.exports = exports = CSVData;
function __extend(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}