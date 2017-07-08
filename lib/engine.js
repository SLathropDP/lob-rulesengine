'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RulesEngine = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _rule = require('./rule');

var _policy = require('./policy');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var requestp = _bluebird2.default.promisifyAll(_request2.default);

function evaluatePredefinedCondition(fact, policyRule, errorMessages, previous, previousLink) {
  if (!policyRule.rule) {
    return new _bluebird2.default(function (resolve, reject) {
      reject('No business rule defined.');
    });
  }

  var rule = policyRule.rule;
  var httpOpts = {};

  return new _bluebird2.default(function (resolve, reject) {
    console.log('Rule processing', rule);
    var result = void 0;
    var resultp = { noPromise: true };
    switch (rule.ruleObject.condition.operation) {
      case "required":
        result = _lodash2.default.has(fact, rule.ruleObject.condition.params.value) && !_lodash2.default.isNull(fact[rule.ruleObject.condition.params.value]);
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "maxlength":
        result = _lodash2.default.has(fact, rule.ruleObject.condition.params.value) && _lodash2.default.isString(fact[rule.ruleObject.condition.params.value]) && fact[rule.ruleObject.condition.params.value].length <= rule.ruleObject.condition.params.max;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "minlength":
        result = _lodash2.default.has(fact, rule.ruleObject.condition.params.value) && _lodash2.default.isString(fact[rule.ruleObject.condition.params.value]) && fact[rule.ruleObject.condition.params.value].length >= rule.ruleObject.condition.params.min;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "betweenlength":
        result = _lodash2.default.has(fact, rule.ruleObject.condition.params.value) && _lodash2.default.isString(fact[rule.ruleObject.condition.params.value]) && rule.ruleObject.condition.params.min <= fact[rule.ruleObject.condition.params.value].length && fact[rule.ruleObject.condition.params.value].length <= rule.ruleObject.condition.params.max;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "gt":
        result = fact[rule.ruleObject.condition.params.value] > rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "gte":
        result = fact[rule.ruleObject.condition.params.value] >= rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "lt":
        result = fact[rule.ruleObject.condition.params.value] < rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "lte":
        result = fact[rule.ruleObject.condition.params.value] <= rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "between":
        result = rule.ruleObject.condition.params.min <= fact[rule.ruleObject.condition.params.value] && fact[rule.ruleObject.condition.params.value] <= rule.ruleObject.condition.params.max;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "notin":
        result = rule.ruleObject.condition.params.min > fact[rule.ruleObject.condition.params.value] && fact[rule.ruleObject.condition.params.value] > rule.ruleObject.condition.params.max;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "httpget":
        httpOpts = _lodash2.default.cloneDeep(rule.ruleObject.condition.params.options);
        httpOpts.url = httpOpts.url + '?' + _queryString2.default.stringify(fact);
        resultp = requestp(httpOpts);
        break;
      case "httppost":
        httpOpts = _lodash2.default.cloneDeep(rule.ruleObject.condition.params.options);
        httpOpts.body = fact;
        httpOpts.json = true;
        resultp = requestp(rule.ruleObject.condition.params.options);
        break;
      default:
        result = false;
        errorMessages.push('Unsupported predefined operation', rule.ruleObject);
        break;
    }

    if (resultp.noPromise) {
      if (!previousLink || previousLink && _lodash2.default.toUpper(previousLink) === "AND") {
        resolve({ result: previous && result, link: policyRule.link });
      } else if (previousLink && _lodash2.default.toUpper(previousLink) === "OR") {
        resolve({ result: previous || result, link: policyRule.link });
      } else {
        reject('Invalid link parameter ' + previousLink + '. Allowed values are \'AND\' or \'OR\'.');
      }
    } else {
      // We have a promise, so chain it
      resultp.then(function (value) {
        resolve({ result: previous && value.result, link: policyRule.link });
        if (value.result === false && value.message) {
          errorMessages.push(value.message);
        }
      }, function (reason) {
        reject(reason);
      });
    }
  });
}

function executePolicyRules(fact, engine, rules, subResult) {
  rules = _lodash2.default.orderBy(rules, ['order'], ['asc']);
  subResult = subResult || { result: true, link: "AND" };
  var promResult = _bluebird2.default.resolve(subResult);

  _lodash2.default.forEach(rules, function (r) {
    if (r.rule && r.rule.ruleObject && r.rule.ruleObject.condition) {
      if (r.rule.ruleObject.condition.type === 'predefined') {
        promResult = promResult.then(function (prev) {
          console.log('Previous', prev);
          return evaluatePredefinedCondition(fact, r, engine.errors, prev.result, prev.link);
        });
      } else {
        // TODO: execute custom function
        promResult = promResult.then(function (prev) {
          return r.rule.ruleObject.condition.evaluateCondition(fact, r, engine.errors, prev.result, prev.link);
        });
      }
    } else {
      // Assuming subrules, so execute them en block
      promResult = promResult.then(function (prev) {
        return executePolicyRules(fact, engine, r.rules, prev);
      });
      promResult = promResult.then(function (prev) {
        return _bluebird2.default.resolve({ result: prev.result, link: r.link });
      });
    }
  });
  return promResult;
}

var RulesEngine = exports.RulesEngine = function () {
  function RulesEngine(policy) {
    _classCallCheck(this, RulesEngine);

    this.policy = policy;
    this.errors = [];
  }

  _createClass(RulesEngine, [{
    key: 'setPolicy',
    value: function setPolicy(newPolicy) {
      this.policy = newPolicy;
    }
  }, {
    key: 'checkFact',
    value: function checkFact(fact) {
      // Reset errors
      this.errors = [];
      // Execute rules tree
      return executePolicyRules(fact, this, this.policy.rules);
    }
  }]);

  return RulesEngine;
}();

exports.default = RulesEngine;