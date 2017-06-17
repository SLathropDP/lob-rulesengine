/* global describe, it, _ */

import { Policy, PolicyRule } from '../src/policy';
import BusinessRule from '../src/rule';
import mockPolicies from './mocks/policy.json';

const {
  expect,
  should
} = require("chai");

should();

describe("Policy", () => {
  it("should create a new empty policy if not passing any arguments to constructor", () => {
    const p = new Policy();
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(0);
  });

  it("should create a policy with one rule if a single rule is passed into constructor", () => {
    const r = new BusinessRule();
    r.defineRule({ condition: "foo" });
    const pr: PolicyRule = {
      rule: r,
      order: 1
    };
    const p = new Policy([pr]);
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(1);
  });

  it("should create a policy with two rules if passed into constructor", () => {
    const r1 = new BusinessRule();
    r1.defineRule({ condition: "foo" });
    const pr1: PolicyRule = {
      rule: r1,
      order: 1,
      link: "AND"
    };
    const r2 = new BusinessRule();
    r2.defineRule({ condition: "baz" });
    const pr2: PolicyRule = {
      rule: r2,
      order: 2
    };
    const p = new Policy([pr1, pr2]);
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(2);
  });

  it("should clear all rules from a policy if requested", () => {
    const r1 = new BusinessRule();
    r1.defineRule({ condition: "foo" });
    const pr1: PolicyRule = {
      rule: r1,
      order: 1,
      link: "AND"
    };
    const r2 = new BusinessRule();
    r2.defineRule({ condition: "baz" });
    const pr2: PolicyRule = {
      rule: r2,
      order: 2
    };
    const p = new Policy([pr1, pr2]);
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(2);
    p.clearRules();
    expect(p.rules).to.be.lengthOf(0);
  });

  it("can remove a rule from a specified order", () => {
    const r1 = new BusinessRule();
    r1.defineRule({ condition: "foo" });
    const pr1: PolicyRule = {
      rule: r1,
      order: 1,
      link: "AND"
    };
    const r2 = new BusinessRule();
    r2.defineRule({ condition: "baz" });
    const pr2: PolicyRule = {
      rule: r1,
      order: 2
    };
    const p = new Policy([pr1, pr2]);
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(2);

    const rem = p.removeRuleAtOrder(1);
    expect(rem).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(rem).to.be.lengthOf(1);
    expect(rem[0].order).equal(1);

    expect(p.rules).to.be.lengthOf(1);
  });

  it("can remove a rule by name", () => {
    const r1 = new BusinessRule();
    r1.defineRule({ condition: "foo" });
    const pr1: PolicyRule = {
      rule: r1,
      order: 1,
      link: "AND"
    };
    const r2 = new BusinessRule();
    r2.defineRule({ condition: "baz" });
    const pr2: PolicyRule = {
      rule: r1,
      order: 2,
      name: "rule2"
    };
    const p = new Policy([pr1, pr2]);
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(2);

    const rem = p.removeRuleByName("rule2");
    expect(rem).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(rem).to.be.lengthOf(1);
    expect(rem[0].order).equal(2);

    expect(p.rules).to.be.lengthOf(1);
  });


  it("should not add a new rule with the same order", () => {
    const r1 = new BusinessRule();
    r1.defineRule({ condition: "foo" });
    const pr1: PolicyRule = {
      rule: r1,
      order: 1,
      link: "AND"
    };
    const r2 = new BusinessRule();
    r2.defineRule({ condition: "baz" });
    const pr2: PolicyRule = {
      rule: r2,
      order: 1
    };
    const p = new Policy([pr1]);
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(1);

    const added = p.addRule(pr2);
    expect(added).to.be.false; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(1);
  });

  it("should not add a new rule with the same name", () => {
    const r1 = new BusinessRule();
    r1.defineRule({ condition: "foo" });
    const pr1: PolicyRule = {
      rule: r1,
      order: 1,
      link: "AND",
      name: "foo"
    };
    const r2 = new BusinessRule();
    r2.defineRule({ condition: "baz" });
    const pr2: PolicyRule = {
      rule: r2,
      order: 2,
      name: "Foo"
    };
    const p = new Policy([pr1]);
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(1);

    const added = p.addRule(pr2);
    expect(added).to.be.false; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(1);
  });

  it("should load valid JSON data", () => {
    const p = new Policy();
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(0);
    p.loadFromJson(JSON.stringify(mockPolicies.simple));

    expect(p.rules).to.be.lengthOf(2);
  });

  it("should throw an error if invalid JSON is passed", () => {
    const p = new Policy();
    expect(p).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(p.rules).to.be.lengthOf(0);
    expect(() => { p.loadFromJson(JSON.stringify(mockPolicies.invalid)); }).to.throw();

    expect(p.rules).to.be.lengthOf(0);
  });
});
