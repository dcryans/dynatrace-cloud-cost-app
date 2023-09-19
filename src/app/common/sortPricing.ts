interface OsCpuMemoryPriceRecord {
  os: string;
  vcpu: number;
  memory: number;
  price: number;
}

// Sort by OCMP: Os, CPU, Memory, Price
export function sortOsCpuMemoryPrice(
  data: OsCpuMemoryPriceRecord[]
): OsCpuMemoryPriceRecord[] {
  return data.sort(function (
    a: OsCpuMemoryPriceRecord,
    b: OsCpuMemoryPriceRecord
  ) {
    if (a.os == b.os) {
      if (a.vcpu == b.vcpu) {
        if (a.memory == b.memory) {
          return a.price - b.price;
        }
        return a.memory - b.memory;
      }
      return a.vcpu - b.vcpu;
    }
    return a.os.localeCompare(b.os);
  });
}

interface OsPriceRecord {
  os: string;
  price: number;
}

// Sort by OP: Os, Price
export function sortOsPrice(data: OsPriceRecord[]): OsPriceRecord[] {
  return data.sort(function (a: OsPriceRecord, b: OsPriceRecord) {
    if (a.os == b.os) {
      return a.price - b.price;
    }
    return a.os.localeCompare(b.os);
  });
}
