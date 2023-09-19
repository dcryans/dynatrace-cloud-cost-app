import { HostInfo, nullCloudTypeLabel } from "../queries/CloudQueries";
import { applyDiscountPct } from "../hooks/useAWSAnalysisResults";
import { PriceDirect } from "./PriceDirect";
import { RightSize } from "./RightSize";

const hoursPerYear = 365 * 24;

export class CloudSums {
  sumPriceWithUtil: number;
  sumPriceDirect: number;
  numServers: number;
  numResize: number;
  awscostdirect: number;
  awscostresize: number;
  onPremcostdirect: number;
  onPremcostresize: number;

  constructor() {
    this.sumPriceWithUtil = 0;
    this.sumPriceDirect = 0;
    this.numServers = 0;
    this.numResize = 0;
    this.awscostdirect = 0;
    this.awscostresize = 0;
    this.onPremcostdirect = 0;
    this.onPremcostresize = 0;
  }

  incrementSums(
    server: HostInfo,
    priceDirect: PriceDirect,
    rightSize: RightSize
  ) {
    if (
      priceDirect.minCostDirect === Infinity ||
      rightSize.minCostWithUtil === Infinity
    ) {
      return;
    }

    const { matchingInstanceTypeDirect, minCostDirect } = priceDirect;
    const { matchingInstanceTypeWithUtil, minCostWithUtil } = rightSize;

    if (matchingInstanceTypeWithUtil) {
      this.sumPriceWithUtil += minCostWithUtil;
    }

    if (matchingInstanceTypeDirect) {
      this.sumPriceDirect += minCostDirect;
    }

    this.numServers += 1;

    if (minCostDirect === minCostWithUtil) {
      this.numResize += 1;
    }

    if (server.CloudType == "EC2") {
      this.awscostdirect += minCostDirect;
      this.awscostresize += minCostWithUtil;
    } else if (server.CloudType === nullCloudTypeLabel) {
      this.onPremcostdirect += minCostDirect;
      this.onPremcostresize += minCostWithUtil;
    }
  }

  getDisplayValues(discountPct: number) {
    const ResizedCost = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(
      applyDiscountPct(
        this.sumPriceDirect * hoursPerYear - this.sumPriceWithUtil * hoursPerYear,
        discountPct
      )
    );

    const EstimatedCost = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(this.sumPriceDirect * hoursPerYear, discountPct));

    const AWSCost = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(this.awscostdirect * hoursPerYear, discountPct));

    const AWS_RightSized = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(this.awscostresize * hoursPerYear, discountPct));

    const onPrem_to_AWS_Cost = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(this.onPremcostdirect * hoursPerYear, discountPct));

    const onPrem_to_AWS_RCost = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(this.onPremcostresize * hoursPerYear, discountPct));

    return {
      Servers: this.numServers,
      Resizeable: this.numServers - this.numResize,
      EstimatedCost,
      ResizedCost,
      AWSCost,
      AWS_RightSized,
      onPrem_to_AWS_Cost,
      onPrem_to_AWS_RCost,
    };
  }
}
