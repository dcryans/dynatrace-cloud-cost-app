import { AWSPricingRecord } from "../../../../models/types";

export class PriceDirect {
  minCostDirect: number;
  matchingInstanceTypeDirect: string | null;

  constructor(instanceType: AWSPricingRecord | null) {
    if (instanceType) {
      this.matchingInstanceTypeDirect = instanceType.instanceType;
      this.minCostDirect = instanceType.price;
    } else {
      this.matchingInstanceTypeDirect = null;
      this.minCostDirect = Infinity;
    }
  }
}
