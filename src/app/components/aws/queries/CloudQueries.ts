export const nullCloudTypeLabel = "N/A";
const GCP = "GCP";
const cloudTypeProperty = "CloudType";
const gibibyte = 1024 * 1024 * 1024;

export interface HostInfo {
  hostId: string;
  os: string;
  host: string;
  CPU: number;
  Mem: number;
  CloudType: string;
  CPUUsage: number;
  MemoryUsage: number;
  AWSModel: string;
}

export const getServerListQuery = (cloudType?: string) => {
  return `timeseries avg=avg(dt.host.cpu.usage), by:{dt.entity.host}, interval:5d
| fieldsAdd CPUUsage=arrayFirst(avg)
| lookup [timeseries avg2=avg(dt.host.memory.usage), by:{dt.entity.host}, interval:5d
| fieldsAdd MemoryUsage=arrayFirst(avg2)
| lookup [fetch dt.entity.host | fields entity.name, id, hosts, hypervisorType,osType, osVersion, cloudType, logicalCpuCores, physicalMemory, vendor=additionalSystemInfo[system.vendor], model=additionalSystemInfo[system.model]], sourceField:dt.entity.host, lookupField:id], sourceField:dt.entity.host, lookupField:dt.entity.host 
| fields hostId=lookup.lookup.id, host=lookup.lookup.entity.name, os=lookup.lookup.osType, osVersion=lookup.lookup.osVersion, vendor=lookup.lookup.vendor, model=lookup.lookup.model,CPU=lookup.lookup.logicalCpuCores, Mem=(toDouble(lookup.lookup.physicalMemory) / ${gibibyte}), MemoryUsage=lookup.MemoryUsage, CPUUsage, ${extractCloudType(
    "CloudType",
    "lookup.lookup.cloudType"
  )}

| fieldsAdd osTypeAWS=if(startsWith(osVersion, "Red Hat Enterprise Linux"),"RHEL",else:os)
| fieldsRemove osVersion, os
| fieldsRename os=osTypeAWS
| fieldsAdd AWSModel=if(vendor=="Amazon EC2",model,else:"")
| fieldsRemove model, vendor
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
