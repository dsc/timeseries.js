var _ = require('underscore');
_.mixin( require('underscore.nested') );

exports.TimeSeriesData = require('./timeseries');
exports.CSVData        = require('./csv');
