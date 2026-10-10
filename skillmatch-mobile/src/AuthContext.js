// Status login (Context API + useState) — token & profil disimpan agar sesi bertahan setelah aplikasi ditutup
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken, setSaatTidakSah } from './api';
import { hapusSemuaCache } from './cache';

const KUNCI = 'skillmatch:sesi';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const simpanSesi = useCallback(async (t, u) => {
    setToken(t); setTokenState(t); setUser(u);
    await AsyncStorage.setItem(KUNCI, JSON.stringify({ token: t, user: u }));
  }, []);

  const logout = useCallback(async () => {
    setToken(null); setTokenState(null); setUser(null);
    await AsyncStorage.removeItem(KUNCI);
    await hapusSemuaCache();
  }, []);

  useEffect(() => { setSaatTidakSah(() => { logout(); }); }, [logout]);

  // Pulihkan sesi saat aplikasi dibuka; jika offline tetap pakai profil tersimpan
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KUNCI);
        if (raw) {
          const sesi = JSON.parse(raw);
          setToken(sesi.token); setTokenState(sesi.token); setUser(sesi.user);
          try { const baru = await api.me(); await simpanSesi(sesi.token, baru); } catch { /* offline: pakai data tersimpan */ }
        }
      } finally { setBooting(false); }
    })();
  }, [simpanSesi]);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    await simpanSesi(res.token, res.user);
  }, [simpanSesi]);

  const register = useCallback(async (body) => {
    const res = await api.register(body);
    setToken(res.token);
    const profil = await api.me();
    await simpanSesi(res.token, profil);
  }, [simpanSesi]);

  const segarkanUser = useCallback(async () => {
    const baru = await api.me();
    await simpanSesi(token, baru);
    return baru;
  }, [simpanSesi, token]);

  const nilai = useMemo(() => ({ token, user, booting, login, register, logout, segarkanUser }),
    [token, user, booting, login, register, logout, segarkanUser]);
  return <AuthContext.Provider value={nilai}>{children}</AuthContext.Provider>;
}
