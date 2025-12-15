<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { CalculationResult } from '$lib/types';

  export let result: CalculationResult | null = null;
  
  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  function updateChart() {
    if (!result || !canvas) return;
    
    if (chart) {
      chart.destroy();
    }
    
    // Timeline Data Simulation (Linear)
    const hours = [0, 4, 8, 12, 16, 20, 24];
    const plannedData = hours.map(h => (result!.maxOperations) * (h/24) ); // Assuming the operations are spread over 24h for the viz
    
    const riskColor = result.throttlingRisk === 'High' ? '#f43f5e' : 
                      result.throttlingRisk === 'Medium' ? '#fbbf24' : '#10b981';

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: hours.map(h => `+${h}h`),
        datasets: [{
          label: 'Planned Ingestion',
          data: plannedData,
          borderColor: riskColor,
          tension: 0.4,
          fill: true,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, riskColor + '40'); // 25% opacity
            gradient.addColorStop(1, riskColor + '00'); // 0% opacity
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
             backgroundColor: '#0f172a',
             titleColor: '#e2e8f0',
             bodyColor: '#e2e8f0',
             borderColor: '#1e293b',
             borderWidth: 1,
             padding: 10,
             displayColors: false
          }
        },
        scales: {
          y: {
            grid: { color: '#1e293b', drawBorder: false },
            ticks: { color: '#64748b', font: { family: 'sans-serif', size: 10 } },
            border: { display: false }
          },
          x: {
            grid: { color: '#1e293b', drawBorder: false },
            ticks: { color: '#64748b', font: { family: 'sans-serif', size: 10 } },
            border: { display: false }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
      }
    });
  }

  onMount(() => {
    updateChart();
  });

  afterUpdate(() => {
    updateChart();
  });
</script>

<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-xl h-full flex flex-col">
  <h2 class="text-xl font-semibold mb-6 text-white flex items-center tracking-tight">
    <span class="mr-3 p-2 bg-indigo-500/10 rounded-lg text-indigo-400">📈</span> 24h Projection
  </h2>
  
  <div class="relative flex-1 w-full min-h-[250px]">
    {#if result}
      <canvas bind:this={canvas}></canvas>
    {:else}
       <div class="flex items-center justify-center h-full text-slate-600">
        No projection available
      </div>
    {/if}
  </div>
</div>
