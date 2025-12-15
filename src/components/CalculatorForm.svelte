<script lang="ts">
  export let operationCount = 1000;
  export let timeframeSeconds = 60; // Default 1 minute

  const timeframes = [
    { label: '1 Second', value: 1 },
    { label: '1 Minute', value: 60 },
    { label: '1 Hour', value: 3600 },
    { label: '24 Hours', value: 86400 }
  ];
</script>

<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-xl space-y-6">
  <h2 class="text-xl font-semibold mb-4 text-white flex items-center tracking-tight">
    <span class="mr-3 p-2 bg-indigo-500/10 rounded-lg text-indigo-400">🧮</span> Simulation Parameters
  </h2>

  <!-- Operation Count -->
  <div class="group">
    <label for="ops" class="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
      Target Ingestion Count
    </label>
    <div class="relative">
      <input
        type="number"
        id="ops"
        bind:value={operationCount}
        min="1"
        class="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-700"
        placeholder="e.g. 1000000"
      />
      <div class="absolute right-4 top-3.5 text-xs text-slate-600 pointer-events-none">ops</div>
    </div>
  </div>

  <!-- Timeframe -->
  <div class="group">
    <label for="timeframe" class="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
      Ingestion Window
    </label>
    <div class="relative">
      <select
        id="timeframe"
        bind:value={timeframeSeconds}
        class="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
      >
        {#each timeframes as tf}
          <option value={tf.value}>{tf.label}</option>
        {/each}
      </select>
        <div class="absolute right-4 top-4 text-slate-500 pointer-events-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>
  </div>
</div>
