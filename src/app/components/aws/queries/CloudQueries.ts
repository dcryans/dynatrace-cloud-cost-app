const nullCloudTypeLabel = "N/A";
const GCP = "GCP";
const cloudTypeProperty = "CloudType";
const gibibyte = 1024 * 1024 * 1024;

export const getServerListQuery = (cloudType?: string) => {
  return `timeseries avg=avg(dt.host.cpu.usage), by:{dt.entity.host}, interval:5d
| fieldsAdd CPUUsage=arrayFirst(avg)
| lookup [timeseries avg2=avg(dt.host.memory.usage), by:{dt.entity.host}, interval:5d
| fieldsAdd MemoryUsage=arrayFirst(avg2)
| lookup [fetch dt.entity.host | fields entity.name, id, hosts, hypervisorType,osType, cloudType, cpuCores, physicalMemory], sourceField:dt.entity.host, lookupField:id], sourceField:dt.entity.host, lookupField:dt.entity.host 
| fields hostId=lookup.lookup.id, host=lookup.lookup.entity.name, os=lookup.lookup.osType,CPU=lookup.lookup.cpuCores, Mem=(toDouble(lookup.lookup.physicalMemory) / ${gibibyte}), MemoryUsage=lookup.MemoryUsage, CPUUsage, ${extractCloudType(
    "CloudType",
    "lookup.lookup.cloudType"
  )}
| filter isNotNull(host)
${createFilter(cloudType, cloudTypeProperty)}
| sort CloudType asc`;
};

export const cloudTypeQuery = `fetch dt.entity.host | fields ${extractCloudType(
  "cloudType",
  "cloudType"
)}`;

function createFilter(value: string | undefined, property: string) {
  let filter = "";
  if (value && value !== "") {
    filter = `| filter ${property} == "${value}"`;
  }
  return filter;
}

function extractCloudType(fieldName: string, inputFieldName: string): string {
  return `${fieldName}=if(isNotNull(${inputFieldName}),if(${inputFieldName}=="GOOGLE_CLOUD_PLATFORM","${GCP}",else:${inputFieldName}),else:"${nullCloudTypeLabel}")`;
}
