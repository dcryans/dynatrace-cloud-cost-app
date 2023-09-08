// This proxy serverless function is required for some outside-call
export default async function (payload: { region: string }) {
  const { region } = payload;

  const startDate = new Date();
  const awsPricing = await getAWSPricing(region);
  const endDate = new Date();

  return {
    runTime: endDate.getTime() - startDate.getTime(),
    startDate: startDate,
    endDate: endDate,
    records: awsPricing,
  };
}

const AWS_PRICING_URL_PREFIX = "https://pricing.us-east-1.amazonaws.com";

const AWS_REGION_INDEX_URL =
  "/offers/v1.0/aws/AmazonEC2/current/region_index.json";

const pricePerUnit = "PricePerUnit";
const regionCode = "Region Code";
const termType = "TermType";
const unit = "Unit";
const memory = "Memory";
const tenancy = "Tenancy";

const wantedConfigs = {
  "Instance Type": (row, token) => {
    row["instanceType"] = token;
  },
  [termType]: (row, token) => {
    row["termType"] = token;
  },
  Memory: (row, token) => {
    row["memory"] = token.substring(0, token.indexOf(" GiB"));
  },
  "Operating System": (row, token) => {
    row["os"] = token;
  },
  PricePerUnit: (row, token) => {
    row["price"] = Number(token);
  },
  vCPU: (row, token) => {
    row["vcpu"] = token;
  },
};

async function getRegionURL(region: string) {
  const response = await fetch(AWS_PRICING_URL_PREFIX + AWS_REGION_INDEX_URL);

  const regionsInfo = await response.json();

  if (regionsInfo["regions"][region]) {
    return regionsInfo["regions"][region]["currentVersionUrl"].replace(
      ".json",
      ".csv"
    );
  }
}

async function getAWSPricing(region: string) {
  const rows = [];
  const fieldsIndexed = [];
  const wantedIndexed = [];
  const conditionsIndexed = [];

  const regionURL = await getRegionURL(region);

  const response = await fetch(AWS_PRICING_URL_PREFIX + regionURL);

  const conditions = getConditions(region);

  if (response.status !== 200) {
    console.error("Error accessing the AWS Pricing API");
    return;
  }
  let chunkCount = 0;
  let header = undefined;
  const skipLines = 5;
  let skippedLines = 0;
  let leftOver = "";

  let lineCountTotal = 0;

  // Create a writable stream to save the filtered records
  const filteredRecordsStream = new WritableStream({
    async write(chunk) {
      chunkCount += 1;
      let text = new TextDecoder().decode(chunk);
      if (leftOver !== "") {
        text = leftOver + text;
        leftOver = "";
      }
      const lines = text.split("\n");

      const noLeftOvers = text.endsWith("\n");
      let lineCountCurrent = 0;

      for (const line of lines) {
        lineCountCurrent++;
        lineCountTotal++;

        if (lineCountCurrent == lines.length) {
          if (noLeftOvers) {
            // pass
          } else {
            leftOver = line;
            continue;
          }
        }

        if (header == undefined) {
          if (skippedLines < skipLines) {
            skippedLines++;
          } else {
            header = [];
            const addToken = (token: string) => {
              header.push(token);
              return false;
            };
            parseString(line, addToken, () => true);
            fillIndexes(
              header,
              fieldsIndexed,
              wantedIndexed,
              conditionsIndexed,
              conditions
            );
          }
        } else {
          const row = {};
          let matchesIndex = -1;
          const shouldAddToken = () => {
            matchesIndex++;
            if (fieldsIndexed[matchesIndex] === true) {
              return true;
            }
          };
          const addToken = (token: string) => {
            if (
              conditionsIndexed[matchesIndex] === null ||
              conditionsIndexed[matchesIndex](token) === true
            ) {
              if (wantedIndexed[matchesIndex] === null) {
                // pass
              } else {
                wantedIndexed[matchesIndex](row, token);
              }
              return false;
            }
            return true;
          };

          const breaksConditions = parseString(line, addToken, shouldAddToken);
          if (breaksConditions) {
            // pass
          } else {
            if (Object.keys(row).length == 0 && line.trim() == "") {
              // pass
            } else {
              rows.push(row);
            }
          }
        }
      }

      if (chunkCount % 1000 == 0) {
        console.log(chunkCount, lineCountTotal);
      }
      /*
      if (chunkCount >= 1) {
        console.log(rows);
        this.done();
      }
      */
    },
    async close() {
      // Close the output stream when done
      console.log("Finished processing AWS Pricing data.");
    },
  });

  // Pipe data from the readable stream to the filtered records stream
  const readableStream = response.body;
  await readableStream.pipeTo(filteredRecordsStream);

  return rows;
}

