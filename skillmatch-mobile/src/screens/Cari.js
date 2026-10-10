// F4 / US-04 — pencarian & filter kandidat; US-07, US-11 — profil kandidat dengan bukti portofolio
import { useState } from 'react';
import { Alert, FlatList, Text, TextInput, View } from 'react-native';
import { Chip, Galat, Halaman, Kartu, SkillChips, Status, Tombol } from '../components';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { labelPeran, tanggalLokal } from '../helpers';
import { s } from '../theme';

const FILTER_PERAN = [['', 'Semua'], ['developer', 'Developer'], ['desainer', 'Desainer']];
const KOSONG = { q: '', peran: '', tersedia: false, verified: false, skill: [] };

export function CariScreen({ navigation }) {
  const [draft, setDraft] = useState(KOSONG);
  const [kriteria, setKriteria] = useState(KOSONG);
  const [filterBuka, setFilterBuka] = useState(false);
  const skills = useData('skills', () => api.skills());
  const hasil = useData(`cari:${JSON.stringify(kriteria)}`, () => api.cari(kriteria));
  const ubah = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const togelSkill = (nama) => setDraft((d) => ({
    ...d, skill: d.skill.includes(nama) ? d.skill.filter((x) => x !== nama) : [...d.skill, nama],
  }));

  return (
    <View style={s.halaman}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <TextInput style={s.input} value={draft.q} onChangeText={(v) => ubah('q', v)} placeholder="Cari nama atau bio"
          accessibilityLabel="Cari nama atau bio" returnKeyType="search" onSubmitEditing={() => setKriteria(draft)} />
        <View style={[s.pemisah, { marginTop: 8 }]}>
          <Tombol title={filterBuka ? 'Sembunyikan filter' : 'Filter skill & peran'} variant="garis" onPress={() => setFilterBuka((b) => !b)} />
          <Tombol title="Cari" onPress={() => setKriteria(draft)} />
        </View>
        {filterBuka && (
          <View>
            <Text style={s.label}>Peran</Text>
            <View style={s.baris}>
              {FILTER_PERAN.map(([id, label]) => (
                <Chip key={id || 'semua'} teks={label} aktif={draft.peran === id} onPress={() => ubah('peran', id)} />
              ))}
            </View>
            <Text style={s.label}>Ketersediaan & bukti</Text>
            <View style={s.baris}>
              <Chip teks="Hanya yang tersedia" aktif={draft.tersedia} onPress={() => ubah('tersedia', !draft.tersedia)} />
              <Chip teks="Skill terverifikasi ✓" aktif={draft.verified} onPress={() => ubah('verified', !draft.verified)} />
            </View>
            <Text style={s.label}>Skill dicari</Text>
            <View style={s.baris}>
              {(skills.data || []).map((k) => (
                <Chip key={k.id} teks={k.nama} aktif={draft.skill.includes(k.nama)} onPress={() => togelSkill(k.nama)} />
              ))}
            </View>
          </View>
        )}
      </View>
      <Status loading={hasil.loading} error={hasil.error} stale={hasil.stale} adaData={!!hasil.data} onRetry={hasil.reload} />
      <FlatList data={hasil.data || []} keyExtractor={(k) => String(k.id_users)} contentContainerStyle={s.isi}
        refreshing={hasil.loading && !!hasil.data} onRefresh={hasil.reload}
        ListEmptyComponent={!hasil.loading && !hasil.error ? <Text style={s.redup}>Belum ada kandidat yang cocok.</Text> : null}
        renderItem={({ item }) => (
          <Kartu onPress={() => navigation.navigate('KandidatDetail', { id: item.id_users, nama: item.nama })}>
            <View style={s.pemisah}>
              <Text style={s.kartuJudul}>{item.nama}</Text>
              <Text style={s.redup}>{labelPeran(item.peran_utama)}{item.ketersediaan ? ' • Tersedia' : ' • Tidak tersedia'}</Text>
            </View>
            {!!item.bio && <Text numberOfLines={2} style={s.redup}>{item.bio}</Text>}
            <SkillChips skills={item.skills} maks={6} />
            {!!item.github_username && <Text style={s.redup}>GitHub @{item.github_username}: {item.jumlah_repo ?? 0} repo • {item.jumlah_commit ?? 0} commit</Text>}
            {!!item.figma_username && <Text style={s.redup}>Figma: {item.jumlah_proyek_figma ?? 0} proyek terverifikasi</Text>}
          </Kartu>
        )} />
    </View>
  );
}

