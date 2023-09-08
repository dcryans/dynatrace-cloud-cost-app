import React, { Fragment, useState, useCallback } from "react";
import { GetInstanceTypes } from "./GetInstanceTypes";
import { useAWSAnalysisResults } from "../../hooks/aws/useAWSAnalysisResults";
import { AnalysisResult } from "./AnalysisResult";
import { GetRecordsFromDQL } from "./GetRecordsFromDQL";
import {
  CloudFilterBar,
  DEFAULT_CLOUD_TYPE,
  DEFAULT_TARGET_UTIL,
} from "./CloudFilterBar";
import { getServerListQuery } from "./queries/CloudQueries";

export function CloudPage() {
  const [servers, setServers] = useState<any | undefined>(undefined);
  const [region, setRegion] = useState("");
  const [targetUtil, setTargetUtil] = useState(DEFAULT_TARGET_UTIL);
  const [cloudType, setCloudType] = useState<string | undefined>(
    DEFAULT_CLOUD_TYPE
  );
  const [instanceTypes, setInstanceTypes] = useState<any | undefined>(
    undefined
  );
  const awsAnalysisResults = useAWSAnalysisResults(
    servers,
    instanceTypes,
    region,
    targetUtil
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

  return (
    <Fragment>
      <CloudFilterBar
        region={region}
        handleSetRegion={handleSetRegion}
        handleSetTargetUtil={handleSetTargetUtil}
        handleSetCloudType={handleSetCloudType}
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
