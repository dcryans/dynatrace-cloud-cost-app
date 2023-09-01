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
import { DataTable } from "@dynatrace/strato-components-preview";
import type { TableColumn } from "@dynatrace/strato-components-preview/tables";
import { TARGET_UTILIZATION } from "./AWSPriceTables";
//import * as fs from 'fs';
//import React, { useState } from 'react';
//import ReactDOM from 'react-dom';
//import findLeastCostInstance from ./aws_least_cost_details.ts;  /not used yet

// *****************************************************************************************************
// ******************                ADJUST ONLY these two variables.
//  ****************************************************************************************************

interface InstanceType {
  vcpu: number;
  memory: number;
  os: string;
  price: number;
  instanceType: string;
}
interface PriceTableHourlyProps {
  servers: any;
  instanceTypes: any;
}

export function PriceTableHourly({
  servers,
  instanceTypes,
}: PriceTableHourlyProps) {
  const [results, setResults] = useState<any[] | undefined>(undefined);
  const [headers, setHeaders] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    if (servers == undefined || instanceTypes == undefined) {
      return;
    }

    // Initializing the arrays to utilization and data results
    const utili_results: any[] = [];
    const direct_results: any[] = [];

    // This iterates through each line of the csv for the overall stats
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

    // -------Only can return one item-------
    // ----- Server Returns ---------
    //return servers[2].host //return just the host field of the of the servers array in the second record, this is a test return
    //console.log(instanceTypes[302]); // Test Return

    setResults(utili_results); // Returns pricing and resize summurization results.
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

  return <Fragment>{tableComponent}</Fragment>;
}
