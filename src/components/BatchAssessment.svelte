<script lang="ts">
  import { GCP_SERVICE_MAPPINGS } from '$lib/data/serviceMappings';
  import type { BatchInput } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ calculate: BatchInput[] }>();

  // Initialize inputs from service mappings
  let inputs: (BatchInput & { enabled: boolean })[] = GCP_SERVICE_MAPPINGS.map(m => ({
    resourceType: m.resourceType,
    count: 0,
    projectCount: 1,
    enabled: false
  }));

  let projectCount = 1;

  function handleCalculate() {
    const activeInputs = inputs
      .filter(i => i.enabled && i.count > 0)
      .map(i => ({
        resourceType: i.resourceType,
        count: i.count,
        projectCount: projectCount
      }));
    dispatch('calculate', activeInputs);
  }

  function toggleResource(index: number) {
    inputs[index].enabled = !inputs[index].enabled;
    inputs = inputs;
  }

  function getDisplayName(resourceType: string): string {
    return GCP_SERVICE_MAPPINGS.find(m => m.resourceType === resourceType)?.displayName ?? resourceType;
  }
</script>

<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl">
  <h2 class="text-xl font-semibold mb-6 text-white flex items-center tracking-tight">
    <span class="mr-3 p-2 bg-indigo-500/10 rounded-lg text-indigo-400">📋</span> Batch Assessment
  </h2>

  <!-- Global Project Count -->
  <div class="mb-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
    <label for="projectCount" class="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
      Number of GCP Projects
    </label>
    <input
      type="number"
      id="projectCount"
      bind:value={projectCount}
      min="1"
      class="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
    />
    <p class="text-xs text-slate-600 mt-2">API calls will be multiplied by this number.</p>
  </div>

  <!-- Resource Inputs -->
  <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
    {#each inputs as input, i}
      <div 
        class={`p-4 rounded-xl border transition-all duration-200 ${input.enabled ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-slate-950/30 border-slate-800/50 hover:border-slate-700'}`}
      >
        <div class="flex items-center justify-between">
          <label class="flex items-center space-x-3 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={input.enabled}
              on:change={() => toggleResource(i)}
              class="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
            />
            <span class={`font-medium ${input.enabled ? 'text-white' : 'text-slate-400'}`}>
              {getDisplayName(input.resourceType)}
            </span>
          </label>
          
          {#if input.enabled}
            <input
              type="number"
              bind:value={input.count}
              min="0"
              placeholder="Count"
              class="w-32 bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white text-right font-mono text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
            />
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Calculate Button -->
  <button
    on:click={handleCalculate}
    disabled={!inputs.some(i => i.enabled && i.count > 0)}
    class="mt-6 w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:shadow-none"
  >
    Analyze Capacity
  </button>
</div>
