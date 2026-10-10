// Cache lokal (AsyncStorage) untuk kebutuhan offline: profil kandidat, tim, undangan, dst.
import AsyncStorage from '@react-native-async-storage/async-storage';

const AWAL = 'skillmatch:cache:';
const kunci = (uid, key) => `${AWAL}${uid}:${key}`;

export async function getCache(uid, key) {
  try {
    const raw = await AsyncStorage.getItem(kunci(uid, key));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export async function setCache(uid, key, value) {
  try { await AsyncStorage.setItem(kunci(uid, key), JSON.stringify(value)); } catch { /* abaikan */ }
}
export async function hapusSemuaCache() {
  try {
    const semua = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(semua.filter((k) => k.startsWith(AWAL)));
  } catch { /* abaikan */ }
}
