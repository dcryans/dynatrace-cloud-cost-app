/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  DataTable,
  Divider,
  Paragraph,
  Text,
  Flex,
} from "@dynatrace/strato-components-preview";
import type { TableColumn } from "@dynatrace/strato-components-preview/tables";
import { TARGET_UTILIZATION } from "./AWSPriceTables";
//import * as fs from 'fs';
//import React, { useState } from 'react';
//import ReactDOM from 'react-dom';
//import findLeastCostInstance from ./aws_least_cost_details.ts;  /not used yet

// *****************************************************************************************************
// ******************                ADJUST ONLY these two variables.
//  ****************************************************************************************************
export const AWSPriceJsonFile =
  "https://erichlifecycel.s3.us-east-2.amazonaws.com/aws_prices2.json"; // AWS East Json from a month ago
export const entitiesQuery = `timeseries avg=avg(dt.host.cpu.usage), by:{dt.entity.host}, interval:5d
  | fieldsAdd CPUUsage=arrayFirst(avg)
  | lookup [timeseries avg2=avg(dt.host.memory.usage), by:{dt.entity.host}, interval:5d
  | fieldsAdd MemoryUsage=arrayFirst(avg2)
  | lookup [fetch dt.entity.host | fields entity.name, id, hosts, hypervisorType,osType, cloudType, cpuCores, physicalMemory], sourceField:dt.entity.host, lookupField:id], sourceField:dt.entity.host, lookupField:dt.entity.host 
  | fields host=lookup.lookup.entity.name, os=lookup.lookup.osType,CPU=lookup.lookup.cpuCores, Mem=(toDouble(lookup.lookup.physicalMemory) / 1000000000), MemoryUsage=lookup.MemoryUsage, CPUUsage,CloudType=lookup.lookup.cloudType 
  | filter isNotNull(host)
  | sort CloudType asc | limit 100`;

interface InstanceType {
  vcpu: number;
  memory: number;
  os: string;
  price: number;
  instanceType: string;
}
interface PriceTableYearlyProps {
  servers: any;
  instanceTypes: any;
}

