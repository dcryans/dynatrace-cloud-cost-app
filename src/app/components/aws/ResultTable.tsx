import React, { Fragment, useCallback, useMemo, useState } from "react";
import {
  DataTable,
  Flex,
  FormField,
  Highlight,
  Text,
  TextInput,
} from "@dynatrace/strato-components-preview";
import Colors from "@dynatrace/strato-design-tokens/colors";
import type { TableColumn } from "@dynatrace/strato-components-preview/tables";
import { useEffectDebounced } from "../../hooks/useEffectDebounced";
import { getEnvironmentUrl } from "@dynatrace-sdk/app-environment";

interface ResultTableProps {
  result: any[];
}

export function ResultTable({ result }: ResultTableProps) {
  const [searchText, setSearchText] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");

  const handleTextChanged = useCallback(
    (newText: string) => {
      setSearchTextInput(newText.trim());
    },
    [setSearchTextInput]
  );

  const updateSearchTextFromInput = useCallback(() => {
    setSearchText(searchTextInput);
  }, [searchTextInput]);

  useEffectDebounced(updateSearchTextFromInput);

  const isMultipleRows = useMemo<boolean>(
    () => (result && result.length && result.length > 1 ? true : false),
    [result]
  );

  const hostCellFunction = useMemo(() => {
    const envUrl = getEnvironmentUrl();

    const hostCellFunc = ({ value, row }: { value: string; row: any }) => {
      let styledComponent: React.JSX.Element = <>{value}</>;
      if (searchText !== "") {
        styledComponent = <Highlight term={searchText}>{value}</Highlight>;
      }
      return (
        <a
          href={getHostHRef(envUrl, row)}
          target="_blank"
          rel=" noopener noreferrer"
        >
          {styledComponent}
        </a>
      );
    };

    return hostCellFunc;
  }, [searchText]);

  const headers = useMemo(() => {
    if (result && result.length > 0 && result[0]) {
      const headers: TableColumn[] = [];
      for (const [key, value] of Object.entries(result[0])) {
        if (key === "HostId") {
          continue;
        }
        const header: TableColumn = {
          accessor: key,
          alignment: "right",
        };
        if (typeof value == "number") {
          header.columnType = "number";
        }
        if (key === "Host") {
          header.cell = hostCellFunction;
          header.minWidth = 400;
        }
        if (key === "Savings") {
          header.cell = savingsCellFunc;
          header.columnType = "text";
        }
        headers.push(header);
      }
      if (headers.length > 0) {
        headers[headers.length - 1].alignment = "left";
      }

      return headers;
    } else {
      return null;
    }
  }, [result, hostCellFunction]);

  const filteredResult = useMemo<any[]>(() => {
    if (searchText === "") {
      return result;
    }
    const newResults: any[] = [];
    for (const resultRow of result) {
      if (containsSearchText(resultRow["Host"], searchText)) {
        newResults.push(resultRow);
      }
    }
    return newResults;
  }, [result, searchText]);

  return (
    <Fragment>
      {isMultipleRows && (
        <Flex>
          <FormField label="Host search">
            <TextInput defaultValue="" onChange={handleTextChanged} />
          </FormField>
        </Flex>
      )}
      {headers && (
        <DataTable
          columns={headers}
          data={filteredResult}
          sortable={isMultipleRows}
          resizable
        />
      )}
    </Fragment>
  );
}

function containsSearchText(value: string, searchText: string) {
  return value.toLowerCase().includes(searchText.toLowerCase());
}

const getHostHRef = (envUrl: string, row: any): string => {
  return `${envUrl}/ui/apps/dynatrace.classic.hosts/ui/entity/${row.original.HostId}`;
};

const savingsCellFunc = ({ value, row }: { value: string; row: any }) => {
  let color = Colors.Theme.Foreground["10"];
  let displayValue = Number(Number(value).toPrecision(2)).toString();

  if (Number(value) > 0) {
    color = Colors.Theme.Success["70"];
  } else if (Number(value) < 0) {
    color = Colors.Theme.Critical["70"];
  } else {
    displayValue = "-";
  }

  return <Text style={{ color }}>{displayValue}</Text>;
};
