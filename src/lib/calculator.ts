import type { CalculationInput, CalculationResult, RateLimitData } from './types';

export function calculateThroughput(
    input: CalculationInput,
    limitData: RateLimitData
): CalculationResult {
    const { operationCount, timeframeSeconds } = input;
    const limits = limitData.limits;

    // Normalize limit to requests per second
    let limitPerSecond = 0;

    if (limits.requestsPerSecond) {
        limitPerSecond = limits.requestsPerSecond;
    } else if (limits.requestsPerMinute) {
        limitPerSecond = limits.requestsPerMinute / 60;
    } else if (limits.requestsPerHour) {
        limitPerSecond = limits.requestsPerHour / 3600;
    } else if (limits.requestsPerDay) {
        limitPerSecond = limits.requestsPerDay / 86400;
    } else {
        limitPerSecond = 0;
    }

    const safeMargin = 0.8; // 20% headrooom
    const maxDailyCapacity = Math.floor(limitPerSecond * 86400);
    const safeIngestionRate = limitPerSecond * safeMargin;

    if (limitPerSecond === 0) {
        return {
            serviceId: `${limitData.provider}:${limitData.service}:${limitData.operation}`,
            serviceDisplayName: limitData.serviceDisplayName,
            maxOperations: 0,
            percentUtilization: 100,
            throttlingRisk: 'High',
            recommendation: 'Could not determine rate limit from data.',
            maxDailyCapacity: 0,
            safeIngestionRate: 0
        };
    }

    // User's planned rate
    const userRatePerSecond = operationCount / timeframeSeconds;

    // Utilization
    const percentUtilization = (userRatePerSecond / limitPerSecond) * 100;

    // Risk assessment
    let throttlingRisk: 'Low' | 'Medium' | 'High' = 'Low';
    let recommendation = 'Your planned usage is well within limits.';

    if (percentUtilization >= 100) {
        throttlingRisk = 'High';
        recommendation = `exceeds the limit of ${limitPerSecond.toFixed(2)} req/sec. Reduce concurrency immediately.`;
    } else if (percentUtilization > 80) {
        throttlingRisk = 'Medium';
        recommendation = `is close to the limit (${percentUtilization.toFixed(1)}%). Bursts will likely cause 429 errors.`;
    } else {
        recommendation = `is safe. You have ${((limitPerSecond - userRatePerSecond) / limitPerSecond * 100).toFixed(0)}% headroom.`;
    }

    // Max operations possible over the user's specific timeframe
    const maxOperations = Math.floor(limitPerSecond * timeframeSeconds);

    return {
        serviceId: `${limitData.provider}:${limitData.service}:${limitData.operation}`,
        serviceDisplayName: limitData.serviceDisplayName,
        maxOperations,
        percentUtilization,
        throttlingRisk,
        timeToThrottle: percentUtilization > 100 ? 'Immediate' : 'N/A',
        recommendation,
        maxDailyCapacity,
        safeIngestionRate
    };
}

// Batch Assessment
import type { BatchInput, BatchResult, BatchAssessmentSummary } from './types';
import { getServiceMapping, getDefaultRateLimit } from './data/serviceMappings';

export function calculateBatchThroughput(inputs: BatchInput[]): BatchAssessmentSummary {
    const results: BatchResult[] = [];

    for (const input of inputs) {
        const mapping = getServiceMapping(input.resourceType);
        if (!mapping) {
            console.warn(`No mapping found for resource type: ${input.resourceType}`);
            continue;
        }

        const pageSize = mapping.defaultPageSize;
        const projectCount = input.projectCount ?? 1;

        // Calculate API calls per project (parallel execution across projects)
        const callsPerProject = Math.ceil(input.count / pageSize);
        const totalApiCalls = callsPerProject * projectCount; // For display only

        // Get rate limit (requests per minute) - applies PER PROJECT
        const rateLimitPerMinute = getDefaultRateLimit(mapping.apiService);

        // PARALLEL: Time is based on SINGLE PROJECT (slowest path)
        // Since rate limit is per-project, all projects run in parallel
        const timeToIngestMinutes = callsPerProject / rateLimitPerMinute;
        const timeToIngestHours = timeToIngestMinutes / 60;

        // 24h window assessment
        const withinWindow = timeToIngestHours <= 24;
        const percentOf24h = (timeToIngestHours / 24) * 100;

        // Status determination
        let status: 'ok' | 'warning' | 'critical' = 'ok';
        if (percentOf24h > 100) {
            status = 'critical';
        } else if (percentOf24h > 70) {
            status = 'warning';
        }

        results.push({
            resourceType: input.resourceType,
            displayName: mapping.displayName,
            totalApiCalls,
            rateLimitPerMinute,
            timeToIngestMinutes,
            timeToIngestHours,
            withinWindow,
            percentOf24h,
            status
        });
    }

    // Summary: Use MAX time (parallel) instead of SUM (sequential)
    const totalTimeHours = results.length > 0 ? Math.max(...results.map(r => r.timeToIngestHours)) : 0;
    const allWithinWindow = results.every(r => r.withinWindow);
    const criticalCount = results.filter(r => r.status === 'critical').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    return {
        inputs,
        results,
        totalTimeHours,
        allWithinWindow,
        criticalCount,
        warningCount
    };
}

