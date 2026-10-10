// M3 — tim, anggota, ruang diskusi (US-05, US-09)
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Text, TextInput, View } from 'react-native';
import { Chip, Galat, Halaman, Kartu, Status, Tombol } from '../components';
import { useAuth } from '../AuthContext';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { labelPeran, validasiTim, waktuSingkat } from '../helpers';
import { c, s } from '../theme';

export function TimListScreen({ navigation }) {
  const d = useData('tim', () => api.timSaya());
  return (
    <View style={s.halaman}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Tombol title="Buat tim baru" onPress={() => navigation.navigate('TimForm')} />
      </View>
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!d.data} onRetry={d.reload} />
      <FlatList data={d.data || []} keyExtractor={(t) => String(t.id_tim)} contentContainerStyle={s.isi}
        refreshing={d.loading && !!d.data} onRefresh={d.reload}
        ListEmptyComponent={!d.loading && !d.error ? <Text style={s.redup}>Anda belum tergabung di tim mana pun.</Text> : null}
        renderItem={({ item }) => (
          <Kartu onPress={() => navigation.navigate('TimDetail', { id: item.id_tim, nama: item.nama_tim })}>
            <Text style={s.kartuJudul}>{item.nama_tim}</Text>
            <Text style={s.redup}>Peran Anda: {item.peran_saya} • {item.jumlah_anggota} anggota</Text>
            {item.kebutuhan_skill.length > 0 && (
              <View style={s.baris}>{item.kebutuhan_skill.map((k) => <Chip key={k} teks={`Butuh: ${k}`} />)}</View>
            )}
          </Kartu>
        )} />
    </View>
  );
}

export function TimFormScreen({ route, navigation }) {
  const tim = route.params?.tim; // ada = mode ubah
  const [nama, setNama] = useState(tim?.nama_tim || '');
  const [deskripsi, setDeskripsi] = useState(tim?.deskripsi || '');
  const [dipilih, setDipilih] = useState(tim?.kebutuhan_skill || []);
  const skills = useData('skills', () => api.skills());
  const { busy, error, setError, jalankan } = useAksi();
  const togel = (n) => setDipilih((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]));

  async function simpan() {
    const pesan = validasiTim(nama);
    if (pesan) { setError(pesan); return; }
    const body = { nama_tim: nama.trim(), deskripsi: deskripsi.trim(), kebutuhan_skill: dipilih };
    const ok = await jalankan(async () => {
      if (tim) await api.ubahTim(tim.id_tim, body); else await api.buatTim(body);
      return true;
    });
    if (ok) navigation.goBack();
  }

  return (
    <Halaman>
      <Text style={s.label}>Nama tim</Text>
      <TextInput style={s.input} value={nama} onChangeText={setNama} maxLength={100} editable={!busy}
        placeholder="Contoh: Tim Lomba Gemastik" accessibilityLabel="Nama tim" />
      <Text style={s.label}>Deskripsi</Text>
      <TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]} value={deskripsi} onChangeText={setDeskripsi}
        multiline maxLength={500} editable={!busy} placeholder="Tujuan tim / lomba" accessibilityLabel="Deskripsi" />
      <Text style={s.label}>Skill yang dibutuhkan</Text>
      <View style={s.baris}>
        {(skills.data || []).map((k) => <Chip key={k.id} teks={k.nama} aktif={dipilih.includes(k.nama)} onPress={() => togel(k.nama)} disabled={busy} />)}
      </View>
      <Text style={[s.redup, { marginTop: 6 }]}>Anda akan diberi notifikasi bila ada kandidat yang cocok.</Text>
      <Galat pesan={error} />
      <Tombol title={busy ? 'Menyimpan...' : 'Simpan'} onPress={simpan} disabled={busy} />
    </Halaman>
  );
}

