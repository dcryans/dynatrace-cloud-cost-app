const nullCloudTypeLabel = "N/A";
const cloudTypeProperty = "CloudType";

export const getServerListQuery = (cloudType?: string) => {
  return `timeseries avg=avg(dt.host.cpu.usage), by:{dt.entity.host}, interval:5d
| fieldsAdd CPUUsage=arrayFirst(avg)
| lookup [timeseries avg2=avg(dt.host.memory.usage), by:{dt.entity.host}, interval:5d
| fieldsAdd MemoryUsage=arrayFirst(avg2)
| lookup [fetch dt.entity.host | fields entity.name, id, hosts, hypervisorType,osType, cloudType, cpuCores, physicalMemory], sourceField:dt.entity.host, lookupField:id], sourceField:dt.entity.host, lookupField:dt.entity.host 
| fields host=lookup.lookup.entity.name, os=lookup.lookup.osType,CPU=lookup.lookup.cpuCores, Mem=(toDouble(lookup.lookup.physicalMemory) / 1000000000), MemoryUsage=lookup.MemoryUsage, CPUUsage,CloudType=lookup.lookup.cloudType 
| filter isNotNull(host)
${createFilter(cloudType, cloudTypeProperty)}
| sort CloudType asc`;
};

export const cloudTypeQuery = `fetch dt.entity.host | fields cloudType=if(isNotNull(cloudType),cloudType,else:"${nullCloudTypeLabel}")`;

function createFilter(value: string | undefined, property: string) {
  let filter = "";
  if (value == nullCloudTypeLabel) {
    filter = `| filter isNull(${property})`;
  } else if (value && value !== "") {
    filter = `| filter ${property} == "${value}"`;
  }
  return filter;
}
