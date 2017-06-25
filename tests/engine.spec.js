/* global describe, it, _ */

import {
  Policy,
  PolicyRule
} from '../src/policy';
import {
  BusinessRule
} from '../src/rule';
import {
  RulesEngine
} from '../src/engine';
import mockPolicies from './mocks/policy.json';

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const expect = chai.expect;
const should = chai.should;

should();


describe("RulesEngine", () => {
  it("should create a new engine with the specified policy", () => {
    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.simple));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
  });

  it("should validate a true fact", () => {
    const fact = {
      weight: 100,
      constructionYear: 1976
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.simple));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: true, link: undefined });
  });

  it("should detect issues with a false fact", () => {
    const fact = {
      weight: 0,
      constructionYear: 1976
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.simple));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: false, link: undefined });
  });

  it("should process all rules when checking a fact", () => {
    const fact = {
      weight: 0,
      constructionYear: 1976
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.simple3));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(3);
    return eng.checkFact(fact).then((result) => {
      expect(result.result).to.be.false; // eslint-disable-line no-unused-expressions
      expect(eng.errors).to.be.lengthOf(2);
      return result;
    });
  });

  it("should process OR links for a true fact", () => {
    const fact = {
      lastName: "Doe",
      firstName: "John"
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.simpleor));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: true, link: undefined });
  });

  it("should process OR links for a false fact", () => {
    const fact = {
      fullName: "John Doe",
      city: "Los Angeles"
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.simpleor));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: false, link: undefined });
  });

  it("should process complex policies for a true fact", () => {
    const fact = {
      lastName: "Doe",
      firstName: "John"
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.complexor));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: true, link: undefined });
  });

  it("should process complex policies for a true fact", () => {
    const fact = {
      companyName: "Adventure Works"
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.complexor));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: true, link: undefined });
  });

  it("should process complex policies for a false fact", () => {
    const fact = {
      lastName: "Doe"
    };

    const p = new Policy();
    p.loadFromJson(JSON.stringify(mockPolicies.complexor));
    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: false, link: undefined });
  });

  it("should process complex policy created from code for a true fact", () => {
    const fact = {
      lastName: "Smith",
      firstName: "Anne"
    };

    const p = new Policy();
    const br1 = new BusinessRule();
    br1.defineRule({
      condition: {
        type: "custom",
        evaluateCondition: (f, policyRule, errors, prevResult, link) => {
          const result = (f.lastName && f.firstName && f.lastName.length > 0 && f.firstName.length > 0);
          if (!result) { errors.push("First name and last name are mandatory for an individual or company name for an organization."); }

          if (link === "AND") {
            return Promise.resolve({ result: (prevResult && result), link: policyRule.link });
          } else if (link === "OR") {
            return Promise.resolve({ result: (prevResult || result), link: policyRule.link });
          }

          return Promise.reject(`Invalid link parameter ${link}. Allowed values are 'AND' or 'OR'.`);
        }
      }
    });
    const pr1: PolicyRule = {
      link: "OR",
      name: "Check individual",
      order: 1,
      rule: br1
    };
    const br2 = new BusinessRule();
    br2.defineRule({
      condition: {
        type: "predefined",
        operation: "required",
        params: {
          value: "companyName",
          message: "The last name or company name is required."
        }
      }
    });

    const pr2: PolicyRule = {
      rule: br2,
      name: "Check Company",
      order: 2,
    };

    p.addRule(pr1);
    p.addRule(pr2);

    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: true, link: undefined });
  });

  it("should process complex policy created from code for a false fact", () => {
    const fact = {
      lastName: "Smith"
    };

    const p = new Policy();
    const br1 = new BusinessRule();
    br1.defineRule({
      condition: {
        type: "custom",
        evaluateCondition: (f, policyRule, errors, prevResult, link) => {
          const result = (f.lastName && f.firstName && f.lastName.length > 0 && f.firstName.length > 0);
          if (!result) { errors.push("First name and last name are mandatory for an individual or company name for an organization."); }

          if (link === "AND") {
            return Promise.resolve({ result: (prevResult && result), link: policyRule.link });
          } else if (link === "OR") {
            return Promise.resolve({ result: (prevResult || result), link: policyRule.link });
          }

          return Promise.reject(`Invalid link parameter ${link}. Allowed values are 'AND' or 'OR'.`);
        }
      }
    });
    const pr1: PolicyRule = {
      link: "OR",
      name: "Check individual",
      order: 1,
      rule: br1
    };
    const br2 = new BusinessRule();
    br2.defineRule({
      condition: {
        type: "predefined",
        operation: "required",
        params: {
          value: "companyName",
          message: "The last name or company name is required."
        }
      }
    });

    const pr2: PolicyRule = {
      rule: br2,
      name: "Check Company",
      order: 2,
    };

    p.addRule(pr1);
    p.addRule(pr2);

    const eng = new RulesEngine(p);
    expect(eng).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    expect(eng.policy.rules).to.be.lengthOf(2);
    return expect(eng.checkFact(fact)).to.eventually.eql({ result: false, link: undefined });
  });
});
