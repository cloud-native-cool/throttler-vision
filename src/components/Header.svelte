<script lang="ts">
  export let title = "Throttler Vision";
</script>

<header class="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
  <div class="container mx-auto flex justify-between items-center p-4">
    <div class="flex items-center space-x-3">
      <div class="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
        <span class="text-white font-bold text-lg leading-none">⚡</span>
      </div>
      <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
        {title}
      </span>
      <span class="text-[0.6rem] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold ml-2">
        Beta
      </span>
    </div>
    
    <nav>
      <ul class="flex space-x-8 text-sm font-medium text-slate-400">
        <li><a href="/" class="hover:text-white transition-colors relative group">
          Dashboard
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
        </a></li>
        <li><a href="https://cloud.google.com/docs/quotas" target="_blank" class="hover:text-white transition-colors">Docs</a></li>
      </ul>
    </nav>
  </div>
</header>
