import { AWSPricingRecord } from "../../../../models/types";

export class RightSize {
  matchingInstanceTypeWithUtil: string | null;
  minCostWithUtil: number;
  vcpu_util: number;
  vmem_util: number;

  constructor(instanceType: AWSPricingRecord | null) {
    if (instanceType) {
      this.minCostWithUtil = instanceType.price;
      this.vcpu_util = instanceType.vcpu;
      this.vmem_util = instanceType.memory;
      this.matchingInstanceTypeWithUtil = instanceType.instanceType;
    } else {
      this.matchingInstanceTypeWithUtil = null;
      this.minCostWithUtil = Infinity;
      this.vcpu_util = Infinity;
      this.vmem_util = Infinity;
    }
  }
}
