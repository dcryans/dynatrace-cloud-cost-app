import json
import subprocess

output_file_path = '/tmp/aws_prices.json' 

def get_aws_instance_prices():
    
    # Variables to adjust the output
      #json output file
    region_code = 'us-east-1'                   # Specify Region us-east-1, us-west-1 are acceptable values
    instance_type_starts_with = ''            # Specify the starting characters of the instance type example m4 or no values is all
    os = None                                #OS specified to grab from JSON.  Windows, Ubuntu Pro, Linux, SUSE, RHEL are all acceptable values


    if os is None:
    # Run the AWS CLI command and capture the output without spcified OS
        # Just General Purpose
        #command = f'aws pricing get-products --service-code AmazonEC2 --filters "Type=TERM_MATCH,Field=regionCode,Value={region_code}" "Type=TERM_MATCH,Field=instanceFamily,Value=General purpose" "Type=TERM_MATCH,Field=preInstalledSw,Value=NA" "Type=TERM_MATCH,Field=tenancy,Value=Dedicated" --region us-east-1'
        # All instance types
        command = f'aws pricing get-products --service-code AmazonEC2 --filters "Type=TERM_MATCH,Field=regionCode,Value={region_code}" "Type=TERM_MATCH,Field=preInstalledSw,Value=NA" "Type=TERM_MATCH,Field=tenancy,Value=Dedicated" --region us-east-1'

    else:
    # Run the AWS CLI command for a specific os
        command = f'aws pricing get-products --sexrvice-code AmazonEC2 --filters "Type=TERM_MATCH,Field=regionCode,Value={region_code}" "Type=TERM_MATCH,Field=operatingSystem,Value={os}" "Type=TERM_MATCH,Field=preInstalledSw,Value=NA" "Type=TERM_MATCH,Field=tenancy,Value=Dedicated" --region us-east-1'
        #command = f'aws pricing get-products --sexrvice-code AmazonEC2 --filters "Type=TERM_MATCH,Field=regionCode,Value={region_code}" "Type=TERM_MATCH,Field=operatingSystem,Value={os}" "Type=TERM_MATCH,Field=preInstalledSw,Value=NA" "Type=TERM_MATCH,Field=tenancy,Value=Dedicated" --region us-east-1'

    output = subprocess.check_output(command, shell=True).decode('utf-8')

    # Load the output as JSON
    data = json.loads(output)


    # Extract the desired information based on the specified starting characters and exclude instances with no price
    instances = {}
    for product in data['PriceList']:
        price_info = json.loads(product)

        #gets instance type name
        instance_type = price_info['product']['attributes']['instanceType']

        #if the varible is set it will ignore and instance type
        if not instance_type.startswith(instance_type_starts_with):
            continue

        #get rid of metal instances
        if instance_type.endswith('.metal'):
            continue

        #get the price of the instance
        price_dimensions = next(iter(price_info['terms']['OnDemand'].values()))['priceDimensions']
        price = float(next(iter(price_dimensions.values()))['pricePerUnit']['USD'])
        
        # Exclude instances with no price
        if price <= 0:
            continue
        
        #get cpu and memory from instance and strip GiB off memory
        vcpu = price_info['product']['attributes']['vcpu']
        memory = price_info['product']['attributes']['memory'].split()[0]  # Extract only the numeric portion

        #Grab the OS
        os = price_info['product']['attributes']['operatingSystem']

        # Store the instance information using instance type as the key to remove duplicates
        instances[instance_type] = {
            'instanceType': instance_type,
            'price': price,
            'vcpu': vcpu,
            'memory': memory,
            'os' : os
        }

    # Sort the instances alphabetically by instance type
    sorted_instances = sorted(instances.values(), key=lambda x: x['instanceType'])

    # Print the extracted information for each instance up to 10 for Testing
    #for i, instance in enumerate(sorted_instances[:10]):

    # Print the extracted information for each instance
    # for testing and it does all instances
    #for i, instance in enumerate(sorted_instances):
        #print(f"Instance #{i+1}")
        #print("Instance Type:", instance['instanceType'])
        #print("Price:", instance['price'])
        #print("vCPU:", instance['vcpu'])
        #print("Memory:", instance['memory'])
        #print("OS:",instance['os'])
        
        #print()

    # Write the results to the JSON file



    #print("Output file saved to:", output_file_path)

    #return sorted_instances[:20]
    return sorted_instances

result = get_aws_instance_prices()

with open(output_file_path, 'w') as output_file:
    #json.dump(sorted_instances[:20], output_file) #Limite the dump file to 20 entries
    json.dump(result, output_file)

print("Output file saved to:", output_file_path)