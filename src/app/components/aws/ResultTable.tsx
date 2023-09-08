import React, { Fragment, useMemo } from "react";
import { DataTable } from "@dynatrace/strato-components-preview";
import type { TableColumn } from "@dynatrace/strato-components-preview/tables";

interface ResultTableProps {
  result: any[];
}

export function ResultTable({ result }: ResultTableProps) {
  const tableComponent = useMemo(() => {
    if (result && result.length > 0 && result[0]) {
      const headers: TableColumn[] = [];
      for (const key of Object.keys(result[0])) {
        headers.push({
          accessor: key,
        });
      }
      return <DataTable columns={headers} data={result}></DataTable>;
    } else {
      return null;
    }
  }, [result]);

  return <Fragment>{tableComponent}</Fragment>;
}
