export interface RateLimitData {
    provider: 'aws' | 'gcp' | 'azure';
    service: string;           // e.g., "compute-engine", "ec2"
    serviceDisplayName: string; // e.g., "Compute Engine", "EC2"
    operation: string;         // e.g., "instances.list", "DescribeInstances"

    limits: {
        requestsPerSecond?: number;
        requestsPerMinute?: number;
        requestsPerHour?: number;
        requestsPerDay?: number;
        burstCapacity?: number;
        quotaType: 'hard' | 'soft' | 'adjustable';
    };

    sdkBehavior?: {
        sdk: 'go' | 'python' | 'java' | 'generic';
        defaultRetryEnabled: boolean;
        defaultMaxRetries?: number;
        exponentialBackoff?: boolean;
    }[];

    metadata: {
        sourceUrl: string;       // Link to official docs
        lastVerified: string;    // ISO date
        notes?: string;          // Edge cases, gotchas
    };
}

export interface CalculationInput {
    serviceId: string; // "provider:service:operation"
    operationCount: number;
    timeframeSeconds: number; // Normalized to seconds
}

export interface CalculationResult {
    serviceId: string; // "provider:service:operation"
    serviceDisplayName: string;
    maxOperations: number; // Over the timeframe
    percentUtilization: number;
    throttlingRisk: 'Low' | 'Medium' | 'High';
    timeToThrottle?: string; // Human readable duration
    recommendation?: string;

    // Capacity Planning additions
    maxDailyCapacity: number;
    safeIngestionRate: number; // Suggested rate per second with safety margin
}

// Batch Assessment Types
export interface BatchInput {
    resourceType: string;      // e.g., 'vms', 'buckets'
    count: number;             // Total resource count
    projectCount?: number;     // Number of GCP projects (multiplier)
}

export interface BatchResult {
    resourceType: string;
    displayName: string;
    totalApiCalls: number;     // Considering pagination
    rateLimitPerMinute: number;
    timeToIngestMinutes: number;
    timeToIngestHours: number;
    withinWindow: boolean;     // Can be ingested within 24h
    percentOf24h: number;
    status: 'ok' | 'warning' | 'critical';
}

export interface BatchAssessmentSummary {
    inputs: BatchInput[];
    results: BatchResult[];
    totalTimeHours: number;
    allWithinWindow: boolean;
    criticalCount: number;
    warningCount: number;
}

