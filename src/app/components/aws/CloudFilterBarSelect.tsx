import React from "react";
import { Select, SelectOption } from "@dynatrace/strato-components-preview";
import { Mapper } from "../Mapper";

interface CloudFilterBarSelectProps {
  name: string;
  handleSetValue: any;
  defaultValue: any;
  valueList: any[];
  isDisabled?: boolean;
  isClearable?: boolean;
}

export function CloudFilterBarSelect({
  name,
  handleSetValue,
  defaultValue,
  valueList,
  isDisabled = false,
  isClearable = false,
}: CloudFilterBarSelectProps) {
  return (
    <Mapper defaultValue={[defaultValue]} onChange={handleSetValue}>
      <Select
        defaultSelectedId={[defaultValue]}
        name={name}
        id={`${name}-select`}
        disabled={isDisabled}
        clearable={isClearable}
      >
        {valueList.map((item) => (
          <SelectOption key={item} id={item}>
            {item}
          </SelectOption>
        ))}
      </Select>
    </Mapper>
  );
}
