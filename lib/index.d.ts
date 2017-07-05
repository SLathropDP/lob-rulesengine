declare module 'lob-rulesengine' {
  export class BusinessRule {
    public ruleObject: any;
    loadJson(definition: string): void;
    defineRule(obj: any): void;
    validateRule(): boolean;
  }

  export interface PolicyRule {
    rule: BusinessRule;
    rules: PolicyRule[];
    name?: string;
    order: number;
    link?: string;
  }

  export class Policy {
    public rules: Array<PolicyRule>;
    constructor(initialRules: Array<PolicyRule>);
    addRule(newRule: PolicyRule): boolean;
    removeRuleAtOrder(order: number): PolicyRule[];
    removeRuleByName(name: string): PolicyRule[];
    clearRules(): void;
    loadFromJson(data: string): void;
  }

  export class RulesEngine {
    public policy: Policy;
    public errors: string[];
    constructor(policy: Policy);
    setPolicy(newPolicy: Policy): void;
    checkFact(fact: any): Promise<any>;
  }
}