import React, { ReactElement, cloneElement } from "react";
import { _mergeProps } from "@dynatrace/strato-components-preview/core";

type MappingProps = {
  /** Real filtering element */
  children: ReactElement;
  /** state control props - controlled version */
  onChange?: (value: string[]) => void;
  value?: unknown;
  /** state control props - uncontrolled version */
  defaultValue?: unknown;
};

export function Mapper(props: MappingProps) {
  const { children, defaultValue, value, onChange } = props;
  // Select-specific prop, which will be different for another FormControl
  const { defaultSelectedId, selectedId } = children.props;
  return (
    <>
      {cloneElement(children, {
        ..._mergeProps(children.props, {
          value: defaultSelectedId || defaultValue || selectedId || value,
          onChange,
        }),
      })}
    </>
  );
}
