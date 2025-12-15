/**
 * GCP Service-to-Operation Mappings
 * Maps resource types to their corresponding API operations and pagination details.
 */

export interface ServiceMapping {
    resourceType: string;
    displayName: string;
    apiService: string;
    apiOperation: string;
    defaultPageSize: number;
    scope: 'project' | 'zone' | 'region' | 'bucket';
    notes?: string;
}

export const GCP_SERVICE_MAPPINGS: ServiceMapping[] = [
    // Compute
    {
        resourceType: 'vms',
        displayName: 'Virtual Machines',
        apiService: 'compute.googleapis.com',
        apiOperation: 'compute.instances.list',
        defaultPageSize: 500,
        scope: 'zone',
        notes: 'Requires per-zone iteration'
    },
    {
        resourceType: 'disks',
        displayName: 'Persistent Disks',
        apiService: 'compute.googleapis.com',
        apiOperation: 'compute.disks.list',
        defaultPageSize: 500,
        scope: 'zone'
    },

    // Storage
    {
        resourceType: 'buckets',
        displayName: 'Storage Buckets',
        apiService: 'storage.googleapis.com',
        apiOperation: 'storage.buckets.list',
        defaultPageSize: 1000,
        scope: 'project'
    },
    {
        resourceType: 'objects',
        displayName: 'Storage Objects',
        apiService: 'storage.googleapis.com',
        apiOperation: 'storage.objects.list',
        defaultPageSize: 1000,
        scope: 'bucket',
        notes: 'Per-bucket; high volume'
    },

    // IAM
    {
        resourceType: 'serviceAccounts',
        displayName: 'Service Accounts',
        apiService: 'iam.googleapis.com',
        apiOperation: 'iam.serviceAccounts.list',
        defaultPageSize: 100,
        scope: 'project'
    },
    {
        resourceType: 'iamPolicies',
        displayName: 'IAM Policies',
        apiService: 'cloudresourcemanager.googleapis.com',
        apiOperation: 'projects.getIamPolicy',
        defaultPageSize: 1, // Not paginated, 1 call per project
        scope: 'project'
    },

    // Cloud Functions
    {
        resourceType: 'functions',
        displayName: 'Cloud Functions',
        apiService: 'cloudfunctions.googleapis.com',
        apiOperation: 'projects.locations.functions.list',
        defaultPageSize: 100,
        scope: 'region'
    },

    // Cloud Run
    {
        resourceType: 'cloudRunServices',
        displayName: 'Cloud Run Services',
        apiService: 'run.googleapis.com',
        apiOperation: 'projects.locations.services.list',
        defaultPageSize: 100,
        scope: 'region'
    },

    // GKE
    {
        resourceType: 'gkeClusters',
        displayName: 'GKE Clusters',
        apiService: 'container.googleapis.com',
        apiOperation: 'projects.locations.clusters.list',
        defaultPageSize: 100,
        scope: 'region'
    },

    // BigQuery
    {
        resourceType: 'bqDatasets',
        displayName: 'BigQuery Datasets',
        apiService: 'bigquery.googleapis.com',
        apiOperation: 'datasets.list',
        defaultPageSize: 1000,
        scope: 'project'
    },
    {
        resourceType: 'bqTables',
        displayName: 'BigQuery Tables',
        apiService: 'bigquery.googleapis.com',
        apiOperation: 'tables.list',
        defaultPageSize: 1000,
        scope: 'project',
        notes: 'Per-dataset'
    },

    // Networking
    {
        resourceType: 'vpcNetworks',
        displayName: 'VPC Networks',
        apiService: 'compute.googleapis.com',
        apiOperation: 'compute.networks.list',
        defaultPageSize: 500,
        scope: 'project'
    },
    {
        resourceType: 'firewallRules',
        displayName: 'Firewall Rules',
        apiService: 'compute.googleapis.com',
        apiOperation: 'compute.firewalls.list',
        defaultPageSize: 500,
        scope: 'project'
    }
];

/**
 * Default rate limits for common GCP APIs (requests per minute).
 * These are fallback values when real quotas can't be fetched.
 */
export const DEFAULT_RATE_LIMITS: Record<string, number> = {
    'compute.googleapis.com': 600,      // 10 req/s
    'storage.googleapis.com': 6000,     // 100 req/s (varies by operation)
    'iam.googleapis.com': 600,          // 10 req/s
    'cloudfunctions.googleapis.com': 600,
    'run.googleapis.com': 600,
    'container.googleapis.com': 600,
    'bigquery.googleapis.com': 600,
    'cloudresourcemanager.googleapis.com': 600
};

export function getServiceMapping(resourceType: string): ServiceMapping | undefined {
    return GCP_SERVICE_MAPPINGS.find(m => m.resourceType === resourceType);
}

export function getDefaultRateLimit(apiService: string): number {
    return DEFAULT_RATE_LIMITS[apiService] ?? 600; // Default to 600 req/min
}

/**
 * Get all mappings including custom ones (for client-side use).
 * Custom mappings are loaded via API call.
 */
export function getAllBuiltInMappings(): ServiceMapping[] {
    return GCP_SERVICE_MAPPINGS;
}

/**
 * Find mapping by resource type, checking both built-in and custom.
 */
export function findMapping(resourceType: string, customMappings: ServiceMapping[] = []): ServiceMapping | undefined {
    return GCP_SERVICE_MAPPINGS.find(m => m.resourceType === resourceType)
        || customMappings.find(m => m.resourceType === resourceType);
}

