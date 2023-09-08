import React, { Fragment, useState } from "react";
import { DEFAULT_REGION, GetAWSRegions } from "./GetAWSRegions";
import { FilterBar } from "@dynatrace/strato-components-preview";
import { GetRecordsFromDQL } from "./GetRecordsFromDQL";
import { CloudFilterBarSelect } from "./CloudFilterBarSelect";
import { cloudTypeQuery } from "./queries/CloudQueries";

interface AWSFilterBarProps {
  region: string;
  handleSetRegion: any;
  handleSetTargetUtil: any;
  handleSetCloudType: any;
  isLoadingAWSData: boolean;
}

export const DEFAULT_TARGET_UTIL = 50;
const TARGET_UTIL_LIST = [50, 60, 75, 80, 85];
export const DEFAULT_CLOUD_TYPE = undefined;

export function CloudFilterBar({
  region,
  handleSetRegion,
  handleSetTargetUtil,
  handleSetCloudType,
  isLoadingAWSData,
}: AWSFilterBarProps) {
  const [regions, setRegions] = useState<string[]>([]);
  const [cloudTypes, setCloudTypes] = useState<string[]>([]);

  return (
    <Fragment>
      <FilterBar
        onFilterChange={() => {
          /* Insert filtering logic here */
        }}
      >
        {regions.length > 0 && region !== "" && (
          <FilterBar.Item name="Region" label="Region">
            <CloudFilterBarSelect
              name="region"
              defaultValue={DEFAULT_REGION}
              handleSetValue={handleSetRegion}
              isDisabled={isLoadingAWSData}
              valueList={regions}
            />
          </FilterBar.Item>
        )}
        <FilterBar.Item name="Target Utilization" label="Target Utilization">
          <CloudFilterBarSelect
            name="targetUtil"
            defaultValue={DEFAULT_TARGET_UTIL}
            handleSetValue={handleSetTargetUtil}
            isDisabled={isLoadingAWSData}
            valueList={TARGET_UTIL_LIST}
          />
        </FilterBar.Item>
        {cloudTypes.length > 0 && (
          <FilterBar.Item name="Cloud Type" label="Cloud">
            <CloudFilterBarSelect
              name="cloudType"
              defaultValue={DEFAULT_CLOUD_TYPE}
              handleSetValue={handleSetCloudType}
              isDisabled={isLoadingAWSData}
              valueList={cloudTypes}
              isClearable={true}
            />
          </FilterBar.Item>
        )}
      </FilterBar>
      <GetRecordsFromDQL
        query={cloudTypeQuery}
        label="cloud tyoes"
        setRecords={setCloudTypes}
        firstPropertyOnly={true}
      />

      <GetAWSRegions setRegions={setRegions} setRegion={handleSetRegion} />
    </Fragment>
  );
}
