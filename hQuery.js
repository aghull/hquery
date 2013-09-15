var $ = require('jquery')
, _ = require('underscore');

/**
 * <expr>: [<value> of] [<adjective>,...] <node> [on|in|with [<adjective>,...] <node>]
 * <node>: all | <piece> | <space>
 * <adjective>: [not] ( first[:<int>] | last | nth:<int> | highest:<attribute> | lowest:<attribute> | <attribute>:<string> )
 * <value>: presence | absence | quantity | sum:<attribute> | <attribute>
 */
var hQuery = module.exports = function(dom) {
  this.$dom = $(dom);
  this.aliases = {adjectives: {}, elements: {}};
};

// find matches and return array or single element
hQuery.prototype.find = function(query) {
  this.init(query);
  var arr = this.getArray(this.$(query));
  if (this.vals.aggregate) {
    return this.aggregate(arr);
  }
  return this.vals.subject.singular || (this.vals.parent && this.vals.anchor.singular) ? arr[0] : arr;
};

// find jquery match for query
hQuery.prototype.$ = function(query) {
  var $anchor = this.vals.anchor.node ? this.process(this.$dom, 'find', this.vals.anchor) : this.$dom;
  return this.process($anchor, this.vals.parent ? 'parent' : 'find', this.vals.subject);
};

// process $subject into an array based on set criteria
hQuery.prototype.getArray = function($subject) {
  if (this.vals.attr) {
    arr = _.map($subject, function(el) {
      var a = $(el).attr(this.vals.attr);
      return a==='' || a===null || a===undefined || isNaN(a) ? a : parseFloat(a, 10);
    }, this);
  } else {
    arr = _.map($subject, function(el) { return $(el).attr('name') || el.tagName.toLowerCase(); });
  }
  return arr;
};

// perform fn on $el using lookup values which must include node, must return a jquery object
hQuery.prototype.process = function($el, fn, lookup) {
  $found = $el[fn].call($el, lookup.node);
  if (lookup.max) {
    return $(_.max($found, function(el) { return parseFloat($(el).attr(lookup.max), 10) || 0; }));
  }
  if (lookup.min) {
    return $(_.min($found, function(el) { return parseFloat($(el).attr(lookup.min), 10) || 0; }));
  }
  if (lookup.singular) {
    return $found.first();
  }
  return $found;
};

// aggregate array
hQuery.prototype.aggregate = function(arr) {
  if (this.vals.aggregate=='sum') {
    return _.reduce(arr, function(memo, num){ return memo + num; }, 0);
  }
  if (this.vals.aggregate=='quantity') {
    return arr.length;
  }
  if (this.vals.aggregate=='presence') {
    return arr.length > 0;
  }
  if (this.vals.aggregate=='absence') {
    return arr.length == 0;
  }
};

// init and parse query
hQuery.prototype.init = function(str) {
  this.str = str;
  this.vals = {subject: {}, anchor: {}};
  var match;
  if (null!==(match=str.match(/(.+)\s+(?:in|on)\s+(.+)/))) {
    this.vals.subject.node = this.subject(match[1]);
    this.vals.anchor.node = this.anchor(match[2]);
  } else if (null!==(match=str.match(/(.+)\s+(?:with)\s+(.+)/))) {
    this.vals.parent = true;
    this.vals.subject.node = this.subject(match[1]);
    this.vals.anchor.node = this.anchor(match[2]);
  } else {
    this.vals.subject.node = this.subject(this.str);
  }
};

// transform an hquery subject into jquery string
hQuery.prototype.subject = function(str) {
  //console.log('subj', str);
  this.modifiers = this.vals.subject;
  var match = str.match(/(\S+)\s+of\s+(.+)/);
  if (match) {
    var matchSum = match[1].match(/sum:(\w+)/);
    if (matchSum) {
      this.vals.aggregate = 'sum';
      this.vals.attr = matchSum[1];
    } else if (match[1]=='quantity' || match[1]=='presence' || match[1]=='absence') {
      this.vals.aggregate = match[1];
    } else {
      this.vals.attr = match[1];
    }
    return this.node(match[2]);
  }
  return this.node(str);
};

// transform an hquery anchor into jquery string
hQuery.prototype.anchor = function(str) {
  //console.log('anchor', str);
  this.modifiers = this.vals.anchor;
  return this.node(str);
};

// transform a single hquery node into jquery string
hQuery.prototype.node = function(str) {
  //console.log('node', str);
  var match = str.match(/(not\s+)?((?:\S+\s+)+)(\w+)/);
  if (match) {
    var adjectives = _.compact(_.map(match[2].trim().split(/\s+/), function(adj) {
      return this.adjective(adj);
    }, this));
    if (match[1]) { // not
      adjectives = _.map(adjectives, function(adj) {
        return ':not(' + adj + ')';
      });
    }
    return this.element(match[3]) + adjectives.join('');
  }
  return this.element(str);
};

// transform an hquery element name into jquery string
hQuery.prototype.element = function(str) {
  _.each(this.aliases.elements, function(aliases, element) {
    _.each(aliases, function(values, attribute) {
      if (_.contains(values, str)) {
        str = element + '[' + attribute + '=' + str + ']';
      }
    });
  });
  if (str=='all') {
    return '*';
  }
  return str;
};

// transform an hquery adjective into jquery string
hQuery.prototype.adjective = function(str) {
  //console.log('adj', str);
  var match;
  if (this.aliases.adjectives[str]) {
    str = this.aliases.adjectives[str];
  }
  if (str=='the' || str=='first' || str=='last') {
    this.modifiers.singular = true;
    return str=='last' ? ':last' : ':first';
  }
  if (null!==(match = str.match(/first(?::(\d*))/))) {
    return ':lt(' + match[1] + ')';
  }
  if (null!==(match = str.match(/nth(?::(\d*))/))) {
    this.modifiers.singular = true;
    return ':eq(' + (match[1]-1) + ')';
  }
  if (null!==(match = str.match(/highest:(\w+)/))) {
    this.modifiers.max = match[1];
    this.modifiers.singular = true;
    return;
  } 
  if (null!==(match = str.match(/lowest:(\w+)/))) {
    this.modifiers.min = match[1];
    this.modifiers.singular = true;
    return;
  }
  if (null!==(match = str.match(/(\w+):(\w+)/))) {
    return '[' + match[1] + '=' + match[2] + ']';
  }
  throw('"' + str + '" is not a valid adjective in "' + this.str + '"');
};
