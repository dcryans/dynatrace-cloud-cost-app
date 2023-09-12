import React, { Fragment, useCallback, useMemo, useState } from "react";
import {
  DataTable,
  Flex,
  FormField,
  Highlight,
  TextInput,
} from "@dynatrace/strato-components-preview";
import type { TableColumn } from "@dynatrace/strato-components-preview/tables";
import { useEffectDebounced } from "../../hooks/useEffectDebounced";

interface ResultTableProps {
  result: any[];
}

export function ResultTable({ result }: ResultTableProps) {
  const [searchText, setSearchText] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");

  const handleTextChanged = useCallback(
    (newText: string) => {
      setSearchTextInput(newText);
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

  const headers = useMemo(() => {
    if (result && result.length > 0 && result[0]) {
      const headers: TableColumn[] = [];
      for (const [key, value] of Object.entries(result[0])) {
        const header: TableColumn = {
          accessor: key,
          autoWidth: true,
          alignment: "right",
        };
        if (typeof value == "number") {
          header.columnType = "number";
        }
        if (key === "Host") {
          header.cell = ({ value, row }: { value: string; row: any }) => {
            if (searchText === "") {
              return value;
            } else {
              return <Highlight term={searchText}>{value}</Highlight>;
            }
          };
        }
        headers.push(header);
      }

      return headers;
    } else {
      return null;
    }
  }, [result, searchText]);

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
        />
      )}
    </Fragment>
  );
}

function containsSearchText(value: string, searchText: string) {
  return value.toLowerCase().includes(searchText.toLowerCase());
}
