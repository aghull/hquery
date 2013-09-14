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
};

hQuery.prototype.find = function(query) {
  this.str = query;
  this.vals = {subject: {}, anchor: {}};
  this.init();
  return this.run();
};

// process all values
hQuery.prototype.run = function() {
  var $anchor = this.vals.anchor.node ? this.process(this.$dom, 'find', this.vals.anchor) : this.$dom;
  var $subject = this.process($anchor, this.vals.parent ? 'parent' : 'find', this.vals.subject);
  var arr = this.getArray($subject);
  return this.vals.subject.singular || (this.vals.parent && this.vals.anchor.singular) ? arr[0] : arr;
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

hQuery.prototype.init = function() {
  return this.parseRule(this.str, /(.+)\s+(?:in|on)\s+(.+)/, this.ops.child, this.subject, this.anchor)
    || this.parseRule(this.str, /(.+)\s+(?:with)\s+(.+)/, this.ops.parent, this.subject, this.anchor)
    || this.subject(this.str);
};

// parse rule on str using re, apply matches to fn(matches) after applying each matched piece to the remaining args: fn(str)
hQuery.prototype.parseRule = function(str, re, fn) {
  var cbs = _.toArray(arguments).slice(3);
  var m = str.match(re);
  if (m) {
    return fn.call(this, m.slice(1).map(function(part, index) { return cbs[index].call(this, part); }, this));
  }
};

hQuery.prototype.subject = function(str) {
  console.log('subj', str);
  this.modifiers = this.vals.subject;
  this.vals.subject.node = this.parseRule(str, /(\w+)\s+of\s+(.+)/, this.ops.attr, this.id, this.node) || this.node(str);
};

hQuery.prototype.anchor = function(str) {
  this.modifiers = this.vals.anchor;
  this.vals.anchor.node = this.node(str);
};

hQuery.prototype.node = function(str) {
  return this.parseRule(str, /(not\s+)?((?:\S+\s+)+)(\w+)/, this.ops.adjectives, this.id, this.adjectives, this.piece) || this.piece(str);
};

hQuery.prototype.adjectives = function(str) {
  return _.compact(str.trim().split(/\s+/).map(function(adj) { return this.adjective(adj); }, this));
};

hQuery.prototype.piece = function(str) {
  if (str=='all') {
    return '*';
  }
  return str;
};

hQuery.prototype.adjective = function(str) {
  var m;
  if (str=='the' || str=='first' || str=='last') {
    this.modifiers.singular = true;
    return str=='last' ? ':last' : ':first';
  }
  if (null!==(m=str.match(/first(?::(\d*))/))) {
    return ':lt(' + m[1] + ')';
  }
  if (null!==(m=str.match(/highest:(\w+)/))) {
    this.modifiers.max = m[1];
    this.modifiers.singular = true;
    return;
  } 
  if (null!==(m=str.match(/lowest:(\w+)/))) {
    this.modifiers.min = m[1];
    this.modifiers.singular = true;
    return;
  }
  if (null!==(m=str.match(/(\w+):(\w+)/))) {
    return '[' + m[1] + '=' + m[2] + ']';
  }
  throw('"' + str + '" is not a valid adjective in "' + this.str + '"');
};

hQuery.prototype.id = function(s) {
  return s;
};

hQuery.prototype.ops = {
  attr: function(m) {
    this.vals.attr = m[0];
    return m[1];
  },

  child: function(m) {
    return true;
  },

  parent: function(m) {
    this.vals.parent = true;
    return true;
  },

  adjectives: function(m) {
    return m[2] + (m[0] ? _.map(m[1], function(adj) { return ':not(' + adj + ')'; }) : m[1]).join('');
  }
};
