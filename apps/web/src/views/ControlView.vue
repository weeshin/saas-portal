<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../stores/auth';

interface Summary { customers: number; applications: number; releases: number; environments: number; activeEnvironments: number; failedEnvironments: number }
interface Customer { id: string; code: string; name: string; contactEmail: string | null; status: string }
interface Application { id: string; code: string; name: string; ghcrOwner: string; apiPackage: string | null; webPackage: string | null; status: string }
interface Environment { id: string; name: string; hostname: string; deploymentMode: string; status: string }

const auth = useAuthStore();
const router = useRouter();
const loading = ref(true);
const error = ref('');
const summary = ref<Summary>({ customers: 0, applications: 0, releases: 0, environments: 0, activeEnvironments: 0, failedEnvironments: 0 });
const customers = ref<Customer[]>([]);
const applications = ref<Application[]>([]);
const environments = ref<Environment[]>([]);
const showCustomerForm = ref(false);
const savingCustomer = ref(false);
const customerForm = ref({ code: '', name: '', contactName: '', contactEmail: '', notes: '' });
const initials = computed(() => auth.user?.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() ?? 'U');
const canOperate = computed(() => ['SUPER_ADMIN', 'OPERATIONS'].includes(auth.user?.role ?? ''));

async function loadDashboard(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    [summary.value, customers.value, applications.value, environments.value] = await Promise.all([
      apiRequest<Summary>('/backoffice/summary'),
      apiRequest<Customer[]>('/backoffice/customers'),
      apiRequest<Application[]>('/backoffice/applications'),
      apiRequest<Environment[]>('/backoffice/environments'),
    ]);
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Unable to load the backoffice.';
  } finally {
    loading.value = false;
  }
}

async function createCustomer(): Promise<void> {
  savingCustomer.value = true;
  error.value = '';
  try {
    await apiRequest<Customer>('/backoffice/customers', { method: 'POST', body: JSON.stringify(customerForm.value) });
    customerForm.value = { code: '', name: '', contactName: '', contactEmail: '', notes: '' };
    showCustomerForm.value = false;
    await loadDashboard();
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Unable to create customer.';
  } finally {
    savingCustomer.value = false;
  }
}

async function logout(): Promise<void> { auth.logout(); await router.push('/login'); }
onMounted(loadDashboard);
</script>

