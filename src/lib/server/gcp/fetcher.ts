import type { RateLimitData } from '$lib/types';

const CLOUD_QUOTAS_API_BASE = 'https://cloudquotas.googleapis.com/v1';

export async function fetchGcpQuotas(projectId: string, accessToken: string): Promise<RateLimitData[]> {
    // For MVP, we'll fetch quotas for a few key services across global location
    // In reality, we'd need to paginate and filter by location.
    const services = ['compute.googleapis.com', 'storage.googleapis.com'];
    const allQuotas: RateLimitData[] = [];

    for (const service of services) {
        try {
            const url = `${CLOUD_QUOTAS_API_BASE}/projects/${projectId}/locations/global/services/${service}/quotaInfos`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch quotas for ${service}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();
            if (data.quotaInfos) {
                for (const quota of data.quotaInfos) {
                    allQuotas.push(normalizeQuota(quota, service));
                }
            }
        } catch (error) {
            console.error(`Error fetching quotas for ${service}:`, error);
        }
    }

    return allQuotas;
}

function normalizeQuota(gcpQuota: any, serviceName: string): RateLimitData {
    // Normalize GCP specific response to our RateLimitData schema
    // Note: logic is simplified for MVP.

    const limits: RateLimitData['limits'] = {
        quotaType: gcpQuota.isPrecise ? 'hard' : 'adjustable' // Heuristic
    };

    // Attempt to parse limit value
    // This is highly dependent on actual API response structure which can be complex
    // For MVP, if we see a simple value, we map it.

    if (gcpQuota.values && gcpQuota.values.length > 0) {
        const val = gcpQuota.values[0].value;
        // Heuristic: try to determine unit. Many GCP quotas are per day or per minute.
        // Often in the metric unit metadata, which we don't have here efficiently.
        // Defaulting to "requestsPerDay" if plain number for MVP safety, or omit if unsure.

        // If the metric name contains 'rate', it's likely a rate limit.
        if (gcpQuota.metric?.includes('rate')) {
            limits.requestsPerMinute = parseInt(val, 10); // Common default
        } else {
            limits.requestsPerDay = parseInt(val, 10);
        }
    }

    return {
        provider: 'gcp',
        service: serviceName,
        serviceDisplayName: gcpQuota.serviceDisplayName || serviceName,
        operation: gcpQuota.quotaId || 'unknown',
        limits,
        metadata: {
            sourceUrl: `https://console.cloud.google.com/iam-admin/quotas?project=${gcpQuota.project}`,
            lastVerified: new Date().toISOString(),
            notes: gcpQuota.metric
        }
    };
}
