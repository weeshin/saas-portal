<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiRequest } from '../lib/api';
import { useAuthStore, type PortalUser } from '../stores/auth';

interface AuthResponse { accessToken: string; user: PortalUser }

const router = useRouter();
const auth = useAuthStore();

const form = reactive({ name: '', email: '', password: '' });
const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const message = ref('');

async function submit(): Promise<void> {
  state.value = 'loading'; message.value = '';
  try {
    const response = await apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(form) });
    auth.establishSession(response);
    state.value = 'success'; message.value = 'Account created. Opening your control plane…';
    await router.push('/control');
  } catch (error) { state.value = 'error'; message.value = error instanceof Error ? error.message : 'Registration failed'; }
}
</script>

<template>
  <main class="grid min-h-screen bg-cream lg:grid-cols-2">
    <section class="hidden bg-ink p-14 text-white lg:flex lg:flex-col lg:justify-between">
      <RouterLink to="/" class="text-lg font-black">AnnoVis<span class="text-emerald-300">/</span></RouterLink>
      <div><p class="text-sm font-bold uppercase tracking-[.2em] text-emerald-300">Your own secure workspace</p><h1 class="mt-5 text-6xl font-black leading-[.95] tracking-[-.05em]">From signup to running—without the infrastructure headache.</h1></div>
      <p class="text-sm text-white/45">Secure hosting · Automatic backups · Managed operations</p>
    </section>
    <section class="flex items-center justify-center px-6 py-16">
      <form class="w-full max-w-md" @submit.prevent="submit">
        <RouterLink to="/" class="mb-12 block text-lg font-black lg:hidden">AnnoVis/</RouterLink>
        <p class="text-xs font-black uppercase tracking-[.2em] text-leaf">Start your 30-day trial</p>
        <h2 class="mt-3 text-4xl font-black tracking-tight">Create your account</h2>
        <p class="mt-3 text-ink/55">No credit card required.</p>
        <div class="mt-9 space-y-5">
          <label class="block text-sm font-bold">Full name<input v-model="form.name" required minlength="2" autocomplete="name" class="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none ring-leaf/20 focus:ring-4" /></label>
          <label class="block text-sm font-bold">Work email<input v-model="form.email" required type="email" autocomplete="email" class="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none ring-leaf/20 focus:ring-4" /></label>
          <label class="block text-sm font-bold">Password<input v-model="form.password" required type="password" minlength="12" autocomplete="new-password" class="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none ring-leaf/20 focus:ring-4" /><span class="mt-2 block text-xs font-normal text-ink/45">Use at least 12 characters.</span></label>
        </div>
        <button :disabled="state === 'loading'" class="mt-8 w-full rounded-full bg-ink px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50">{{ state === 'loading' ? 'Creating account…' : 'Continue →' }}</button>
        <p v-if="message" role="status" class="mt-5 rounded-xl p-3 text-sm" :class="state === 'success' ? 'bg-mint text-leaf' : 'bg-red-50 text-red-700'">{{ message }}</p>
      </form>
    </section>
  </main>
</template>
