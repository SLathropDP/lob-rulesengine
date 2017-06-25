'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BusinessRule = exports.BusinessRule = function () {
  function BusinessRule() {
    _classCallCheck(this, BusinessRule);

    this.ruleObject = {};
  }

  _createClass(BusinessRule, [{
    key: 'loadJson',
    value: function loadJson(definition) {
      this.ruleObject = JSON.parse(definition);

      if (!this.validateRule()) {
        throw new Error('Rule definition is invalid. Please check with the documentation.');
      }
    }
  }, {
    key: 'defineRule',
    value: function defineRule(obj) {
      this.ruleObject = obj;
      if (!this.validateRule()) {
        throw new Error('Rule definition is invalid. Please check with the documentation.');
      }
    }
  }, {
    key: 'validateRule',
    value: function validateRule() {
      if (!this.ruleObject) {
        return false;
      }

      if (this.ruleObject && !this.ruleObject.condition) {
        return false;
      }

      return true;
    }
  }]);

  return BusinessRule;
}();

exports.default = BusinessRule;