function getConditions(region: string) {
  return {
    [pricePerUnit]: (token: string) => {
      if (token != "" && Number(token) > 0.0) {
        return true;
      }
      return false;
    },
    [regionCode]: (token: string) => {
      if (token === region) {
        return true;
      }
      return false;
    },
    [termType]: (token: string) => {
      if (token === "Reserved") {
        return false;
      }
      return true;
    },
    [tenancy]: (token: string) => {
      if (token === "Dedicated") {
        return false;
      }
      return true;
    },
    [unit]: (token: string) => {
      if (token === "Hrs") {
        return true;
      }
      return false;
    },
    [memory]: (token: string) => {
      if (token === "" || token.includes("NA")) {
        return false;
      }
      return true;
    },
  };
}

function fillIndexes(
  header: any,
  fieldsIndexed: any[],
  wantedIndexed: any[],
  conditionsIndexed: any[],
  conditions: any
) {
  const conditionsKeys = Object.keys(conditions);
  const wantedKeys = Object.keys(wantedConfigs);

  for (const headerValue of header) {
    if (
      wantedKeys.includes(headerValue) ||
      conditionsKeys.includes(headerValue)
    ) {
      fieldsIndexed.push(true);
    } else {
      fieldsIndexed.push(false);
    }
    if (wantedKeys.includes(headerValue)) {
      wantedIndexed.push(wantedConfigs[headerValue]);
    } else {
      wantedIndexed.push(null);
    }
    if (conditionsKeys.includes(headerValue)) {
      conditionsIndexed.push(conditions[headerValue]);
    } else {
      conditionsIndexed.push(null);
    }
  }
}

function parseString(
  input: string,
  addToken: (token: string) => boolean,
  shouldAddToken: () => boolean
) {
  let currentTokenStartIdx = -1;
  let currentTokenEndIdx = -1;
  let insideQuotes = false;
  let breaksConditions = false;

  const tokenComplete = () => {
    let breaksConditionsInternal = false;
    if (shouldAddToken()) {
      if (currentTokenStartIdx > 0 && currentTokenEndIdx > 0) {
        breaksConditionsInternal = addToken(
          input.substring(currentTokenStartIdx, currentTokenEndIdx)
        );
      } else {
        breaksConditionsInternal = addToken("");
      }
    }
    currentTokenStartIdx = -1;
    currentTokenEndIdx = -1;

    return breaksConditionsInternal;
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"') {
      if (insideQuotes) {
        // Check if the previous character is a backslash (escaped)
        if (input[i - 1] === "\\") {
          continue;
        } else {
          currentTokenEndIdx = i;
          insideQuotes = false; // End of quoted value
        }
      } else {
        currentTokenStartIdx = i + 1;
        insideQuotes = true; // Start of quoted value
      }
    } else if (char === "," && !insideQuotes) {
      breaksConditions = tokenComplete();
      if (breaksConditions) {
        return breaksConditions;
      }
    }
  }

  // Push the last token
  breaksConditions = tokenComplete();

  return breaksConditions;
}
