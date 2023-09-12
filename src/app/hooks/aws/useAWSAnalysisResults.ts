/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import { useEffect, useState } from "react";

export interface AnalysisResults {
  region: string;
  utili_results: any[];
  sum_results: any[];
}

export const useAWSAnalysisResults = (
  servers: any,
  instanceTypes: any,
  region: string,
  targetUtilization: number,
  discountPct: number
) => {
  const [analysisResult, setAnalysisResult] = useState<
    AnalysisResults | undefined
  >();

  useEffect(() => {
    setAnalysisResult(undefined);

    if (servers == undefined || instanceTypes == undefined) {
      return;
    }
    const targetUtilizationPct = targetUtilization / 100;

    // Variables to store the sum of prices and servers
    let sumPriceWithUtil = 0;
    let sumPriceDirect = 0;
    let numServers = 0;
    let numResize = 0;
    let awscostdirect = 0;
    let awscostresize = 0;
    let onPremcostdirect = 0;
    let onPremcostresize = 0;

    // Target utilize for resizes
    //const target_u = 0.75;

    // Initializing the arrays to utilization and data results
    const analysisResult: AnalysisResults = {
      region,
      utili_results: [],
      sum_results: [],
    };

    // Loop iterates through each server from DQL for the overall stats
    for (const server of servers) {
      const {
        hostId,
        CPU: cpu,
        Mem: memory,
        CPUUsage,
        MemoryUsage,
        os,
        CloudType: cloud,
        host,
      } = server;
      const cpuU = CPUUsage / 100; // Convert CPU utilization to a decimal
      const memU = MemoryUsage / 100; // Convert memory utilization to a decimal

      let matchingInstanceTypeWithUtil: string | null = null;
      let minCostWithUtil = Infinity;
      let matchingInstanceTypeDirect: string | null = null;
      let minCostDirect = Infinity;
      let vcpu_util = Infinity;
      let vmem_util = Infinity;

      //Iterate through the list to match direct and min cost instance
      for (const instanceType of instanceTypes) {
        //Make instanceType Upper Case to match DQl
        instanceType.os = instanceType.os.toUpperCase(instanceType.os);

        if (
          instanceType.vcpu >= cpu &&
          instanceType.memory >= memory &&
          instanceType.os == os
        ) {
          const cost = instanceType.price;
          if (cost < minCostDirect) {
            minCostDirect = cost;
            matchingInstanceTypeDirect = instanceType.instanceType;
          }
        }

        //Iterate thorugh the list of instances to find the right sized instance
        if (
          instanceType.vcpu >= cpu * cpuU * (2 - targetUtilizationPct) &&
          instanceType.memory >= memory * memU * (2 - targetUtilizationPct) &&
          instanceType.os == os
        ) {
          const cost = instanceType.price;
          if (cost < minCostWithUtil) {
            minCostWithUtil = cost;
            vcpu_util = instanceType.vcpu;
            vmem_util = instanceType.memory;
            matchingInstanceTypeWithUtil = instanceType.instanceType;
          }
        }
      } //Ends InstanceType for loop

      // Sum up resize pricing up and down
      if (matchingInstanceTypeWithUtil) {
        sumPriceWithUtil += minCostWithUtil;
      }

      // Sum up all direct (lift and shift) pricing
      if (matchingInstanceTypeDirect) {
        sumPriceDirect += minCostDirect;
      }

      // Count the number of servers
      numServers += 1;

      // Count the number of servers with resize
      if (minCostDirect === minCostWithUtil) {
        numResize += 1;
      }

      // Get the AWS Estimates
      if (cloud == "EC2") {
        awscostdirect = awscostdirect + minCostDirect;
        awscostresize = awscostresize + minCostWithUtil;
      }

      // Get the onPrem Estimates --- Not working, not sure why yet ****
      if (cloud === null) {
        onPremcostdirect = onPremcostdirect + minCostDirect;
        onPremcostresize = onPremcostresize + minCostWithUtil;
      }

      //Get full result set
      analysisResult.utili_results.push({
        HostId: hostId,
        Host: host,
        OS: os,
        CPU: cpu,
        Memory: memory,
        Cloud: cloud,
        CPU_Util: cpuU * 100,
        Mem_Util: memU * 100,
        Direct_Instance: matchingInstanceTypeDirect,
        Direct_price: applyDiscountPct(minCostDirect, discountPct),
        RSized_Instance: matchingInstanceTypeWithUtil,
        RSized_Price: applyDiscountPct(minCostWithUtil, discountPct),
        RSized_VCPU: vcpu_util,
        RSized_VMem: vmem_util,
      });
    } //Ends server Loop

    // Changes format to currency and USD.
    const formattedSum = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(
      applyDiscountPct(
        sumPriceDirect * 8740 - sumPriceWithUtil * 8740,
        discountPct
      )
    );

    const formattedSumDirect = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(sumPriceDirect * 8740, discountPct));

    const formattedaws = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(awscostdirect * 8740, discountPct));

    const formattedawsutil = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(awscostresize * 8740, discountPct));

    const formattedonPrem = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(onPremcostdirect * 8740, discountPct));

    const formattedonPremutil = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(applyDiscountPct(onPremcostresize * 8740, discountPct));

    // Fill in sum results array for returning values
    analysisResult.sum_results.push({
      Servers: numServers,
      Resizeable: numServers - numResize,
      EstimatedCost: formattedSumDirect,
      ResizedCost: formattedSum,
      AWSCost: formattedaws,
      AWS_RightSized: formattedawsutil, //,
      //onPrem_to_AWS_Cost: formattedonPrem,
      //onPrem_to_AWS_RCost: formattedonPremutil
    });
    setAnalysisResult(analysisResult);
  }, [servers, instanceTypes, targetUtilization, region, discountPct]);

  return analysisResult;
};

const applyDiscountPct = (cost: number, pct: number): number => {
  return cost * ((100 - pct) / 100);
};
