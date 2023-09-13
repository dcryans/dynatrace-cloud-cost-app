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
import { getServerListQuery } from "./queries/CloudQueries";
import { AWSPricingRecord } from "../../../../api/get-aws-pricing";

export function CloudPage() {
  const [servers, setServers] = useState<any | undefined>(undefined);
  const [region, setRegion] = useState("");
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
    (newValue: string[], firstCall = false) => {
      if (
        firstCall ||
        (instanceTypes !== undefined && newValue && newValue.length > 0)
      ) {
        setInstanceTypes(undefined);
        setRegion(newValue[0]);
      }
    },
    [instanceTypes, setRegion]
  );
  const handleSetTargetUtil = useCallback(
    (newValue: string[]) => {
      if (newValue && newValue.length > 0) {
        setTargetUtil(Number(newValue[0]));
      }
    },
    [setTargetUtil]
  );
  const handleSetCloudType = useCallback(
    (newValue: string[]) => {
      if (newValue && newValue.length > 0) {
        setCloudType(newValue[0]);
      } else {
        setCloudType(undefined);
      }
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
