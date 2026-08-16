<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const mobileNavOpen = ref(false);
const initials = computed(() => auth.user?.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() ?? 'U');

async function logout(): Promise<void> { auth.logout(); await router.push('/login'); }
</script>

<template>
  <div class="min-h-screen bg-[#f3f5f1] text-ink">
    <header class="sticky top-0 z-20 border-b border-ink/10 bg-white/90 backdrop-blur-xl">
      <div class="mx-auto flex h-18 max-w-[1500px] items-center justify-between px-5 sm:px-8">
        <div class="flex items-center gap-10">
          <RouterLink to="/control" class="text-lg font-black tracking-tight">PORTAL<span class="text-leaf">/</span></RouterLink>
          <nav class="hidden items-center gap-1 text-sm font-semibold md:flex">
            <a href="#overview" class="rounded-full bg-ink px-4 py-2 text-white">Overview</a>
            <a href="#environment" class="rounded-full px-4 py-2 text-ink/55 hover:bg-ink/5 hover:text-ink">Environment</a>
            <a href="#backups" class="rounded-full px-4 py-2 text-ink/55 hover:bg-ink/5 hover:text-ink">Backups</a>
            <a href="#operations" class="rounded-full px-4 py-2 text-ink/55 hover:bg-ink/5 hover:text-ink">Operations</a>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block"><div class="text-sm font-bold">{{ auth.user?.name }}</div><div class="text-xs text-ink/45">{{ auth.user?.email }}</div></div>
          <button class="grid h-10 w-10 place-items-center rounded-full bg-mint text-xs font-black text-leaf" :aria-expanded="mobileNavOpen" @click="mobileNavOpen = !mobileNavOpen">{{ initials }}</button>
          <button class="hidden rounded-full border border-ink/10 px-4 py-2 text-xs font-bold sm:block" @click="logout">Sign out</button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-[1500px] px-5 py-9 sm:px-8 sm:py-12">
      <section id="overview" class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div><p class="text-xs font-black uppercase tracking-[.2em] text-leaf">Customer control plane</p><h1 class="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">Good day, {{ auth.user?.name.split(' ')[0] }}.</h1><p class="mt-3 text-ink/55">Here is the current state of your SaaS environment.</p></div>
        <div class="flex items-center gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm"><span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span><div><span class="font-bold">Setup required</span><span class="ml-2 text-ink/50">No organization or environment yet</span></div></div>
      </section>

      <section class="mt-9 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article id="environment" class="overflow-hidden rounded-[1.7rem] bg-ink text-white shadow-xl shadow-ink/8">
          <div class="flex flex-col justify-between gap-8 p-7 sm:flex-row sm:p-9">
            <div><div class="flex items-center gap-3"><span class="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white/60">PRODUCTION</span><span class="text-xs font-bold text-amber-300">● Not configured</span></div><h2 class="mt-8 text-3xl font-black tracking-tight">Your application environment</h2><p class="mt-2 max-w-xl text-sm leading-6 text-white/50">Complete organization setup to choose a subdomain and region, accept terms, and start your 30-day trial.</p></div>
            <button disabled class="self-start rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white/40">Open application ↗</button>
          </div>
          <div class="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <div class="border-white/10 p-6 sm:border-r"><p class="text-xs uppercase tracking-widest text-white/35">URL</p><p class="mt-2 font-bold text-white/65">Not assigned</p></div>
            <div class="border-white/10 p-6 lg:border-r"><p class="text-xs uppercase tracking-widest text-white/35">Version</p><p class="mt-2 font-bold text-white/65">—</p></div>
            <div class="border-white/10 p-6 sm:border-r"><p class="text-xs uppercase tracking-widest text-white/35">Region</p><p class="mt-2 font-bold text-white/65">Not selected</p></div>
            <div class="p-6"><p class="text-xs uppercase tracking-widest text-white/35">Health</p><p class="mt-2 font-bold text-white/65">UNKNOWN</p></div>
          </div>
        </article>

        <article class="rounded-[1.7rem] border border-ink/8 bg-white p-7 shadow-sm sm:p-8">
          <div class="flex items-center justify-between"><div><p class="text-xs font-black uppercase tracking-[.16em] text-leaf">Onboarding</p><h2 class="mt-2 text-2xl font-black">Create your workspace</h2></div><span class="grid h-12 w-12 place-items-center rounded-2xl bg-mint font-black text-leaf">0%</span></div>
          <ol class="mt-7 space-y-4 text-sm">
            <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-xs font-black text-white">✓</span><div><p class="font-bold">Account created</p><p class="mt-0.5 text-ink/45">Your secure portal access is ready.</p></div></li>
            <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink/15 text-xs font-black">2</span><div><p class="font-bold">Organization details</p><p class="mt-0.5 text-ink/45">Company name and workspace URL.</p></div></li>
            <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink/15 text-xs font-black">3</span><div><p class="font-bold">Region and terms</p><p class="mt-0.5 text-ink/45">Choose proximity and accept terms.</p></div></li>
            <li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink/15 text-xs font-black">4</span><div><p class="font-bold">Provision environment</p><p class="mt-0.5 text-ink/45">We deploy and verify your application.</p></div></li>
          </ol>
          <button class="mt-7 w-full rounded-full bg-leaf px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-leaf/15">Continue setup →</button>
        </article>
      </section>

      <section class="mt-5 grid gap-5 md:grid-cols-3">
        <article class="rounded-[1.5rem] border border-ink/8 bg-white p-6"><div class="flex items-start justify-between"><div><p class="text-xs font-black uppercase tracking-[.16em] text-ink/40">Trial</p><p class="mt-3 text-2xl font-black">Not started</p></div><span class="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">◷</span></div><p class="mt-5 text-sm text-ink/45">Your 30 days begin after provisioning.</p></article>
        <article id="backups" class="rounded-[1.5rem] border border-ink/8 bg-white p-6"><div class="flex items-start justify-between"><div><p class="text-xs font-black uppercase tracking-[.16em] text-ink/40">Last backup</p><p class="mt-3 text-2xl font-black">No backups</p></div><span class="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600">↓</span></div><p class="mt-5 text-sm text-ink/45">Automatic backups start with your environment.</p></article>
        <article class="rounded-[1.5rem] border border-ink/8 bg-white p-6"><div class="flex items-start justify-between"><div><p class="text-xs font-black uppercase tracking-[.16em] text-ink/40">Application</p><p class="mt-3 text-2xl font-black">Inventory</p></div><span class="grid h-10 w-10 place-items-center rounded-xl bg-mint text-leaf">◇</span></div><p class="mt-5 text-sm text-ink/45">Stable release channel · PostgreSQL</p></article>
      </section>

      <section id="operations" class="mt-5 rounded-[1.7rem] border border-ink/8 bg-white p-7 sm:p-8">
        <div class="flex items-center justify-between"><div><p class="text-xs font-black uppercase tracking-[.16em] text-leaf">Operation history</p><h2 class="mt-2 text-2xl font-black">Recent activity</h2></div><span class="text-xs font-bold text-ink/35">AUDITED</span></div>
        <div class="mt-7 rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center"><p class="font-bold">No operations yet</p><p class="mt-2 text-sm text-ink/45">Provisioning, backups, upgrades, and restarts will appear here.</p></div>
      </section>
    </main>
  </div>
</template>
