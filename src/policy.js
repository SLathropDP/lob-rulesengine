/* @flow */

import {
  _
} from 'lodash';
import {
  BusinessRule
} from './rule';

export interface PolicyRule {
  rule: BusinessRule;
  rules: PolicyRule[];
  name: ? string;
  order: number;
  link: ? string;
}

function validateNewPolicyRule(rule: PolicyRule, others: PolicyRule[]): boolean {
  const dupOrder = _.find(others, (r) => {
    return r.order === rule.order;
  });

  if (dupOrder) {
    return false;
  }

  if (rule.name) {
    const dupName = _.find(others, (r) => {
      if (!r.name) return false;

      return _.toLower(r.name) === _.toLower(rule.name);
    });

    if (dupName) {
      return false;
    }
  }

  return true;
}

function loadPolicyRule(rule: PolicyRule): PolicyRule {
  if (rule.rule) {
    const br = new BusinessRule();
    br.loadJson(JSON.stringify(rule.rule));
    rule.rule = br;
  } else if (rule.rules) {
    _.forEach(rule.rules, (pr, index) => {
      rule.rules[index] = loadPolicyRule(pr);
    });
  }
  return rule;
}

export class Policy {
  rules: Array < PolicyRule > ;

  constructor(initialRules: Array<PolicyRule>) {
    this.rules = initialRules || [];
  }

  addRule(newRule: PolicyRule): boolean {
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

  removeRuleAtOrder(order: number): PolicyRule[] {
    return _.remove(this.rules, (r) => {
      return r.order === order;
    });
  }

  removeRuleByName(name: string): PolicyRule[] {
    return _.remove(this.rules, (r) => {
      if (!r.name) {
        return false;
      }
      return r.name === name;
    });
  }

  clearRules(): void {
    this.rules = [];
  }

  loadFromJson(data: string) {
    this.clearRules();

    const dataObj = JSON.parse(data);

    if (!dataObj) throw new Error('Invalid JSON data passed, please refer to the documentation.');
    if (!dataObj.rules) throw new Error('JSON data does not contain property rules, please refer to the documentation.');

    _.each(dataObj.rules, (r) => {
      r = loadPolicyRule(r);
      if (!this.addRule(r)) {
        this.clearRules();
        throw new Error(`Failed to load rule with order '${r.order}'; all policy rules have been cleared.`);
      }
    });
  }
}

export default Policy;
