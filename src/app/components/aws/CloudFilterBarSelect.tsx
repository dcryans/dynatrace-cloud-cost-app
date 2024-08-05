import React from "react";
import { SelectV2 } from "@dynatrace/strato-components-preview";

interface CloudFilterBarSelectProps {
  name: string;
  handleSetValue: any;
  currentValue: any;
  valueList: any[];
  isDisabled?: boolean;
  isClearable?: boolean;
}

export function CloudFilterBarSelect({
  name,
  handleSetValue,
  currentValue,
  valueList,
  isDisabled = false,
  isClearable = false,
}: CloudFilterBarSelectProps) {


  return (
      <SelectV2
        name={name}
        id={`${name}-select`}
        value={currentValue}
        onChange={handleSetValue}
        disabled={isDisabled}
        clearable={isClearable}
      >
        <SelectV2.Content>
          {valueList.map((item) => (
            <SelectV2.Option value={item} id={item}>
              {item}
            </SelectV2.Option>
          ))}
        </SelectV2.Content>
      </SelectV2>
  );
}
