<script lang="ts">
  import type { CalculationResult } from '$lib/types';

  export let result: CalculationResult | null = null;
</script>

<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl h-full flex flex-col">
  <h2 class="text-xl font-semibold mb-6 text-white flex items-center tracking-tight">
    <span class="mr-3 p-2 bg-indigo-500/10 rounded-lg text-indigo-400">📊</span> Capacity Analysis
  </h2>

  {#if result}
    <div class="space-y-6 flex-1">
      <!-- Risk Banner -->
      <div 
        class={`p-5 rounded-xl border relative overflow-hidden group transition-all duration-300 
          ${result.throttlingRisk === 'Low' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
          ${result.throttlingRisk === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : ''}
          ${result.throttlingRisk === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : ''}
        `}
      >
        <!-- Glow effect -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>

        <div class="flex items-start space-x-4 relative z-10">
           <div class="text-3xl mt-1 filter drop-shadow-lg">
            {#if result.throttlingRisk === 'Low'}✅
            {:else if result.throttlingRisk === 'Medium'}⚠️
            {:else}🚫{/if}
          </div>
          <div>
            <div class="font-bold text-lg tracking-wide uppercase text-white/90">{result.throttlingRisk} Risk</div>
            <p class="text-sm opacity-90 leading-relaxed mt-1 font-medium text-white/70">
              Planned load <span class="text-white">{result.recommendation}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-2 gap-4">
         <div class="bg-slate-950/50 p-5 rounded-xl border border-slate-800/50 hover:border-indigo-500/30 transition-colors group">
          <div class="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Max Daily Capacity</div>
          <div class="text-2xl font-mono text-white tracking-tight group-hover:text-indigo-400 transition-colors">
            {(result.maxDailyCapacity / 1000000).toFixed(2)}M <span class="text-sm text-slate-600">ops/24h</span>
          </div>
        </div>
        
        <div class="bg-slate-950/50 p-5 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 transition-colors group">
           <div class="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Safe Rate Limit</div>
           <div class="text-2xl font-mono text-white tracking-tight group-hover:text-emerald-400 transition-colors">
             {result.safeIngestionRate.toFixed(1)} <span class="text-sm text-slate-600">req/s</span>
           </div>
        </div>
      </div>
      
      <!-- Secondary Metrics -->
      <div class="bg-slate-950/30 p-4 rounded-xl border border-slate-800/30 flex justify-between items-center text-sm">
         <div class="text-slate-400">Current Utilization:</div>
         <div class="font-mono" class:text-white={result.percentUtilization < 80} class:text-rose-400={result.percentUtilization >= 80}>{result.percentUtilization.toFixed(4)}%</div>
      </div>

    </div>
  {:else}
    <div class="flex flex-col items-center justify-center flex-1 text-slate-600 border border-dashed border-slate-800/50 rounded-xl m-4">
      <div class="text-4xl mb-4 opacity-50">👈</div>
      <p class="font-medium">Select a service to analyze</p>
    </div>
  {/if}
</div>
