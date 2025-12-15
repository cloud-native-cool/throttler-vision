<script lang="ts">
  import type { PageData } from './$types';
  import type { GcpServiceInfo } from '$lib/server/gcp/serviceDiscovery';

  export let data: PageData;

  let searchQuery = '';
  let selectedService: GcpServiceInfo | null = null;
  let addingService = false;
  let addSuccess = false;

  $: filteredServices = data.services.filter(s => 
    s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function selectService(service: GcpServiceInfo) {
    selectedService = service;
    addSuccess = false;
  }

  async function addToCalculator() {
    if (!selectedService) return;
    addingService = true;

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: selectedService.name,
          displayName: selectedService.displayName
        })
      });

      if (response.ok) {
        addSuccess = true;
      }
    } catch (e) {
      console.error('Failed to add service:', e);
    } finally {
      addingService = false;
    }
  }
</script>

<svelte:head>
  <title>Service Browser | Throttler Vision</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
  <h1 class="text-3xl font-bold text-white mb-2">GCP Service Browser</h1>
  <p class="text-slate-400 mb-8">Explore GCP services and add them to your capacity calculator.</p>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Service List -->
    <div class="lg:col-span-5">
      <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl">
        <!-- Search -->
        <div class="mb-4">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search services..."
            class="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        <!-- List -->
        <div class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {#each filteredServices as service}
            <button
              on:click={() => selectService(service)}
              class={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                selectedService?.name === service.name 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-800/50 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div class="font-medium text-white">{service.displayName}</div>
              <div class="text-xs text-slate-500 font-mono mt-1">{service.name}</div>
            </button>
          {/each}

          {#if filteredServices.length === 0}
            <div class="text-center py-8 text-slate-500">
              No services match "{searchQuery}"
            </div>
          {/if}
        </div>

        <div class="mt-4 text-xs text-slate-600 text-center">
          {filteredServices.length} of {data.services.length} services
        </div>
      </div>
    </div>

    <!-- Service Details -->
    <div class="lg:col-span-7">
      {#if selectedService}
        <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl">
          <h2 class="text-2xl font-bold text-white mb-2">{selectedService.displayName}</h2>
          <p class="text-slate-400 font-mono text-sm mb-6">{selectedService.name}</p>

          <!-- Quick Info -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Default Rate</div>
              <div class="text-xl font-mono text-white">600 <span class="text-sm text-slate-500">req/min</span></div>
            </div>
            <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Page Size</div>
              <div class="text-xl font-mono text-white">100 <span class="text-sm text-slate-500">items</span></div>
            </div>
          </div>

          <!-- Add Button -->
          <button
            on:click={addToCalculator}
            disabled={addingService || addSuccess}
            class={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
              addSuccess 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {#if addSuccess}
              ✓ Added to Calculator
            {:else if addingService}
              Adding...
            {:else}
              Add to Calculator
            {/if}
          </button>

          {#if addSuccess}
            <p class="text-center text-sm text-slate-400 mt-3">
              Go to <a href="/" class="text-indigo-400 hover:underline">Dashboard</a> to use this service.
            </p>
          {/if}
        </div>
      {:else}
        <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-800/50 shadow-2xl text-center">
          <div class="text-5xl mb-4 opacity-50">👈</div>
          <p class="text-slate-500">Select a service to view details</p>
        </div>
      {/if}
    </div>
  </div>
</div>
