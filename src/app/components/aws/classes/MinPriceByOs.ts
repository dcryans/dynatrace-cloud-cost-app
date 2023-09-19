import { AWSPricingRecord } from "../../../../models/types";

interface ResourcePosRecord {
  resource: number;
  position: number;
}

export function sortPosAscResourceDesc(
  data: ResourcePosRecord[]
): ResourcePosRecord[] {
  return data.sort(function (a: ResourcePosRecord, b: ResourcePosRecord) {
    if (a.position == b.position) {
      return b.resource - a.resource;
    }
    return a.position - b.position;
  });
}

export interface MinPriceOs {
  cpuPos: { [vcpu: number]: number };
  cpuPosSorted: ResourcePosRecord[];
  memPos: { [mem: number]: number };
  memPosSorted: ResourcePosRecord[];
  osStartPos: number;
  osEndPos: number;
}

export class MinPriceByOs {
  [os: string]: MinPriceOs;

  constructor(processed: AWSPricingRecord[]) {
    let minPrice: MinPriceOs = {
      cpuPos: {},
      cpuPosSorted: [],
      memPos: {},
      memPosSorted: [],
      osStartPos: -1,
      osEndPos: -1,
    };

    minPrice.osStartPos = 0;
    let os = processed[0].os;

    for (let i = 0; i < processed.length; i++) {
      const rec = processed[i];

      if (os !== rec.os) {
        minPrice.osEndPos = i;
        this[os] = minPrice;
        minPrice = {
          cpuPos: {},
          cpuPosSorted: [],
          memPos: {},
          memPosSorted: [],
          osStartPos: -1,
          osEndPos: -1,
        };

        minPrice.osStartPos = i;
        os = rec.os;
      }

      if (rec.vcpu in minPrice.cpuPos) {
        // pass
      } else {
        minPrice.cpuPos[rec.vcpu] = i;
      }

      if (rec.memory in minPrice.memPos) {
        // pass
      } else {
        minPrice.memPos[rec.memory] = i;
      }
    }

    minPrice.osEndPos = processed.length - 1;
    this[os] = minPrice;

    for (const minPrice of Object.values(this)) {
      for (const [min, minPos] of Object.entries(minPrice.cpuPos)) {
        minPrice.cpuPosSorted.push({ resource: Number(min), position: minPos });
      }
      minPrice.cpuPosSorted = sortPosAscResourceDesc(minPrice.cpuPosSorted);

      for (const [min, minPos] of Object.entries(minPrice.memPos)) {
        minPrice.memPosSorted.push({ resource: Number(min), position: minPos });
      }
      minPrice.memPosSorted = sortPosAscResourceDesc(minPrice.memPosSorted);
    }
  }
}
