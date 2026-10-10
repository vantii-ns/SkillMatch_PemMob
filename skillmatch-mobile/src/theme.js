import { StyleSheet } from 'react-native';

export const c = {
  primer: '#0F766E', bg: '#F8FAFC', teks: '#0F172A', redup: '#475569', garis: '#CBD5E1',
  putih: '#FFFFFF', bahaya: '#B91C1C', pilih: '#CCFBF1', ok: '#15803D', okBg: '#DCFCE7', peringatan: '#FEF3C7',
};

export const s = StyleSheet.create({
  flex: { flex: 1 },
  halaman: { flex: 1, backgroundColor: c.bg },
  isi: { padding: 16, paddingBottom: 32 },
  judul: { fontSize: 22, fontWeight: '700', color: c.teks, marginBottom: 12 },
  sub: { fontSize: 16, fontWeight: '600', color: c.teks, marginTop: 16, marginBottom: 8 },
  teks: { fontSize: 15, color: c.teks },
  redup: { fontSize: 14, color: c.redup },
  label: { fontSize: 15, marginTop: 14, marginBottom: 6, color: c.teks },
  input: { borderWidth: 1, borderColor: '#64748B', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: c.putih, color: c.teks },
  tombol: { backgroundColor: c.primer, padding: 12, minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  tombolGaris: { backgroundColor: c.putih, borderWidth: 1, borderColor: c.primer },
  tombolBahaya: { backgroundColor: c.bahaya },
  tombolTeks: { color: c.putih, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  kartu: { padding: 14, backgroundColor: c.putih, borderRadius: 8, borderWidth: 1, borderColor: c.garis, marginVertical: 6, gap: 6 },
  kartuJudul: { fontSize: 17, fontWeight: '600', color: c.teks },
  baris: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: c.garis, backgroundColor: c.putih },
  chipAktif: { backgroundColor: c.pilih, borderColor: c.primer },
  chipOk: { backgroundColor: c.okBg, borderColor: c.ok },
  chipTeks: { fontSize: 13, color: c.teks },
  error: { color: c.bahaya, marginVertical: 8, fontSize: 15 },
  banner: { padding: 10, borderRadius: 8, backgroundColor: c.peringatan, marginBottom: 8 },
  pusat: { padding: 24, alignItems: 'center', gap: 8 },
  pemisah: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
