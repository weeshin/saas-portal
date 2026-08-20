import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { apiRequest } from '../lib/api';

export interface PortalUser { id: string; name: string; email: string }
interface AuthResponse { accessToken: string; user: PortalUser }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PortalUser | null>(null);
  const initialized = ref(false);
  const isAuthenticated = computed(() => user.value !== null);

  function establishSession(response: AuthResponse): void {
    sessionStorage.setItem('portal_access_token', response.accessToken);
    user.value = response.user;
    initialized.value = true;
  }

  async function login(email: string, password: string): Promise<void> {
    establishSession(await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }));
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST', body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async function restore(): Promise<void> {
    if (initialized.value) return;
    if (!sessionStorage.getItem('portal_access_token')) { initialized.value = true; return; }
    try { user.value = await apiRequest<PortalUser>('/auth/me'); }
    catch { sessionStorage.removeItem('portal_access_token'); user.value = null; }
    finally { initialized.value = true; }
  }

  function logout(): void {
    sessionStorage.removeItem('portal_access_token');
    user.value = null;
    initialized.value = true;
  }

  return { user, initialized, isAuthenticated, establishSession, login, changePassword, restore, logout };
});
