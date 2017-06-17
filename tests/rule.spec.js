/* global describe, it */

const BusinessRule = require('../src/rule');
const mockedRule = require('./mocks/rules.json');

const {
  expect,
  should
} = require("chai");

should();

describe("Rule", () => {
  it("should create an empty rule", () => {
    const r = new BusinessRule();
    expect(r).not.to.be.undefined; // eslint-disable-line no-unused-expressions
  });

  it("should detect an invalid rule", () => {
    const r = new BusinessRule();
    expect(() => {
      r.defineRule({
        foo: 'moo'
      });
    }).to.throw();
    const valid = r.validateRule();
    expect(valid).to.be.false; // eslint-disable-line no-unused-expressions
  });

  it("should detect a valid rule", () => {
    const r = new BusinessRule();
    r.defineRule({
      condition: 'something'
    });
    const valid = r.validateRule();
    expect(valid).to.be.true; // eslint-disable-line no-unused-expressions
  });

  it("should load a valid rule from JSON", () => {
    const r = new BusinessRule();
    r.loadJson(JSON.stringify(mockedRule.simple_gt));
    const valid = r.validateRule();
    expect(valid).to.be.true; // eslint-disable-line no-unused-expressions
  });

  it("should detect rule type 'simple' if no subrules are defined", () => {
    const r = new BusinessRule();
    r.loadJson(JSON.stringify(mockedRule.simple_gt));
    expect(r.ruleType()).equal("simple");
  });

  it("should detect rule type 'nested' if subrules are defined", () => {
    const r = new BusinessRule();
    r.loadJson(JSON.stringify(mockedRule.simple_gt));
    const nr = new BusinessRule();
    nr.subrules = [];
    nr.subrules.push(r);
    expect(nr.ruleType()).equal("nested");
  });
});
