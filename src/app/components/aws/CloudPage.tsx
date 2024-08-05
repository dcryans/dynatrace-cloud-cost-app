import React, { Fragment, useState, useCallback } from "react";
import { GetInstanceTypes } from "./GetInstanceTypes";
import { useAWSAnalysisResults } from "./hooks/useAWSAnalysisResults";
import { AnalysisResult } from "./AnalysisResult";
import { GetRecordsFromDQL } from "./GetRecordsFromDQL";
import {
  CloudFilterBar,
  DEFAULT_CLOUD_TYPE,
  DEFAULT_DISCOUNT_PCT,
  DEFAULT_TARGET_UTIL,
} from "./CloudFilterBar";
import { HostInfo, getServerListQuery } from "./queries/CloudQueries";
import { AWSPricingRecord } from "../../../models/types";
import { DEFAULT_REGION } from "./GetAWSRegions";
export function CloudPage() {
  const [servers, setServers] = useState<HostInfo[] | undefined>(undefined);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [targetUtil, setTargetUtil] = useState(DEFAULT_TARGET_UTIL);
  const [cloudType, setCloudType] = useState<string | undefined>(
    DEFAULT_CLOUD_TYPE
  );
  const [discountPct, setDiscountPct] = useState(DEFAULT_DISCOUNT_PCT);

  const [instanceTypes, setInstanceTypes] = useState<
    AWSPricingRecord[] | undefined
  >(undefined);

  const awsAnalysisResults = useAWSAnalysisResults(
    servers,
    instanceTypes,
    region,
    targetUtil,
    discountPct
  );
  const handleSetRegion = useCallback(
    (newValue: any, firstCall = false) => {
      if (
        firstCall ||
        (instanceTypes !== undefined && newValue)
      ) {
        setInstanceTypes(undefined);
        setRegion(newValue);
      }
    },
    [instanceTypes, setRegion]
  );
  const handleSetTargetUtil = useCallback(
    (newValue: any) => {
      setTargetUtil(Number(newValue));
    },
    [setTargetUtil]
  );
  const handleSetCloudType = useCallback(
    (newValue: any) => {
      setCloudType(newValue);
    },
    [setCloudType]
  );

  const handleSetDiscountPct = useCallback(
    (newValue: number) => {
      setDiscountPct(newValue);
    },
    [setDiscountPct]
  );

  return (
    <Fragment>
      <CloudFilterBar
        region={region}
        cloudType={cloudType}
        targetUtil={targetUtil}
        handleSetRegion={handleSetRegion}
        handleSetTargetUtil={handleSetTargetUtil}
        handleSetCloudType={handleSetCloudType}
        handleSetDiscountPct={handleSetDiscountPct}
        isLoadingAWSData={instanceTypes == undefined}
      />
      {awsAnalysisResults && (
        <AnalysisResult awsAnalysisResults={awsAnalysisResults} />
      )}
      <GetRecordsFromDQL
        query={getServerListQuery(cloudType)}
        label="server list"
        setRecords={setServers}
      />
      <GetInstanceTypes region={region} setInstanceTypes={setInstanceTypes} />
    </Fragment>
  );
}
