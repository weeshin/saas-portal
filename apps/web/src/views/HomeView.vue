<template>
  <main class="min-h-screen overflow-hidden bg-cream">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
      <RouterLink to="/" class="text-lg font-black tracking-tight">AnnoVis<span class="text-leaf">/</span></RouterLink>
      <div class="flex items-center gap-3"><RouterLink to="/login" class="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold shadow-sm transition hover:-translate-y-0.5">Staff sign in</RouterLink></div>
    </nav>
    <section class="relative mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
      <div>
        <p class="mb-5 text-xs font-black uppercase tracking-[.24em] text-leaf">Your application. Ready in minutes.</p>
        <h1 class="max-w-3xl text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-7xl">A simpler way to run your business software.</h1>
        <p class="mt-7 max-w-xl text-lg leading-8 text-ink/65">Choose your region, claim your workspace, and let us handle deployment, security, backups, and operations.</p>
        <div class="mt-9 flex flex-wrap items-center gap-4">
          <RouterLink to="/login" class="rounded-full bg-ink px-7 py-4 text-sm font-bold text-white shadow-xl shadow-ink/15 transition hover:-translate-y-1">Open backoffice →</RouterLink>
          <span class="text-sm font-semibold text-ink/50">30-day free trial · No card required</span>
        </div>
      </div>
      <div class="relative">
        <div class="absolute -inset-16 rounded-full bg-mint/70 blur-3xl"></div>
        <div class="relative rotate-2 rounded-[2rem] border border-ink/10 bg-white p-5 shadow-2xl shadow-ink/10">
          <div class="rounded-[1.4rem] bg-ink p-7 text-white">
            <div class="flex items-center justify-between"><span class="text-sm font-bold">ABC Music</span><span class="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">● Healthy</span></div>
            <div class="mt-16 text-xs uppercase tracking-widest text-white/40">Production environment</div>
            <div class="mt-2 text-2xl font-bold">abc-music.inventory.com</div>
            <div class="mt-8 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl bg-white/7 p-4"><div class="text-white/45">Region</div><div class="mt-1 font-bold">Singapore</div></div>
              <div class="rounded-2xl bg-white/7 p-4"><div class="text-white/45">Last backup</div><div class="mt-1 font-bold">Today, 03:00</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
