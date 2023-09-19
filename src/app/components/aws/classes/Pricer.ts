import { AWSPricingRecord } from "../../../../models/types";
import { sortOsPrice } from "../../../common/sortPricing";
import { HostInfo } from "../queries/CloudQueries";
import { MinPriceByOs } from "./MinPriceByOs";
import { PriceDirect } from "./PriceDirect";
import { RightSize } from "./RightSize";

interface BestPriceParams {
  os: string;
  CPU: number;
  Mem: number;
}

export class Pricer {
  _prices: AWSPricingRecord[];
  _minPriceByOs: MinPriceByOs;
  _targetUtilizationPct: number;

  constructor(instanceTypes: AWSPricingRecord[]) {
    this._prices = [];

    for (const instanceType of instanceTypes) {
      instanceType.os = instanceType.os.toUpperCase();
      this._prices.push(instanceType);
    }

    this._prices = sortOsPrice(this._prices) as AWSPricingRecord[];
    console.log(this._prices)

    this._minPriceByOs = new MinPriceByOs(this._prices);
    this._targetUtilizationPct = 0
  }

  setTargetUtilizationPct(targetUtilization: number) {
    this._targetUtilizationPct = targetUtilization / 100;
  }

  getPriceDirect(server: HostInfo): PriceDirect {
    let bestInstanceType: AWSPricingRecord | null = null;
    let exactMatchDirectNotFound = true;
    const { AWSModel } = server;

    for (const instanceType of this._prices) {
      if (instanceType.instanceType == AWSModel) {
        exactMatchDirectNotFound = false;
        bestInstanceType = instanceType;
      }
    }

    if (exactMatchDirectNotFound) {
      const instanceType = this.getBestPrice(server);

      if (instanceType !== null) {
        bestInstanceType = instanceType;
      }
    }
    return new PriceDirect(bestInstanceType);
  }

  getRightSize(server: HostInfo): RightSize {
    const { os, CPU, Mem, CPUUsage, MemoryUsage } = server;

    const targetParam: BestPriceParams = {
      os: os,
      CPU: this.getTargetUsage(CPU, CPUUsage),
      Mem: this.getTargetUsage(Mem, MemoryUsage),
    };
    const instanceType = this.getBestPrice(targetParam);

    return new RightSize(instanceType);
  }

  private getTargetUsage(resource: number, resourceUsage: number): number {
    const resourceUsagePct = resourceUsage / 100;
    return (resource * resourceUsagePct) / this._targetUtilizationPct;
  }

  private getBestPrice(server: BestPriceParams) {
    let instanceType: AWSPricingRecord | null = null;
    const { os, CPU, Mem } = server;

    if (os in this._minPriceByOs) {
      // pass
    } else {
      return instanceType;
    }
    const minPrice = this._minPriceByOs[os];

    let cpuPos = -1;
    for (const { resource, position } of minPrice.cpuPosSorted) {
      if (resource >= CPU) {
        cpuPos = position;
        break;
      }
    }

    let memPos = -1;
    for (const { resource, position } of minPrice.memPosSorted) {
      if (resource >= Mem) {
        memPos = position;
        break;
      }
    }

    if (memPos >= 0 && cpuPos >= 0) {
      let startPos = memPos;
      if (cpuPos > startPos) {
        startPos = cpuPos;
      }

      for (let j = startPos; j <= minPrice.osEndPos; j++) {
        const instanceRec = this._prices[j];
        if (instanceRec.vcpu >= CPU && instanceRec.memory >= Mem) {
          instanceType = instanceRec;
          break;
        }
      }
    }

    return instanceType;
  }
}
