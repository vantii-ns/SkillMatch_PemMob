// US-06 — undangan masuk (terima/tolak), US-10 — notifikasi
import { Alert, FlatList, Text, View } from 'react-native';
import { Chip, Galat, Kartu, Status, Tombol } from '../components';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { tanggalLokal, waktuSingkat } from '../helpers';
import { s } from '../theme';

export function UndanganScreen() {
  const d = useData('undangan', () => api.undanganMasuk());
  const { busy, error, jalankan } = useAksi();

  const respons = (u, status) => jalankan(async () => { await api.responUndangan(u.id_undangan, status); await d.reload(); });
  const tolak = (u) => Alert.alert('Tolak undangan', `Tolak undangan ke tim "${u.nama_tim}"?`,
    [{ text: 'Batal', style: 'cancel' }, { text: 'Tolak', style: 'destructive', onPress: () => respons(u, 'ditolak') }]);

  return (
    <View style={s.halaman}>
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!d.data} onRetry={d.reload} />
      <View style={{ paddingHorizontal: 16 }}><Galat pesan={error} /></View>
      <FlatList data={d.data || []} keyExtractor={(u) => String(u.id_undangan)} contentContainerStyle={s.isi}
        refreshing={d.loading && !!d.data} onRefresh={d.reload}
        ListEmptyComponent={!d.loading && !d.error ? <Text style={s.redup}>Belum ada undangan.</Text> : null}
        renderItem={({ item: u }) => (
          <Kartu>
            <View style={s.pemisah}>
              <Text style={s.kartuJudul}>{u.nama_tim}</Text>
              <Chip teks={u.status} ok={u.status === 'diterima'} />
            </View>
            <Text style={s.teks}>Dari {u.nama_pengirim} sebagai {u.peran_ditawarkan}</Text>
            {!!u.deskripsi && <Text style={s.redup}>{u.deskripsi}</Text>}
            <Text style={s.redup}>Dikirim {tanggalLokal(u.tanggal_undangan)}</Text>
            {u.status === 'menunggu' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={s.flex}><Tombol title="Terima" onPress={() => respons(u, 'diterima')} disabled={busy} /></View>
                <View style={s.flex}><Tombol title="Tolak" variant="bahaya" onPress={() => tolak(u)} disabled={busy} /></View>
              </View>
            )}
          </Kartu>
        )} />
    </View>
  );
}

export function NotifikasiScreen() {
  const d = useData('notifikasi', () => api.notifikasi());
  const { busy, error, jalankan } = useAksi();
  const belum = (d.data || []).filter((n) => !n.status_dibaca).length;

  return (
    <View style={s.halaman}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {belum > 0 && (
          <Tombol title={`Tandai semua dibaca (${belum})`} variant="garis" disabled={busy}
            onPress={() => jalankan(async () => { await api.bacaSemua(); await d.reload(); })} />
        )}
        <Galat pesan={error} />
      </View>
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!d.data} onRetry={d.reload} />
      <FlatList data={d.data || []} keyExtractor={(n) => String(n.id_notifikasi)} contentContainerStyle={s.isi}
        refreshing={d.loading && !!d.data} onRefresh={d.reload}
        ListEmptyComponent={!d.loading && !d.error ? <Text style={s.redup}>Belum ada notifikasi.</Text> : null}
        renderItem={({ item: n }) => (
          <Kartu onPress={() => !n.status_dibaca && jalankan(async () => { await api.bacaNotifikasi(n.id_notifikasi); await d.reload(); })}>
            <Text style={[s.teks, !n.status_dibaca && { fontWeight: '700' }]}>{!n.status_dibaca ? '● ' : ''}{n.isi}</Text>
            <Text style={s.redup}>{waktuSingkat(n.waktu)}</Text>
          </Kartu>
        )} />
    </View>
  );
}
