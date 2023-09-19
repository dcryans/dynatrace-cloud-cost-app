/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import { useEffect, useState, useMemo } from "react";
import { AWSPricingRecord } from "../../../../models/types";
import { HostInfo } from "../queries/CloudQueries";
import { CloudSums } from "../classes/CloudSums";
import { Pricer } from "../classes/Pricer";
import { PriceDirect } from "../classes/PriceDirect";
import { RightSize } from "../classes/RightSize";

export interface AnalysisResults {
  region: string;
  utili_results: any[];
  sum_results: any[];
}

export const useAWSAnalysisResults = (
  servers: HostInfo[] | undefined,
  instanceTypes: AWSPricingRecord[] | undefined,
  region: string,
  targetUtilization: number,
  discountPct: number
) => {
  const [analysisResult, setAnalysisResult] = useState<
    AnalysisResults | undefined
  >();

  const pricer = usePricer(instanceTypes);

  useEffect(() => {
    setAnalysisResult(undefined);

    if (servers && pricer) {
      // pass
    } else {
      return;
    }

    pricer.setTargetUtilizationPct(targetUtilization)

    const analysisResult = processServerPrices(
      servers,
      pricer,
      region,
      discountPct
    );

    setAnalysisResult(analysisResult);
  }, [servers, pricer, targetUtilization, region, discountPct]);

  return analysisResult;
};

function processServerPrices(
  servers: HostInfo[],
  pricer: Pricer,
  region: string,
  discountPct: number
) {
  const analysisResult: AnalysisResults = {
    region,
    utili_results: [],
    sum_results: [],
  };

  const sums = new CloudSums();

  for (const server of servers) {
    const priceDirect = pricer.getPriceDirect(server);

    const rightSize = pricer.getRightSize(server);

    sums.incrementSums(server, priceDirect, rightSize);

    analysisResult.utili_results.push(
      buildUtiliResult(server, priceDirect, rightSize, discountPct)
    );
  }

  analysisResult.sum_results.push(sums.getDisplayValues(discountPct));

  return analysisResult;
}

function usePricer(instanceTypes: AWSPricingRecord[] | undefined) {
  return useMemo(() => {
    if (instanceTypes && instanceTypes.length && instanceTypes.length > 0) {
      // pass
    } else {
      return undefined;
    }

    const pricer = new Pricer(instanceTypes);

    return pricer;
  }, [instanceTypes]);
}

export const applyDiscountPct = (cost: number, pct: number): number => {
  return cost * ((100 - pct) / 100);
};

function buildUtiliResult(
  server: HostInfo,
  priceDirect: PriceDirect,
  rightSize: RightSize,
  discountPct: number
): any {
  const directPrice = applyDiscountPct(priceDirect.minCostDirect, discountPct);
  const rightSizePrice = applyDiscountPct(
    rightSize.minCostWithUtil,
    discountPct
  );

  return {
    HostId: server.hostId,
    Host: server.host,
    OS: server.os,
    Savings: directPrice - rightSizePrice,
    CPU: server.CPU,
    Memory: server.Mem,
    Cloud: server.CloudType,
    CPU_Util: server.CPUUsage,
    Mem_Util: server.MemoryUsage,
    Direct_Instance: priceDirect.matchingInstanceTypeDirect,
    Direct_price: directPrice,
    RSized_Instance: rightSize.matchingInstanceTypeWithUtil,
    RSized_Price: rightSizePrice,
    RSized_VCPU: rightSize.vcpu_util,
    RSized_VMem: rightSize.vmem_util,
  };
}
