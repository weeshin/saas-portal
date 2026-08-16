<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');

async function submit(): Promise<void> {
  loading.value = true; error.value = '';
  try { await auth.login(form.email, form.password); await router.push('/control'); }
  catch (caught) { error.value = caught instanceof Error ? caught.message : 'Login failed'; }
  finally { loading.value = false; }
}
</script>

<template>
  <main class="grid min-h-screen bg-cream lg:grid-cols-[.85fr_1.15fr]">
    <section class="flex items-center justify-center px-6 py-16">
      <form class="w-full max-w-md" @submit.prevent="submit">
        <RouterLink to="/" class="mb-14 block text-lg font-black tracking-tight">AnnoVis<span class="text-leaf">/</span></RouterLink>
        <p class="text-xs font-black uppercase tracking-[.2em] text-leaf">Customer control plane</p>
        <h1 class="mt-3 text-4xl font-black tracking-[-.035em]">Welcome back</h1>
        <p class="mt-3 text-ink/55">Sign in to manage your environment.</p>
        <div class="mt-9 space-y-5">
          <label class="block text-sm font-bold">Email address<input v-model="form.email" required type="email" autocomplete="email" class="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none ring-leaf/20 focus:ring-4"></label>
          <label class="block text-sm font-bold">Password<input v-model="form.password" required type="password" autocomplete="current-password" class="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none ring-leaf/20 focus:ring-4"></label>
        </div>
        <button :disabled="loading" class="mt-8 w-full rounded-full bg-ink px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50">{{ loading ? 'Signing in…' : 'Sign in →' }}</button>
        <p v-if="error" role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
        <p class="mt-8 text-center text-sm text-ink/55">New here? <RouterLink to="/register" class="font-bold text-leaf">Start a free trial</RouterLink></p>
      </form>
    </section>
    <section class="relative hidden overflow-hidden bg-ink p-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-leaf/40 blur-3xl"></div>
      <p class="relative text-sm font-bold text-white/55">Managed SaaS operations</p>
      <div class="relative max-w-xl"><p class="text-sm font-bold uppercase tracking-[.2em] text-emerald-300">Everything in one place</p><h2 class="mt-5 text-6xl font-black leading-[.95] tracking-[-.055em]">Know your environment is healthy.</h2><p class="mt-6 max-w-md text-lg leading-8 text-white/55">Deployment, versions, trial status, backups, and operational history—without opening a terminal.</p></div>
      <p class="relative text-sm text-white/40">Secure access · Isolated tenants · Audited operations</p>
    </section>
  </main>
</template>
