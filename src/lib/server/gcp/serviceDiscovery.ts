/**
 * GCP Service Discovery
 * Fetches available GCP services and their quota information from public APIs.
 */

export interface GcpServiceInfo {
    name: string;           // e.g., "compute.googleapis.com"
    displayName: string;    // e.g., "Compute Engine API"
    state?: string;         // ENABLED, DISABLED
}

export interface GcpQuotaInfo {
    quotaId: string;
    metric: string;
    displayName?: string;
    value?: number;
    unit?: string;
}

const SERVICE_USAGE_API = 'https://serviceusage.googleapis.com/v1';
const CLOUD_QUOTAS_API = 'https://cloudquotas.googleapis.com/v1';

// Fallback mock data when no credentials available
const MOCK_SERVICES: GcpServiceInfo[] = [
    { name: 'compute.googleapis.com', displayName: 'Compute Engine API' },
    { name: 'storage.googleapis.com', displayName: 'Cloud Storage API' },
    { name: 'iam.googleapis.com', displayName: 'Identity and Access Management API' },
    { name: 'container.googleapis.com', displayName: 'Kubernetes Engine API' },
    { name: 'cloudfunctions.googleapis.com', displayName: 'Cloud Functions API' },
    { name: 'run.googleapis.com', displayName: 'Cloud Run Admin API' },
    { name: 'bigquery.googleapis.com', displayName: 'BigQuery API' },
    { name: 'pubsub.googleapis.com', displayName: 'Cloud Pub/Sub API' },
    { name: 'secretmanager.googleapis.com', displayName: 'Secret Manager API' },
    { name: 'cloudkms.googleapis.com', displayName: 'Cloud Key Management Service API' },
    { name: 'sqladmin.googleapis.com', displayName: 'Cloud SQL Admin API' },
    { name: 'spanner.googleapis.com', displayName: 'Cloud Spanner API' },
    { name: 'firestore.googleapis.com', displayName: 'Cloud Firestore API' },
    { name: 'logging.googleapis.com', displayName: 'Cloud Logging API' },
    { name: 'monitoring.googleapis.com', displayName: 'Cloud Monitoring API' },
    { name: 'cloudresourcemanager.googleapis.com', displayName: 'Cloud Resource Manager API' },
    { name: 'dns.googleapis.com', displayName: 'Cloud DNS API' },
    { name: 'networkservices.googleapis.com', displayName: 'Network Services API' },
    { name: 'aiplatform.googleapis.com', displayName: 'Vertex AI API' },
    { name: 'dataflow.googleapis.com', displayName: 'Dataflow API' },
    { name: 'dataproc.googleapis.com', displayName: 'Dataproc API' },
    { name: 'composer.googleapis.com', displayName: 'Cloud Composer API' },
    { name: 'appengine.googleapis.com', displayName: 'App Engine Admin API' },
    { name: 'cloudbuild.googleapis.com', displayName: 'Cloud Build API' },
    { name: 'artifactregistry.googleapis.com', displayName: 'Artifact Registry API' },
    { name: 'securitycenter.googleapis.com', displayName: 'Security Command Center API' },
    { name: 'cloudtasks.googleapis.com', displayName: 'Cloud Tasks API' },
    { name: 'scheduler.googleapis.com', displayName: 'Cloud Scheduler API' },
    { name: 'workflows.googleapis.com', displayName: 'Workflows API' },
    { name: 'eventarc.googleapis.com', displayName: 'Eventarc API' }
];

/**
 * Fetch all available GCP services.
 * Falls back to mock data if credentials are not available.
 */
export async function fetchGcpServices(
    projectId: string,
    accessToken: string
): Promise<GcpServiceInfo[]> {
    if (!accessToken || accessToken === 'mock-token') {
        console.log('[ServiceDiscovery] Using mock services list');
        return MOCK_SERVICES;
    }

    try {
        const url = `${SERVICE_USAGE_API}/projects/${projectId}/services?filter=state:ENABLED&pageSize=200`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`[ServiceDiscovery] API error: ${response.status}, falling back to mock`);
            return MOCK_SERVICES;
        }

        const data = await response.json();
        const services: GcpServiceInfo[] = [];

        for (const svc of data.services || []) {
            services.push({
                name: svc.config?.name || svc.name?.split('/').pop() || 'unknown',
                displayName: svc.config?.title || svc.config?.name || 'Unknown Service',
                state: svc.state
            });
        }

        return services.length > 0 ? services : MOCK_SERVICES;
    } catch (error) {
        console.error('[ServiceDiscovery] Error fetching services:', error);
        return MOCK_SERVICES;
    }
}

/**
 * Fetch quota information for a specific GCP service.
 */
export async function fetchServiceQuotas(
    projectId: string,
    serviceName: string,
    accessToken: string
): Promise<GcpQuotaInfo[]> {
    if (!accessToken || accessToken === 'mock-token') {
        // Return mock quota data
        return getMockQuotas(serviceName);
    }

    try {
        const url = `${CLOUD_QUOTAS_API}/projects/${projectId}/locations/global/services/${serviceName}/quotaInfos`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`[ServiceDiscovery] Quota API error: ${response.status}`);
            return getMockQuotas(serviceName);
        }

        const data = await response.json();
        const quotas: GcpQuotaInfo[] = [];

        for (const q of data.quotaInfos || []) {
            quotas.push({
                quotaId: q.quotaId || 'unknown',
                metric: q.metric || '',
                displayName: q.quotaDisplayName || q.quotaId,
                value: q.quotaInfo?.value?.int64Value,
                unit: q.unit
            });
        }

        return quotas.length > 0 ? quotas : getMockQuotas(serviceName);
    } catch (error) {
        console.error('[ServiceDiscovery] Error fetching quotas:', error);
        return getMockQuotas(serviceName);
    }
}

/**
 * Mock quota data based on service name.
 */
function getMockQuotas(serviceName: string): GcpQuotaInfo[] {
    const defaults: Record<string, GcpQuotaInfo[]> = {
        'compute.googleapis.com': [
            { quotaId: 'ReadRequestsPerMinute', metric: 'compute.googleapis.com/read_requests', displayName: 'Read Requests', value: 6000 },
            { quotaId: 'WriteRequestsPerMinute', metric: 'compute.googleapis.com/write_requests', displayName: 'Write Requests', value: 1500 }
        ],
        'storage.googleapis.com': [
            { quotaId: 'ReadRequestsPerSecond', metric: 'storage.googleapis.com/read_requests', displayName: 'Read Requests', value: 5000 },
            { quotaId: 'WriteRequestsPerSecond', metric: 'storage.googleapis.com/write_requests', displayName: 'Write Requests', value: 1000 }
        ],
        'iam.googleapis.com': [
            { quotaId: 'ReadRequestsPerMinute', metric: 'iam.googleapis.com/read_requests', displayName: 'Read Requests', value: 600 }
        ]
    };

    return defaults[serviceName] || [
        { quotaId: 'DefaultRate', metric: `${serviceName}/requests`, displayName: 'Request Rate', value: 600 }
    ];
}
