import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { getCache, setCache } from './cache';

// Mengambil data dari API + cache lokal.
//  - tampil cache lebih dulu, lalu perbarui dari server
//  - bila server gagal dan ada cache -> data lama tetap tampil (stale = true)
//  - dimuat ulang otomatis saat layar kembali fokus atau aplikasi kembali aktif (koneksi pulih)
export function useData(key, fetcher) {
  const { user } = useAuth();
  const uid = user?.id_users;
  const [store, setStore] = useState({ key: null, value: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  const fetcherRef = useRef(fetcher); fetcherRef.current = fetcher;
  const storeKey = useRef(null); storeKey.current = store.key;
  const reqId = useRef(0);
  const fokus = useIsFocused();

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true); setError('');
    try {
      const d = await fetcherRef.current();
      if (id !== reqId.current) return;
      setStore({ key, value: d }); setStale(false);
      setCache(uid, key, d);
    } catch (e) {
      if (id !== reqId.current) return;
      setError(e.message);
      const c = await getCache(uid, key);
      if (c !== null) { setStore({ key, value: c }); setStale(true); }
    } finally { if (id === reqId.current) setLoading(false); }
  }, [key, uid]);

  useFocusEffect(useCallback(() => {
    (async () => {
      if (storeKey.current !== key) {
        const c = await getCache(uid, key);
        if (c !== null) { setStore({ key, value: c }); setStale(true); }
      }
    })();
    load();
  }, [key, uid, load]));

  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active' && fokus) load(); });
    return () => sub.remove();
  }, [load, fokus]);

  return { data: store.key === key ? store.value : null, loading, error, stale, reload: load };
}

// Menjalankan aksi tulis: mencegah ketukan ganda (ref lock) dan menyimpan pesan error
export function useAksi() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const jalankan = useCallback(async (fn) => {
    if (lock.current) return undefined;
    lock.current = true; setBusy(true); setError('');
    try { return await fn(); }
    catch (e) { setError(e.message); return undefined; }
    finally { lock.current = false; setBusy(false); }
  }, []);
  return { busy, error, setError, jalankan };
}
