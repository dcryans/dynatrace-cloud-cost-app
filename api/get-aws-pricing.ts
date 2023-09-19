import { AWSPricingRecord } from "../src/models/types";
import {
  sortOsCpuMemoryPrice,
  sortOsPrice,
} from "../src/app/common/sortPricing";

// This proxy serverless function is required for some outside-call
export default async function (payload?: { region: string }) {
  let region = "us-east-1";
  if (payload?.region && payload?.region !== "") {
    region = payload.region;
  }

  const startDate = new Date();
  const awsPricing: AWSPricingRecord[] = await getAWSPricing(region);
  const endDate = new Date();

  if (awsPricing == undefined) {
    return;
  }
  const sortedAwsPricing = sortOsCpuMemoryPrice(
    awsPricing
  ) as AWSPricingRecord[];

  const onlyBestPricing: AWSPricingRecord[] = [];

  if (sortedAwsPricing && sortedAwsPricing.length > 0) {
    onlyBestPricing.push(sortedAwsPricing[0]);
    let prev = sortedAwsPricing[0];

    for (const rec of sortedAwsPricing.slice(1)) {
      if (
        rec.vcpu === prev.vcpu &&
        rec.memory === prev.memory &&
        rec.os == prev.os
      ) {
        continue;
      }
      onlyBestPricing.push(rec);
      prev = rec;
    }
  }

  const priceSortedAwsPricing = sortOsPrice(
    onlyBestPricing
  ) as AWSPricingRecord[];

  const minPriceOnlyArray: AWSPricingRecord[] = [];
  let minPriceCPUPos = {};
  let minPriceMemoryPos = {};
  let os = "";

  for (let i = 0; i < priceSortedAwsPricing.length; i++) {
    const rec = priceSortedAwsPricing[i];
    if (os !== rec.os) {
      minPriceCPUPos = {};
      minPriceMemoryPos = {};
      os = rec.os;
    }

    let isTooExpensive = false;

    let cpuPos = -1;
    for (const [min, minPos] of Object.entries(minPriceCPUPos)) {
      if (Number(min) >= rec.vcpu && cpuPos < Number(minPos)) {
        cpuPos = Number(minPos);
      }
    }

    let memPos = -1;
    for (const [min, minPos] of Object.entries(minPriceMemoryPos)) {
      if (Number(min) >= rec.memory && memPos < Number(minPos)) {
        memPos = Number(minPos);
      }
    }

    if (memPos >= 0 && cpuPos >= 0) {
      let startPos = memPos;
      if (cpuPos > startPos) {
        startPos = cpuPos;
      }

      for (let j = startPos; j < i; j++) {
        const prevRec = priceSortedAwsPricing[j];
        if (prevRec.vcpu >= rec.vcpu && prevRec.memory >= rec.memory) {
          isTooExpensive = true;
          break;
        }
      }
    }

    if (isTooExpensive) {
      continue;
    }

    if (rec.vcpu in minPriceCPUPos) {
      // pass
    } else {
      minPriceCPUPos[rec.vcpu] = i;
    }

    if (rec.memory in minPriceMemoryPos) {
      // pass
    } else {
      minPriceMemoryPos[rec.memory] = i;
    }

    minPriceOnlyArray.push(rec);
  }

  return {
    runTime: endDate.getTime() - startDate.getTime(),
    startDate: startDate,
    endDate: endDate,
    records: minPriceOnlyArray,
  };
}
export const AWS_PRICING_URL_PREFIX = `https://pricing.us-east-1.amazonaws.com`;

const AWS_REGION_INDEX_URL =
  "/offers/v1.0/aws/AmazonEC2/current/region_index.json";

const pricePerUnit = "PricePerUnit";
const regionCode = "Region Code";
const termType = "TermType";
const unit = "Unit";
const memory = "Memory";
const tenancy = "Tenancy";
const instanceType = "Instance Type";
const operatingSystem = "Operating System";
const vCpu = "vCPU";
const preinstalledSoftware = "Pre Installed S/W";
const capacityStatus = "CapacityStatus";

const wantedConfigs = {
  [instanceType]: (row: AWSPricingRecord, token: string) => {
    row.instanceType = token;
  },
  [memory]: (row: AWSPricingRecord, token: string) => {
    row.memory = Number(token.substring(0, token.indexOf(" GiB")));
  },
  [operatingSystem]: (row: AWSPricingRecord, token: string) => {
    row.os = token;
  },
  [pricePerUnit]: (row: AWSPricingRecord, token: string) => {
    row.price = Number(token);
  },
  [vCpu]: (row: AWSPricingRecord, token: string) => {
    row.vcpu = Number(token);
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

async function getAWSPricing(region: string): Promise<AWSPricingRecord[]> {
  const rows: AWSPricingRecord[] = [];
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
              rows.push(row as AWSPricingRecord);
            }
          }
        }
      }

      /*
      if (chunkCount % 1000 == 0) {
        console.log(chunkCount, lineCountTotal);
      }
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
    [instanceType]: (token: string) => {
      if (
        token.startsWith("T") ||
        token.startsWith("t") ||
        token.endsWith(".metal")
      ) {
        return false;
      }
      return true;
    },
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
        return true;
      }
      return false;
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
    [preinstalledSoftware]: (token: string) => {
      if (token === "NA") {
        return true;
      }
      return false;
    },
    [capacityStatus]: (token: string) => {
      if (token === "Used") {
        return true;
      }
      return false;
    },
    [operatingSystem]: (token: string) => {
      if (token === "Red Hat Enterprise Linux with HA") {
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
