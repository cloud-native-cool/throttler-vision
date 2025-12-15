import type { PageServerLoad } from './$types';
import { fetchGcpQuotas } from '$lib/server/gcp/fetcher';
import type { RateLimitData } from '$lib/types';
// In a real app, use $env/static/private

export const load: PageServerLoad = async () => {
    // TODO: Get real credentials from environment or session
    // For this local tool, we might fallback to empty or mock if no creds
    const projectId = process.env.GCP_PROJECT_ID || 'my-project';
    const accessToken = process.env.GCP_ACCESS_TOKEN || 'mock-token';

    let quotas: RateLimitData[] = [];

    if (accessToken === 'mock-token') {
        console.warn('Using mock token. Quotas will likely fail or require mock implementation.');
        // Return some mock data for the detailed PRD MVP experience if real fetch fails
        quotas = [
            {
                provider: 'gcp',
                service: 'compute.googleapis.com',
                serviceDisplayName: 'Compute Engine API',
                operation: 'instances.list',
                limits: {
                    requestsPerMinute: 600,
                    quotaType: 'adjustable'
                },
                metadata: {
                    sourceUrl: 'https://cloud.google.com/compute/docs/api-rate-limits',
                    lastVerified: new Date().toISOString()
                }
            },
            {
                provider: 'gcp',
                service: 'storage.googleapis.com',
                serviceDisplayName: 'Cloud Storage JSON API',
                operation: 'objects.get',
                limits: {
                    requestsPerSecond: 10000, // example
                    quotaType: 'soft'
                },
                metadata: {
                    sourceUrl: 'https://cloud.google.com/storage/quotas',
                    lastVerified: new Date().toISOString()
                }
            }
        ];
    } else {
        try {
            quotas = await fetchGcpQuotas(projectId, accessToken);
        } catch (e) {
            console.error("Failed to fetch quotas on server load", e);
        }
    }

    return {
        quotas
    };
};
