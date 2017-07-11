/* @flow */
import Promise from 'bluebird';
import _ from 'lodash';
import request from 'request';
import qs from 'query-string';

import {
  BusinessRule
} from './rule';
import {
  Policy,
  PolicyRule
} from './policy';

const requestp = Promise.promisifyAll(request);

function evaluatePredefinedCondition(fact: any, policyRule: PolicyRule, errorMessages: string[], previous: boolean, previousLink: string): Promise {
  if (!policyRule.rule) {
    return new Promise((resolve, reject) => {
      reject('No business rule defined.');
    });
  }

  const rule = (policyRule.rule: BusinessRule);
  let httpOpts = {};

  return new Promise((resolve, reject) => {
    let result: boolean;
    let resultp: Object = { noPromise: true };
    switch (rule.ruleObject.condition.operation) {
      case "required":
        result = _.has(fact, rule.ruleObject.condition.params.value) && !_.isNull(fact[rule.ruleObject.condition.params.value]);
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "maxlength":
        result = _.has(fact, rule.ruleObject.condition.params.value) && _.isString(fact[rule.ruleObject.condition.params.value]) && fact[rule.ruleObject.condition.params.value].length <= rule.ruleObject.condition.params.max;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "minlength":
        result = _.has(fact, rule.ruleObject.condition.params.value) && _.isString(fact[rule.ruleObject.condition.params.value]) && fact[rule.ruleObject.condition.params.value].length >= rule.ruleObject.condition.params.min;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "betweenlength":
        result = _.has(fact, rule.ruleObject.condition.params.value) && _.isString(fact[rule.ruleObject.condition.params.value]) && (rule.ruleObject.condition.params.min <= fact[rule.ruleObject.condition.params.value].length) && (fact[rule.ruleObject.condition.params.value].length <= rule.ruleObject.condition.params.max);
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "gt":
        result = (fact[rule.ruleObject.condition.params.value]) > rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "gte":
        result = (fact[rule.ruleObject.condition.params.value]) >= rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "lt":
        result = (fact[rule.ruleObject.condition.params.value]) < rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "lte":
        result = (fact[rule.ruleObject.condition.params.value]) <= rule.ruleObject.condition.params.other;
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "between":
        result = (rule.ruleObject.condition.params.min <= fact[rule.ruleObject.condition.params.value]) && (fact[rule.ruleObject.condition.params.value] <= rule.ruleObject.condition.params.max);
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "notin":
        result = (rule.ruleObject.condition.params.min > fact[rule.ruleObject.condition.params.value]) && (fact[rule.ruleObject.condition.params.value] > rule.ruleObject.condition.params.max);
        if (result === false) errorMessages.push(rule.ruleObject.condition.params.message);
        break;
      case "httpget":
        httpOpts = _.cloneDeep(rule.ruleObject.condition.params.options);
        httpOpts.url = `${httpOpts.url}?${qs.stringify(fact)}`;
        resultp = requestp(httpOpts);
        break;
      case "httppost":
        httpOpts = _.cloneDeep(rule.ruleObject.condition.params.options);
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
      if (!previousLink || (previousLink && _.toUpper(previousLink) === "AND")) {
        resolve({ result: (previous && result), link: policyRule.link });
      } else if (previousLink && _.toUpper(previousLink) === "OR") {
        resolve({ result: (previous || result), link: policyRule.link });
      } else {
        reject(`Invalid link parameter ${previousLink}. Allowed values are 'AND' or 'OR'.`);
      }
    } else {
      // We have a promise, so chain it
      resultp.then((value) => {
        resolve({ result: (previous && value.result), link: policyRule.link });
        if (value.result === false && value.message) {
          errorMessages.push(value.message);
        }
      }, (reason) => {
        reject(reason);
      });
    }
  });
}

function executePolicyRules(fact: any, engine: Object, rules: PolicyRule[], subResult): Promise {
  rules = _.orderBy(rules, ['order'], ['asc']);
  subResult = subResult || { result: true, link: "AND" };
  let promResult = Promise.resolve(subResult);

  _.forEach(rules, (r) => {
    if (r.rule && r.rule.ruleObject && r.rule.ruleObject.condition) {
      if (r.rule.ruleObject.condition.type === 'predefined') {
        promResult = promResult.then((prev) => {
          return evaluatePredefinedCondition(fact, r, engine.errors, prev.result, prev.link);
        });
      } else {
        // TODO: execute custom function
        promResult = promResult.then((prev) => {
          return r.rule.ruleObject.condition.evaluateCondition(fact, r, engine.errors, prev.result, prev.link);
        });
      }
    } else {
      // Assuming subrules, so execute them en block
      promResult = promResult.then((prev) => {
        return executePolicyRules(fact, engine, r.rules, prev);
      });
      promResult = promResult.then((prev) => {
        return Promise.resolve({ result: prev.result, link: r.link });
      });
    }
  });
  return promResult;
}

export class RulesEngine {
  policy: Policy;
  errors: string[];

  constructor(policy: Policy) {
    this.policy = policy;
    this.errors = [];
  }

  setPolicy(newPolicy: Policy): void {
    this.policy = newPolicy;
  }

  checkFact(fact: any) {
    // Reset errors
    this.errors = [];
    // Execute rules tree
    return executePolicyRules(fact, this, this.policy.rules);
  }
}

export default RulesEngine;