export function PriceTableYearly({servers, instanceTypes}: PriceTableYearlyProps) {
  const [additionalText, setAdditionalText] = useState<string[]>([]);
  const [results, setResults] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    if (servers == undefined || instanceTypes == undefined) {
      return;
    }

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
    const utili_results: any[] = [];
    const sum_results: any[] = [];

    // Loop iterates through each server from DQL for the overall stats
    for (const server of servers) {
      //const [host, os, CPU, Mem, MemU, CPUU, Cloud]=0;
      const cpu = server.CPU;
      const memory = server.Mem;
      const cpuU = server.CPUUsage / 100; // Convert CPU utilization to a decimal
      const memU = server.MemoryUsage / 100; // Convert memory utilization to a decimal
      //var os = new String(server.os);
      const os = server.os;
      const host = server.host;
      const cloud = server.CloudType;

      //console.log(host);   Test Logging
      //console.log(os);   Test Logging

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
        //console.log(instanceType.os); // test logging

        if (
          instanceType.vcpu >= cpu &&
          instanceType.memory >= memory &&
          instanceType.os == os
        ) {
          const cost = instanceType.price;
          //console.log("here: ",cost); //Test Logging
          if (cost < minCostDirect) {
            minCostDirect = cost;
            matchingInstanceTypeDirect = instanceType.instanceType;
          }
        }

        //Iterate thorugh the list of instances to find the right sized instance
        if (
          instanceType.vcpu >= cpu * cpuU * (2 - TARGET_UTILIZATION) &&
          instanceType.memory >= memory * memU * (2 - TARGET_UTILIZATION) &&
          instanceType.os == os
        ) {
          const cost = instanceType.price;
          //console.log("here2: ",cost); /Test Logging
          if (cost < minCostWithUtil) {
            minCostWithUtil = cost;
            vcpu_util = instanceType.vcpu;
            vmem_util = instanceType.memory;
            matchingInstanceTypeWithUtil = instanceType.instanceType;
          }
        }
        //console.log(instanceType.price); //Test Logging
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
      utili_results.push({
        Host: host,
        OS: os,
        CPU: cpu,
        Memory: memory,
        Cloud: cloud,
        CPU_Util: cpuU * 100,
        Mem_Util: memU * 100,
        Direct_Instance: matchingInstanceTypeDirect,
        Direct_price: minCostDirect,
        RSized_Instance: matchingInstanceTypeWithUtil,
        RSized_Price: minCostWithUtil,
        RSized_VCPU: vcpu_util,
        RSized_VMem: vmem_util,
      });
    } //Ends server Loop

    // Changes format to currency and USD.
    const formattedSum = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(sumPriceDirect * 8740 - sumPriceWithUtil * 8740);

    const formattedSumDirect = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(sumPriceDirect * 8740);

    const formattedaws = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(awscostdirect * 8740);

    const formattedawsutil = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(awscostresize * 8740);

    const formattedonPrem = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(onPremcostdirect * 8740);

    const formattedonPremutil = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(onPremcostresize * 8740);

    // Fill in sum results array for returning values
    sum_results.push({
      Servers: numServers,
      Resizeable: numServers - numResize,
      EstimatedCost: formattedSumDirect,
      ResizedCost: formattedSum,
      AWSCost: formattedaws,
      AWS_RightSized: formattedawsutil, //,
      //onPrem_to_AWS_Cost: formattedonPrem,
      //onPrem_to_AWS_RCost: formattedonPremutil
    });

    // Summary also shows up in the console.log
    // Print the high-level summary of migration
    // console.log("---- Migrating to", region_code, "Totals ------");
    const add_text: string[] = [];
    add_text.push(
      [
        "Out of",
        numServers,
        "Servers",
        numServers - numResize,
        "can be resized.",
      ].join(" ")
    );
    // console.log("We Evaluated", numServers, "servers to migrate to", region_code, ".");
    add_text.push(
      [
        "Lift and Shift:",
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(sumPriceDirect * 8740),
      ].join(" ")
    );
    add_text.push(
      [
        "Resize and Move:",
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(sumPriceWithUtil * 8740),
      ].join(" ")
    );
    add_text.push(["Save", formattedSum, "per year with resizing!!"].join(" "));
    add_text.push(
      [
        "************************************************************************************",
      ].join(" ")
    );

    setAdditionalText(add_text);

    // -------Only can return one item and will return the first return -------
    // ----- Server Returns ---------
    //return servers[2].host //return just the host field of the of the servers array in the second record, this is a test return
    //console.log(instanceTypes[302]); // Test Return

    // These will return the overall arrays coming from the code.  I use both in the dashboard in two different widgets or tiles
    //return utili_results;   // Returns Server Details results with resizing and AWS prices
    setResults(sum_results); // Returns pricing and resize summurization results.
  }, [servers, instanceTypes]);

  const tableComponent = useMemo(() => {
    console.log(results);
    if (results) {
      const headers: TableColumn[] = [];
      for (const key of Object.keys(results[0])) {
        headers.push({
          accessor: key,
        });
      }
      return <DataTable columns={headers} data={results}></DataTable>;
    } else {
      return null;
    }
  }, [results]);

  return (
    <Fragment>
      {tableComponent}
      <Flex flexItem mt={8}>
        <Divider />
        {genAdditionalText(additionalText)}
      </Flex>
    </Fragment>
  );
}

const genAdditionalText = (additionalText: string[]): React.JSX.Element => {
  if (additionalText) {
    // pass
  } else {
    return <Fragment />;
  }

  const components: React.JSX.Element[] = [];

  for (const text of additionalText) {
    components.push(<Text>{text}</Text>);
  }

  return <Paragraph>{components}</Paragraph>;
};
