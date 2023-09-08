/*
 * Created By Eric Horsman and Mandy Swinton
 * DQL and Typescript Help from Ryan Shaw
 *
 * This typscript code looks at all server in the environment and prices them out for AWS with and without resize
 *
 *
 * For information on dynatrace functions go to https://dt-url.net/functions-help
 */

import React, { Fragment, useEffect } from "react";
import { ProgressCircle } from "@dynatrace/strato-components-preview";
import { useDqlQuery } from "@dynatrace-sdk/react-hooks";

interface GetServersProps {
  setServers: any;
}

const entitiesQuery = `timeseries avg=avg(dt.host.cpu.usage), by:{dt.entity.host}, interval:5d
  | fieldsAdd CPUUsage=arrayFirst(avg)
  | lookup [timeseries avg2=avg(dt.host.memory.usage), by:{dt.entity.host}, interval:5d
  | fieldsAdd MemoryUsage=arrayFirst(avg2)
  | lookup [fetch dt.entity.host | fields entity.name, id, hosts, hypervisorType,osType, cloudType, cpuCores, physicalMemory], sourceField:dt.entity.host, lookupField:id], sourceField:dt.entity.host, lookupField:dt.entity.host 
  | fields host=lookup.lookup.entity.name, os=lookup.lookup.osType,CPU=lookup.lookup.cpuCores, Mem=(toDouble(lookup.lookup.physicalMemory) / 1000000000), MemoryUsage=lookup.MemoryUsage, CPUUsage,CloudType=lookup.lookup.cloudType 
  | filter isNotNull(host)
  | sort CloudType asc`;

export function GetServers({ setServers }: GetServersProps) {
  const { data, error, isLoading } = useDqlQuery({
    body: { query: entitiesQuery },
  });

  useEffect(() => {
    if (data?.records) {
      setServers(data?.records);
    }
  }, [setServers, data]);

  useEffect(() => {
    if (error) {
      console.log("Error in GetServers query:", error);
    }
  }, [error]);

  return (
    <Fragment>
      {isLoading && <ProgressCircle>Loading server list</ProgressCircle>}
      {error && <>Oups, something happened, could not load server list.</>}
    </Fragment>
  );
}
