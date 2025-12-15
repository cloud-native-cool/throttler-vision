import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = 'src/lib/data';
const CUSTOM_MAPPINGS_FILE = join(DATA_DIR, 'customMappings.json');

interface CustomMapping {
    resourceType: string;
    displayName: string;
    apiService: string;
    apiOperation: string;
    defaultPageSize: number;
    scope: string;
    addedAt: string;
}

async function loadCustomMappings(): Promise<CustomMapping[]> {
    try {
        const data = await readFile(CUSTOM_MAPPINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveCustomMappings(mappings: CustomMapping[]): Promise<void> {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(CUSTOM_MAPPINGS_FILE, JSON.stringify(mappings, null, 2));
}

export const GET: RequestHandler = async () => {
    const mappings = await loadCustomMappings();
    return json(mappings);
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { serviceName, displayName, pageSize = 100, scope = 'project' } = body;

    if (!serviceName || !displayName) {
        return json({ error: 'serviceName and displayName are required' }, { status: 400 });
    }

    // Generate resourceType from service name
    const resourceType = serviceName.replace('.googleapis.com', '').replace(/\./g, '_');

    // Generate apiOperation (common pattern)
    const apiOperation = `${resourceType}.list`;

    const newMapping: CustomMapping = {
        resourceType,
        displayName,
        apiService: serviceName,
        apiOperation,
        defaultPageSize: pageSize,
        scope,
        addedAt: new Date().toISOString()
    };

    const mappings = await loadCustomMappings();

    // Check for duplicate
    if (mappings.some(m => m.apiService === serviceName)) {
        return json({ message: 'Service already added', mapping: newMapping });
    }

    mappings.push(newMapping);
    await saveCustomMappings(mappings);

    return json({ message: 'Service added successfully', mapping: newMapping });
};

export const DELETE: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { serviceName } = body;

    if (!serviceName) {
        return json({ error: 'serviceName is required' }, { status: 400 });
    }

    let mappings = await loadCustomMappings();
    mappings = mappings.filter(m => m.apiService !== serviceName);
    await saveCustomMappings(mappings);

    return json({ message: 'Service removed successfully' });
};