<template>
  <div class="min-h-screen bg-[#f3f5f1] text-ink">
    <header class="sticky top-0 z-20 border-b border-ink/10 bg-white/90 backdrop-blur-xl">
      <div class="mx-auto flex h-18 max-w-[1500px] items-center justify-between px-5 sm:px-8">
        <div class="flex items-center gap-10">
          <RouterLink to="/control" class="text-lg font-black tracking-tight">AnnoVis<span class="text-leaf">/</span></RouterLink>
          <nav class="hidden items-center gap-1 text-sm font-semibold md:flex">
            <a href="#overview" class="rounded-full bg-ink px-4 py-2 text-white">Dashboard</a>
            <a href="#customers" class="rounded-full px-4 py-2 text-ink/55 hover:bg-ink/5">Customers</a>
            <a href="#applications" class="rounded-full px-4 py-2 text-ink/55 hover:bg-ink/5">Applications</a>
            <a href="#environments" class="rounded-full px-4 py-2 text-ink/55 hover:bg-ink/5">Environments</a>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block"><div class="text-sm font-bold">{{ auth.user?.name }}</div><div class="text-xs text-ink/45">{{ auth.user?.role?.replace('_', ' ') }}</div></div>
          <span class="grid h-10 w-10 place-items-center rounded-full bg-mint text-xs font-black text-leaf">{{ initials }}</span>
          <button class="rounded-full border border-ink/10 px-4 py-2 text-xs font-bold" @click="logout">Sign out</button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-[1500px] px-5 py-9 sm:px-8 sm:py-12">
      <section id="overview" class="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div><p class="text-xs font-black uppercase tracking-[.2em] text-leaf">Operations backoffice</p><h1 class="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">Platform overview</h1><p class="mt-3 text-ink/55">Manage customers, releases, infrastructure, domains, and deployments.</p></div>
        <button class="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-bold" :disabled="loading" @click="loadDashboard">{{ loading ? 'Refreshing…' : 'Refresh data' }}</button>
      </section>

      <p v-if="error" role="alert" class="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{{ error }}</p>

      <section class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <article v-for="item in [['Customers', summary.customers], ['Applications', summary.applications], ['Releases', summary.releases], ['Environments', summary.environments], ['Active', summary.activeEnvironments], ['Failed', summary.failedEnvironments]]" :key="item[0]" class="rounded-2xl border border-ink/8 bg-white p-5">
          <p class="text-xs font-black uppercase tracking-widest text-ink/40">{{ item[0] }}</p><p class="mt-3 text-3xl font-black">{{ item[1] }}</p>
        </article>
      </section>

      <section id="customers" class="mt-6 rounded-[1.7rem] border border-ink/8 bg-white p-7 sm:p-8">
        <div class="flex flex-wrap items-center justify-between gap-4"><div><p class="text-xs font-black uppercase tracking-[.16em] text-leaf">Customer registry</p><h2 class="mt-2 text-2xl font-black">Customers</h2></div><button v-if="canOperate" class="rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white" @click="showCustomerForm = !showCustomerForm">{{ showCustomerForm ? 'Cancel' : 'Add customer' }}</button></div>
        <form v-if="showCustomerForm" class="mt-6 grid gap-4 rounded-2xl bg-[#f3f5f1] p-5 md:grid-cols-2" @submit.prevent="createCustomer">
          <input v-model="customerForm.code" required pattern="[A-Za-z0-9_-]+" placeholder="Customer code (ACME)" class="rounded-xl border border-ink/10 bg-white px-4 py-3">
          <input v-model="customerForm.name" required minlength="2" placeholder="Business name" class="rounded-xl border border-ink/10 bg-white px-4 py-3">
          <input v-model="customerForm.contactName" placeholder="Contact name" class="rounded-xl border border-ink/10 bg-white px-4 py-3">
          <input v-model="customerForm.contactEmail" type="email" placeholder="Contact email" class="rounded-xl border border-ink/10 bg-white px-4 py-3">
          <textarea v-model="customerForm.notes" placeholder="Internal notes" class="rounded-xl border border-ink/10 bg-white px-4 py-3 md:col-span-2"></textarea>
          <button :disabled="savingCustomer" class="justify-self-start rounded-full bg-ink px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{{ savingCustomer ? 'Saving…' : 'Create customer' }}</button>
        </form>
        <div class="mt-6 overflow-x-auto"><table class="w-full min-w-[650px] text-left text-sm"><thead class="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/40"><tr><th class="pb-3">Code</th><th class="pb-3">Customer</th><th class="pb-3">Contact</th><th class="pb-3">Status</th></tr></thead><tbody><tr v-for="customer in customers" :key="customer.id" class="border-b border-ink/6"><td class="py-4 font-black">{{ customer.code }}</td><td class="py-4 font-bold">{{ customer.name }}</td><td class="py-4 text-ink/50">{{ customer.contactEmail || '—' }}</td><td class="py-4"><span class="rounded-full bg-mint px-3 py-1 text-xs font-bold text-leaf">{{ customer.status }}</span></td></tr></tbody></table><p v-if="!customers.length && !loading" class="py-10 text-center text-sm text-ink/45">No customers have been created.</p></div>
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-2">
        <article id="applications" class="rounded-[1.7rem] border border-ink/8 bg-white p-7 sm:p-8"><p class="text-xs font-black uppercase tracking-[.16em] text-leaf">GHCR catalogue</p><h2 class="mt-2 text-2xl font-black">Applications</h2><div class="mt-6 space-y-3"><div v-for="application in applications" :key="application.id" class="rounded-2xl border border-ink/8 p-5"><div class="flex justify-between gap-4"><div><p class="font-black">{{ application.name }}</p><p class="mt-1 text-sm text-ink/45">ghcr.io/{{ application.ghcrOwner }}/{{ application.apiPackage || application.webPackage }}</p></div><span class="text-xs font-bold text-leaf">{{ application.status }}</span></div></div><p v-if="!applications.length && !loading" class="py-10 text-center text-sm text-ink/45">Application catalogue is empty.</p></div></article>
        <article id="environments" class="rounded-[1.7rem] bg-ink p-7 text-white sm:p-8"><p class="text-xs font-black uppercase tracking-[.16em] text-emerald-300">Deployment inventory</p><h2 class="mt-2 text-2xl font-black">Environments</h2><div class="mt-6 space-y-3"><div v-for="environment in environments" :key="environment.id" class="rounded-2xl bg-white/6 p-5"><div class="flex justify-between gap-4"><div><p class="font-black">{{ environment.name }}</p><p class="mt-1 text-sm text-white/45">{{ environment.hostname }} · {{ environment.deploymentMode.replaceAll('_', ' ') }}</p></div><span class="text-xs font-bold text-emerald-300">{{ environment.status }}</span></div></div><p v-if="!environments.length && !loading" class="py-10 text-center text-sm text-white/40">No environments are managed yet.</p></div></article>
      </section>
    </main>
  </div>
</template>
