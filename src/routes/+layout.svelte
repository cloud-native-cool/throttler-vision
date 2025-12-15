<script>
  import '../app.css';
  import Header from '../components/Header.svelte';
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
  <Header />
  <main class="container mx-auto p-4 md:p-8">
    <slot />
  </main>
</div>
