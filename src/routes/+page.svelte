<script lang="ts">
  import type { PageData } from './$types';
  import type { RateLimitData, CalculationResult, BatchInput, BatchAssessmentSummary } from '$lib/types';
  import { calculateThroughput, calculateBatchThroughput } from '$lib/calculator';
  
  import ServiceSelector from '../components/ServiceSelector.svelte';
  import CalculatorForm from '../components/CalculatorForm.svelte';
  import ResultsDisplay from '../components/ResultsDisplay.svelte';
  import Visualization from '../components/Visualization.svelte';
  import BatchAssessment from '../components/BatchAssessment.svelte';
  import BatchResults from '../components/BatchResults.svelte';
  
  export let data: PageData;
  
  // Tab State
  let activeTab: 'single' | 'batch' = 'batch';
  
  // Single Service State
  let selectedServiceId: string | null = null;
  let operationCount = 1000;
  let timeframeSeconds = 60;
  
  $: selectedService = data.quotas.find(q => 
    `${q.provider}:${q.service}:${q.operation}` === selectedServiceId
  );
  
  $: result = selectedService ? calculateThroughput({
    serviceId: selectedServiceId!,
    operationCount,
    timeframeSeconds
  }, selectedService) : null;
  
  // Batch State
  let batchSummary: BatchAssessmentSummary | null = null;
  
  function handleBatchCalculate(event: CustomEvent<BatchInput[]>) {
    batchSummary = calculateBatchThroughput(event.detail);
  }
</script>

<svelte:head>
  <title>Throttler Vision | Cloud Rate Limit Calculator</title>
</svelte:head>

<!-- Tab Navigation -->
<div class="mb-6 flex space-x-2">
  <button
    on:click={() => activeTab = 'batch'}
    class={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'batch' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
  >
    📋 Batch Assessment
  </button>
  <button
    on:click={() => activeTab = 'single'}
    class={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'single' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
  >
    🔍 Single Service
  </button>
</div>

{#if activeTab === 'batch'}
  <!-- Batch Assessment Mode -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div class="lg:col-span-5">
      <BatchAssessment on:calculate={handleBatchCalculate} />
    </div>
    <div class="lg:col-span-7">
      <BatchResults summary={batchSummary} />
      {#if !batchSummary}
        <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-800/50 shadow-2xl text-center">
          <div class="text-5xl mb-4 opacity-50">📊</div>
          <p class="text-slate-500">Enable resources and click "Analyze Capacity" to see results</p>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <!-- Single Service Mode -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div class="lg:col-span-4 space-y-6">
      <ServiceSelector 
        services={data.quotas} 
        bind:selectedServiceId 
      />
      <CalculatorForm 
        bind:operationCount 
        bind:timeframeSeconds 
      />
    </div>
    <div class="lg:col-span-8 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <ResultsDisplay {result} />
         <Visualization {result} />
      </div>
      
      {#if selectedService}
        <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-xl">
          <h3 class="text-lg font-semibold text-white mb-3">Metadata</h3>
          <p class="text-slate-400 text-sm">
            <span class="font-bold text-slate-300">Source:</span> <a href={selectedService.metadata.sourceUrl} target="_blank" class="text-indigo-400 hover:underline">Official Documentation</a>
          </p>
          <p class="text-slate-400 text-sm mt-1">
            <span class="font-bold text-slate-300">Last Verified:</span> {new Date(selectedService.metadata.lastVerified).toLocaleDateString()}
          </p>
          <div class="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
            {JSON.stringify(selectedService.limits, null, 2)}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
