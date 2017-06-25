/* @flow */

export class BusinessRule {
  ruleObject: any;

  constructor() {
    this.ruleObject = {};
  }

  loadJson(definition: string): void {
    this.ruleObject = JSON.parse(definition);

    if (!this.validateRule()) {
      throw new Error('Rule definition is invalid. Please check with the documentation.');
    }
  }

  defineRule(obj: any): void {
    this.ruleObject = obj;
    if (!this.validateRule()) {
      throw new Error('Rule definition is invalid. Please check with the documentation.');
    }
  }

  validateRule(): boolean {
    if (!this.ruleObject) {
      return false;
    }

    if (this.ruleObject && !this.ruleObject.condition) {
      return false;
    }

    return true;
  }

}


export default BusinessRule;
