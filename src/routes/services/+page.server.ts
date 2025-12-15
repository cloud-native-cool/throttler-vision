import type { PageServerLoad } from './$types';
import { fetchGcpServices } from '$lib/server/gcp/serviceDiscovery';

export const load: PageServerLoad = async () => {
    const projectId = process.env.GCP_PROJECT_ID || 'my-project';
    const accessToken = process.env.GCP_ACCESS_TOKEN || 'mock-token';

    const services = await fetchGcpServices(projectId, accessToken);

    return {
        services
    };
};