export function KandidatDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const d = useData(`kandidat:${id}`, () => api.kandidat(id));
  const p = d.data;

  return (
    <Halaman onRefresh={d.reload} refreshing={d.loading && !!p}>
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!p} onRetry={d.reload} />
      {p && (
        <>
          <Text style={s.judul}>{p.nama}</Text>
          <Text style={s.redup}>{labelPeran(p.peran_utama)} • {p.ketersediaan ? 'Tersedia untuk tim' : 'Sedang tidak tersedia'}</Text>
          {!!p.bio && <Text style={[s.teks, { marginTop: 8 }]}>{p.bio}</Text>}

          <Text style={s.sub}>Skill</Text>
          <SkillChips skills={p.skills} />
          <Text style={[s.redup, { marginTop: 6 }]}>✓ = didukung bukti GitHub/Figma, bukan sekadar pengakuan.</Text>

          <Text style={s.sub}>Bukti portofolio</Text>
          <Kartu>
            <Text style={s.kartuJudul}>GitHub</Text>
            {p.github ? (
              <>
                <Text style={s.teks}>@{p.github.username}</Text>
                <Text style={s.teks}>{p.github.jumlah_repo} repositori • {p.github.jumlah_commit} commit</Text>
                <Text style={s.redup}>Bahasa: {(p.github.top_languages || []).join(', ') || '-'}</Text>
                <Text style={s.redup}>Diperbarui: {tanggalLokal(p.github.diperbarui_pada)}</Text>
              </>
            ) : <Text style={s.redup}>Belum terhubung.</Text>}
          </Kartu>
          <Kartu>
            <Text style={s.kartuJudul}>Figma</Text>
            {p.figma ? (
              <>
                <Text style={s.teks}>@{p.figma.username_figma} • {p.figma.jumlah_proyek} file</Text>
                {(p.figma.files || []).map((f) => <Text key={f.key} style={s.redup}>• {f.name}</Text>)}
              </>
            ) : <Text style={s.redup}>Belum terhubung.</Text>}
          </Kartu>

          <Tombol title="Undang ke tim" onPress={() => navigation.navigate('Undang', { id, nama: p.nama })} />
        </>
      )}
    </Halaman>
  );
}

// US-05 — pilih tim (sebagai ketua) lalu kirim undangan
export function UndangScreen({ route, navigation }) {
  const { id, nama } = route.params;
  const tim = useData('tim', () => api.timSaya());
  const [idTim, setIdTim] = useState(null);
  const [peran, setPeran] = useState('Anggota');
  const { busy, error, setError, jalankan } = useAksi();
  const milikku = (tim.data || []).filter((t) => t.peran_saya === 'Ketua');

  async function kirim() {
    if (!idTim) { setError('Pilih tim terlebih dahulu'); return; }
    if (!peran.trim()) { setError('Peran yang ditawarkan wajib diisi'); return; }
    const hasil = await jalankan(() => api.undang(idTim, { id_users: id, peran_ditawarkan: peran.trim() }));
    if (hasil) {
      Alert.alert('Undangan terkirim', `${nama} akan menerima notifikasi.`);
      navigation.goBack();
    }
  }

  return (
    <Halaman>
      <Text style={s.judul}>Undang {nama}</Text>
      <Status loading={tim.loading} error={tim.error} stale={tim.stale} adaData={!!tim.data} onRetry={tim.reload} />
      {tim.data && milikku.length === 0 && (
        <>
          <Text style={s.teks}>Anda belum menjadi ketua tim mana pun.</Text>
          <Tombol title="Buat tim dulu" onPress={() => navigation.navigate('TimForm')} />
        </>
      )}
      {milikku.length > 0 && (
        <>
          <Text style={s.label}>Pilih tim</Text>
          {milikku.map((t) => (
            <Kartu key={t.id_tim} onPress={() => setIdTim(t.id_tim)}>
              <Text style={s.kartuJudul}>{idTim === t.id_tim ? '(x) ' : '( ) '}{t.nama_tim}</Text>
            </Kartu>
          ))}
          <Text style={s.label}>Peran yang ditawarkan</Text>
          <TextInput style={s.input} value={peran} onChangeText={setPeran} maxLength={50} editable={!busy}
            placeholder="Contoh: UI Designer" accessibilityLabel="Peran yang ditawarkan" />
          <Galat pesan={error} />
          <Tombol title={busy ? 'Mengirim...' : 'Kirim undangan'} onPress={kirim} disabled={busy} />
        </>
      )}
    </Halaman>
  );
}
