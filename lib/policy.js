'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Policy = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _rule = require('./rule');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function validateNewPolicyRule(rule, others) {
  var dupOrder = _lodash._.find(others, function (r) {
    return r.order === rule.order;
  });

  if (dupOrder) {
    return false;
  }

  if (rule.name) {
    var dupName = _lodash._.find(others, function (r) {
      if (!r.name) return false;

      return _lodash._.toLower(r.name) === _lodash._.toLower(rule.name);
    });

    if (dupName) {
      return false;
    }
  }

  return true;
}

function loadPolicyRule(rule) {
  if (rule.rule) {
    var br = new _rule.BusinessRule();
    br.loadJson(JSON.stringify(rule.rule));
    rule.rule = br;
  } else if (rule.rules) {
    _lodash._.forEach(rule.rules, function (pr, index) {
      rule.rules[index] = loadPolicyRule(pr);
    });
  }
  return rule;
}

var Policy = exports.Policy = function () {
  function Policy(initialRules) {
    _classCallCheck(this, Policy);

    this.rules = initialRules || [];
  }

  _createClass(Policy, [{
    key: 'addRule',
    value: function addRule(newRule) {
      if (newRule.rule && newRule.rule.validateRule()) {
        if (validateNewPolicyRule(newRule, this.rules)) {
          this.rules.push(newRule);
          return true;
        }
      } else if (!newRule.rule) {
        if (validateNewPolicyRule(newRule, this.rules)) {
          this.rules.push(newRule);
          return true;
        }
      }

      return false;
    }
  }, {
    key: 'removeRuleAtOrder',
    value: function removeRuleAtOrder(order) {
      return _lodash._.remove(this.rules, function (r) {
        return r.order === order;
      });
    }
  }, {
    key: 'removeRuleByName',
    value: function removeRuleByName(name) {
      return _lodash._.remove(this.rules, function (r) {
        if (!r.name) {
          return false;
        }
        return r.name === name;
      });
    }
  }, {
    key: 'clearRules',
    value: function clearRules() {
      this.rules = [];
    }
  }, {
    key: 'loadFromJson',
    value: function loadFromJson(data) {
      var _this = this;

      this.clearRules();

      var dataObj = JSON.parse(data);

      if (!dataObj) throw new Error('Invalid JSON data passed, please refer to the documentation.');
      if (!dataObj.rules) throw new Error('JSON data does not contain property rules, please refer to the documentation.');

      _lodash._.each(dataObj.rules, function (r) {
        r = loadPolicyRule(r);
        if (!_this.addRule(r)) {
          _this.clearRules();
          throw new Error('Failed to load rule with order \'' + r.order + '\'; all policy rules have been cleared.');
        }
      });
    }
  }]);

  return Policy;
}();

exports.default = Policy;