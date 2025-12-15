<script lang="ts">
  import type { BatchAssessmentSummary } from '$lib/types';

  export let summary: BatchAssessmentSummary | null = null;
</script>

{#if summary}
<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl">
  <h2 class="text-xl font-semibold mb-6 text-white flex items-center tracking-tight">
    <span class="mr-3 p-2 bg-indigo-500/10 rounded-lg text-indigo-400">📊</span> Assessment Results
  </h2>

  <!-- Summary Banner -->
  <div 
    class={`p-5 rounded-xl border mb-6 ${summary.allWithinWindow ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}
  >
    <div class="flex items-center space-x-4">
      <div class="text-4xl">
        {#if summary.allWithinWindow}✅{:else}⚠️{/if}
      </div>
      <div>
        <div class="font-bold text-lg text-white">
          {#if summary.allWithinWindow}
            All resources ingestable within 24 hours
          {:else}
            {summary.criticalCount} resource(s) exceed 24h limit
          {/if}
        </div>
        <div class="text-sm text-slate-400 mt-1">
          Total estimated time: <span class="font-mono text-white">{summary.totalTimeHours.toFixed(2)}h</span>
          {#if summary.warningCount > 0}
            <span class="ml-3 text-amber-400">({summary.warningCount} warnings)</span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-slate-500 border-b border-slate-800">
          <th class="text-left py-3 px-2 font-medium">Resource</th>
          <th class="text-right py-3 px-2 font-medium">API Calls</th>
          <th class="text-right py-3 px-2 font-medium">Rate Limit</th>
          <th class="text-right py-3 px-2 font-medium">Time</th>
          <th class="text-right py-3 px-2 font-medium">% of 24h</th>
          <th class="text-center py-3 px-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each summary.results as result}
          <tr class="border-b border-slate-800/50 hover:bg-slate-950/30 transition-colors">
            <td class="py-3 px-2 text-white font-medium">{result.displayName}</td>
            <td class="py-3 px-2 text-right font-mono text-slate-300">{result.totalApiCalls.toLocaleString()}</td>
            <td class="py-3 px-2 text-right font-mono text-slate-400">{result.rateLimitPerMinute}/min</td>
            <td class="py-3 px-2 text-right font-mono text-slate-300">{result.timeToIngestHours.toFixed(2)}h</td>
            <td class="py-3 px-2 text-right font-mono">
              <span class={result.status === 'ok' ? 'text-emerald-400' : result.status === 'warning' ? 'text-amber-400' : 'text-rose-400'}>
                {result.percentOf24h.toFixed(1)}%
              </span>
            </td>
            <td class="py-3 px-2 text-center">
              {#if result.status === 'ok'}
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</span>
              {:else if result.status === 'warning'}
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Warn</span>
              {:else}
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Critical</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
{/if}
