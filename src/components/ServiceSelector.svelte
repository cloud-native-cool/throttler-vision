<script lang="ts">
  import type { RateLimitData } from '$lib/types';

  export let services: RateLimitData[] = [];
  export let selectedServiceId: string | null = null;

  function handleSelect(id: string) {
    selectedServiceId = id;
  }
</script>

<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl">
  <h2 class="text-xl font-semibold mb-6 text-white flex items-center tracking-tight">
    <span class="mr-3 p-2 bg-indigo-500/10 rounded-lg text-indigo-400">🔍</span> Select Service
  </h2>

  <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
    {#each services as service}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      {@const id = `${service.provider}:${service.service}:${service.operation}`}
      <button 
        type="button"
        class={`w-full text-left group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border hover:shadow-lg hover:shadow-indigo-500/10 ${selectedServiceId === id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900'}`}
        on:click={() => handleSelect(id)}
      >
        <!-- Active Indicator -->
        {#if selectedServiceId === id}
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
        {/if}

        <div>
          <div class="font-medium text-slate-200 group-hover:text-white transition-colors">{service.serviceDisplayName}</div>
          <div class="text-xs text-slate-500 font-mono mt-1.5 flex items-center">
             <span class="opacity-50 mr-2">OP:</span> {service.operation}
          </div>
        </div>
        
        <div class="text-right">
           <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
             {selectedServiceId === id ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20' : 'bg-slate-900 text-slate-400 border-slate-800'}">
             {#if service.limits.requestsPerSecond}
               {service.limits.requestsPerSecond.toLocaleString()} <span class="opacity-50 ml-1">req/s</span>
             {:else if service.limits.requestsPerMinute}
               {service.limits.requestsPerMinute.toLocaleString()} <span class="opacity-50 ml-1">req/m</span>
             {:else}
               -
             {/if}
           </span>
        </div>
      </button>
    {/each}
    
    {#if services.length === 0}
      <div class="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
        <span class="text-3xl mb-3 opacity-50">👻</span>
        <span>No services found.</span>
      </div>
    {/if}
  </div>
</div>