export function TimDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const d = useData(`tim:${id}`, () => api.timDetail(id));
  const [edit, setEdit] = useState(null); // { id_users, peran }
  const { busy, error, jalankan } = useAksi();
  const t = d.data;
  const ketua = !!t && t.id_users === user.id_users;

  const aksi = (fn, selesai) => jalankan(async () => { await fn(); if (selesai) selesai(); else await d.reload(); });
  const konfirmasi = (judul, pesan, fn, selesai) =>
    Alert.alert(judul, pesan, [{ text: 'Batal', style: 'cancel' }, { text: 'Ya', style: 'destructive', onPress: () => aksi(fn, selesai) }]);

  return (
    <Halaman onRefresh={d.reload} refreshing={d.loading && !!t}>
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!t} onRetry={d.reload} />
      <Galat pesan={error} />
      {t && (
        <>
          <Text style={s.judul}>{t.nama_tim}</Text>
          {!!t.deskripsi && <Text style={s.teks}>{t.deskripsi}</Text>}
          {t.kebutuhan_skill.length > 0 && (
            <View style={[s.baris, { marginTop: 8 }]}>{t.kebutuhan_skill.map((k) => <Chip key={k} teks={`Butuh: ${k}`} />)}</View>
          )}
          <Tombol title="Buka ruang diskusi" onPress={() => navigation.navigate('Diskusi', { id, nama: t.nama_tim })} />

          <Text style={s.sub}>Anggota ({t.anggota.length})</Text>
          {t.anggota.map((a) => (
            <Kartu key={a.id_users}>
              <View style={s.pemisah}>
                <Text style={s.kartuJudul}>{a.nama}{a.id_users === user.id_users ? ' (Anda)' : ''}</Text>
                <Text style={s.redup}>{a.peran}</Text>
              </View>
              <Text style={s.redup}>{labelPeran(a.peran_utama)}</Text>
              {ketua && a.id_users !== user.id_users && (
                edit?.id_users === a.id_users ? (
                  <View>
                    <TextInput style={s.input} value={edit.peran} onChangeText={(v) => setEdit({ ...edit, peran: v })}
                      maxLength={50} accessibilityLabel="Peran anggota" />
                    <Tombol title="Simpan peran" disabled={busy || !edit.peran.trim()}
                      onPress={() => aksi(() => api.ubahPeran(id, a.id_users, edit.peran.trim()), () => { setEdit(null); d.reload(); })} />
                  </View>
                ) : (
                  <View style={s.baris}>
                    <Chip teks="Ubah peran" onPress={() => setEdit({ id_users: a.id_users, peran: a.peran })} disabled={busy} />
                    <Chip teks="Keluarkan" onPress={() => konfirmasi('Keluarkan anggota', `Keluarkan ${a.nama} dari tim?`, () => api.keluarkan(id, a.id_users))} disabled={busy} />
                  </View>
                )
              )}
            </Kartu>
          ))}

          {ketua && (
            <>
              <Text style={s.sub}>Undangan terkirim</Text>
              {(t.undangan || []).length === 0 && <Text style={s.redup}>Belum ada undangan. Cari kandidat di tab Cari.</Text>}
              {(t.undangan || []).map((u) => (
                <View key={u.id_undangan} style={s.pemisah}>
                  <Text style={s.teks}>{u.nama} • {u.peran_ditawarkan}</Text>
                  <Chip teks={u.status} ok={u.status === 'diterima'} />
                </View>
              ))}
              <Tombol title="Ubah tim" variant="garis" onPress={() => navigation.navigate('TimForm', { tim: t })} disabled={busy} />
              <Tombol title="Bubarkan tim" variant="bahaya" disabled={busy}
                onPress={() => konfirmasi('Bubarkan tim', `Hapus tim "${t.nama_tim}" beserta seluruh diskusinya?`, () => api.hapusTim(id), () => navigation.popToTop())} />
            </>
          )}
          {!ketua && (
            <Tombol title="Keluar dari tim" variant="bahaya" disabled={busy}
              onPress={() => konfirmasi('Keluar dari tim', `Keluar dari "${t.nama_tim}"?`, () => api.keluarkan(id, user.id_users), () => navigation.popToTop())} />
          )}
        </>
      )}
    </Halaman>
  );
}

// US-09 — ruang diskusi tim (polling tiap 4 detik, hanya pesan baru yang diambil)
export function DiskusiScreen({ route }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [pesan, setPesan] = useState([]);
  const [teks, setTeks] = useState('');
  const [galatTarik, setGalatTarik] = useState('');
  const { busy, error, setError, jalankan } = useAksi();
  const daftar = useRef(null);
  const terakhir = useRef(0);
  const tarikRef = useRef(null);

  useEffect(() => {
    let aktif = true; let jalan = false;
    async function tarik() {
      if (jalan) return;
      jalan = true;
      try {
        const baru = await api.diskusi(id, terakhir.current);
        if (!aktif) return;
        setGalatTarik('');
        if (baru.length) {
          terakhir.current = baru[baru.length - 1].id_diskusi;
          setPesan((p) => [...p, ...baru]);
        }
      } catch (e) { if (aktif) setGalatTarik(e.message); }
      finally { jalan = false; }
    }
    tarikRef.current = tarik;
    tarik();
    const timer = setInterval(tarik, 4000);
    return () => { aktif = false; clearInterval(timer); };
  }, [id]);

  async function kirim() {
    const isi = teks.trim();
    if (!isi) { setError('Pesan tidak boleh kosong'); return; }
    const ok = await jalankan(async () => { await api.kirimPesan(id, isi); return true; });
    if (ok) { setTeks(''); tarikRef.current?.(); }
  }

  return (
    <View style={s.halaman}>
      {!!galatTarik && <View style={s.banner}><Text style={s.teks}>Tidak dapat memperbarui pesan: {galatTarik}</Text></View>}
      <FlatList ref={daftar} data={pesan} keyExtractor={(m) => String(m.id_diskusi)} contentContainerStyle={s.isi}
        onContentSizeChange={() => daftar.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={s.redup}>Belum ada pesan. Mulai percakapan tim.</Text>}
        renderItem={({ item }) => {
          const saya = item.id_users === user.id_users;
          return (
            <View style={{ alignItems: saya ? 'flex-end' : 'flex-start', marginVertical: 4 }}>
              <View style={{ maxWidth: '85%', padding: 10, borderRadius: 10, backgroundColor: saya ? c.pilih : c.putih, borderWidth: 1, borderColor: c.garis }}>
                {!saya && <Text style={[s.redup, { fontWeight: '600' }]}>{item.nama}</Text>}
                <Text style={s.teks}>{item.isi_pesan}</Text>
                <Text style={[s.redup, { fontSize: 11, alignSelf: 'flex-end' }]}>{waktuSingkat(item.waktu_pesan)}</Text>
              </View>
            </View>
          );
        }} />
      <View style={{ padding: 12, borderTopWidth: 1, borderColor: c.garis, backgroundColor: c.putih }}>
        <Galat pesan={error} />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput style={[s.input, { flex: 1 }]} value={teks} onChangeText={setTeks} placeholder="Tulis pesan..."
            maxLength={2000} editable={!busy} accessibilityLabel="Tulis pesan" />
          <View style={{ width: 90 }}><Tombol title={busy ? '...' : 'Kirim'} onPress={kirim} disabled={busy} /></View>
        </View>
      </View>
    </View>
  );
}
