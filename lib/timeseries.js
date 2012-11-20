var _, _n, TimeSeriesData, exports;
_ = require('underscore');
_n = require('underscore.nested');
/**
 * @class Represents a collection of data columns aligned along a common timeline.
 */
TimeSeriesData = (function(){
  TimeSeriesData.displayName = 'TimeSeriesData';
  var prototype = TimeSeriesData.prototype, constructor = TimeSeriesData;
  prototype.DEFAULT_OPTIONS = {};
  prototype.options = {};
  prototype.labels = [];
  prototype.types = [];
  prototype.untransformedRows = null;
  prototype.rows = null;
  prototype.columns = null;
  prototype.dateColumn = null;
  prototype.dataColumns = null;
  /**
   * @constructor
   */;
  function TimeSeriesData(data, opts){
    var ref$, that;
    if (!(typeof data === 'string' || _.isArray(data))) {
      ref$ = [data, null], opts = ref$[0], data = ref$[1];
    }
    this.options = import$(_.clone(this.DEFAULT_OPTIONS), opts || {});
    this.transforms = [];
    this.labels = this.options.labels || [];
    this.types = this.options.types || [];
    if (that = data || this.options.data) {
      this.parseData(that);
    }
    this.rebuildDerived();
  }
  /* * * *  TimeSeriesData interface  * * * */
  /**
   * @returns {Array<Array>} List of rows, each of which includes all columns.
   */
  prototype.getData = function(){
    return this.rows;
  };
  /**
   * @returns {Array<Array>} List of all columns (including date column).
   */
  prototype.getColumns = function(){
    return this.columns;
  };
  /**
   * @returns {Array<Date>} The date column.
   */
  prototype.getDateColumn = function(){
    return this.dateColumn;
  };
  /**
   * @returns {Array<Array>} List of all columns except the date column.
   */
  prototype.getDataColumns = function(){
    return this.dataColumns;
  };
  /**
   * @returns {Array<String>} List of column labels.
   */
  prototype.getLabels = function(){
    return this.labels;
  };
  /* * * *  Parsing  * * * */
  /**
   * Subclass and override to perform preprocessing of the data.
   * @private
   */
  prototype.parseData = function(rawData){
    return this;
  };
  /**
   * Rebuilds the row-oriented data matrix from the columns.
   * @private
   */
  prototype.rebuildData = function(){
    this.rows = _.zip.apply(_, this.columns);
    return this.rebuildDerived();
  };
  /**
   * Rebuilds the column-oriented data matrix from the columns.
   * @private
   */
  prototype.rebuildColumns = function(){
    this.columns = _.zip.apply(_, this.rows);
    return this.rebuildDerived();
  };
  /**
   * @private
   */
  prototype.rebuildDerived = function(){
    while (this.transforms.length < this.columns.length) {
      this.transforms.push([]);
    }
    this.dateColumn = this.columns[0];
    this.dataColumns = this.columns.slice(1);
    return this;
  };
  /* * * *  Data Transformation  * * * */
  /**
   * Applies the stack of transforms to the data.
   * 
   * TODO: Apply transforms in @getData()?
   * @private
   * @returns {this}
   */
  prototype.applyTransforms = function(){
    var idx, ref$, len$, fns, i$, len1$, ref1$, fn, ctx;
    for (idx = 0, len$ = (ref$ = this.transforms).length; idx < len$; ++idx) {
      fns = ref$[idx];
      for (i$ = 0, len1$ = fns.length; i$ < len1$; ++i$) {
        ref1$ = fns[i$], fn = ref1$[0], ctx = ref1$[1];
        (ref1$ = this.columns)[idx] = ref1$[idx].map(fn, ctx);
      }
    }
    return this.rebuildData();
  };
  /**
   * Clears all transforms and restores the original data.
   * @returns {this}
   */
  prototype.clearTransforms = function(){
    this.transforms = [];
    this.rows = _n.merge([], this.untransformedRows);
    return this.rebuildColumns();
  };
  /**
   * Add a data transform to the specified columns. The function is
   * applied one-by-one (in column-major order), replacing the data
   * with the mapped result.
   * 
   * @param {Number|Array} indices List one or more column indices to map. Negative
   *  numbers are offset from the end of the columns list.
   * @param {Function} fn Mapping function of the form:
   *  `(single_value, row_idx, column) -> new_value`
   * @param {Object} [ctx=this] Execution context for the function.
   * @returns {this}
   */
  prototype.addTransform = function(indices, fn, ctx){
    var num_cols, ref$, i$, len$, idx;
    ctx == null && (ctx = this);
    num_cols = this.columns.length;
    if (typeof idx === 'function') {
      ref$ = [fn, indices, null], ctx = ref$[0], fn = ref$[1], indices = ref$[2];
    }
    if (indices == null) {
      indices = _.range(num_cols);
    }
    if (!_.isArray(indices)) {
      indices = [indices];
    }
    for (i$ = 0, len$ = indices.length; i$ < len$; ++i$) {
      idx = indices[i$];
      idx %= num_cols;
      if (idx < 0) {
        idx += num_cols;
      }
      this.transforms[idx].push([fn, ctx]);
    }
    return this.applyTransforms();
  };
  /**
   * Add a data transform to all columns except the date column. The function
   * is applied one-by-one (in column-major order), replacing the data
   * with the mapped result.
   * 
   * @param {Function} fn Mapping function of the form:
   *  `(single_value, row_idx, column) -> new_value`
   * @param {Object} [ctx=this] Execution context for the function.
   * @returns {this}
   */
  prototype.addDataTransform = function(fn, ctx){
    ctx == null && (ctx = this);
    return this.addTransform(_.range(1, this.columns.length), fn, ctx);
  };
  /* * * *  Misc  * * * */
  /**
   * @returns {Array<Array>} Deep copy of the data rows (including all columns).
   */
  prototype.toJSON = function(){
    return _n.merge([], this.getData());
  };
  prototype.toString = function(){
    var labels;
    labels = this.labels.map(function(it){
      return "'" + it + "'";
    }).join(', ');
    return (this.constructor.name || this.constructor.displayName) + "(" + labels + ")";
  };
  return TimeSeriesData;
}());
module.exports = exports = TimeSeriesData;
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}