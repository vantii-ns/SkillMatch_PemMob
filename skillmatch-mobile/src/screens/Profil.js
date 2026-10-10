// F1, F2, F3 — profil, tag skill, hubungkan GitHub & Figma
import { useState } from 'react';
import { Alert, Switch, Text, TextInput, View } from 'react-native';
import { Chip, Galat, Halaman, Kartu, SkillChips, Status, Tombol } from '../components';
import { PeranPilihan } from './Auth';
import { useAuth } from '../AuthContext';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { labelPeran, tanggalLokal } from '../helpers';
import { s } from '../theme';

export function ProfilScreen({ navigation }) {
  const { logout } = useAuth();
  const d = useData('saya', () => api.me());
  const p = d.data;
  const keluar = () => Alert.alert('Keluar', 'Keluar dari akun ini?',
    [{ text: 'Batal', style: 'cancel' }, { text: 'Keluar', style: 'destructive', onPress: () => logout() }]);

  return (
    <Halaman onRefresh={d.reload} refreshing={d.loading && !!p}>
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!p} onRetry={d.reload} />
      {p && (
        <>
          <Text style={s.judul}>{p.nama}</Text>
          <Text style={s.redup}>{p.email}</Text>
          <Text style={s.redup}>{labelPeran(p.peran_utama)} • {p.ketersediaan ? 'Tersedia untuk tim' : 'Tidak tersedia'}</Text>
          {!!p.bio && <Text style={[s.teks, { marginTop: 8 }]}>{p.bio}</Text>}

          <Text style={s.sub}>Skill saya</Text>
          <SkillChips skills={p.skills} />
          <Text style={[s.redup, { marginTop: 6 }]}>Skill bertanda ✓ terverifikasi otomatis dari GitHub/Figma.</Text>

          <Text style={s.sub}>Portofolio</Text>
          <Kartu>
            <Text style={s.teks}>GitHub: {p.github ? `@${p.github.username} (${p.github.jumlah_repo} repo, ${p.github.jumlah_commit} commit)` : 'belum terhubung'}</Text>
            <Text style={s.teks}>Figma: {p.figma ? `@${p.figma.username_figma} (${p.figma.jumlah_proyek} file)` : 'belum terhubung'}</Text>
          </Kartu>

          <Tombol title="Ubah profil" onPress={() => navigation.navigate('EditProfil', { profil: p })} />
          <Tombol title="Pilih skill" variant="garis" onPress={() => navigation.navigate('PilihSkill', { profil: p })} />
          <Tombol title="Hubungkan GitHub / Figma" variant="garis" onPress={() => navigation.navigate('Portofolio')} />
        </>
      )}
      <Tombol title="Keluar" variant="bahaya" onPress={keluar} />
    </Halaman>
  );
}

export function EditProfilScreen({ route, navigation }) {
  const { profil } = route.params;
  const { segarkanUser } = useAuth();
  const [nama, setNama] = useState(profil.nama);
  const [bio, setBio] = useState(profil.bio || '');
  const [peran, setPeran] = useState(profil.peran_utama);
  const [tersedia, setTersedia] = useState(!!profil.ketersediaan);
  const { busy, error, setError, jalankan } = useAksi();

  async function simpan() {
    if (!nama.trim()) { setError('Nama wajib diisi'); return; }
    const ok = await jalankan(async () => {
      await api.ubahProfil({ nama: nama.trim(), bio: bio.trim(), peran_utama: peran, ketersediaan: tersedia });
      await segarkanUser().catch(() => {});
      return true;
    });
    if (ok) navigation.goBack();
  }

  return (
    <Halaman>
      <Text style={s.label}>Nama</Text>
      <TextInput style={s.input} value={nama} onChangeText={setNama} maxLength={100} editable={!busy} accessibilityLabel="Nama" />
      <Text style={s.label}>Bio singkat</Text>
      <TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio}
        multiline maxLength={500} editable={!busy} accessibilityLabel="Bio" placeholder="Pengalaman, minat lomba, dsb." />
      <Text style={s.label}>Peran utama</Text>
      <PeranPilihan nilai={peran} onPilih={setPeran} disabled={busy} />
      <View style={[s.pemisah, { marginTop: 16 }]}>
        <Text style={s.teks}>Tersedia untuk bergabung tim</Text>
        <Switch value={tersedia} onValueChange={setTersedia} disabled={busy} accessibilityLabel="Tersedia untuk bergabung tim" />
      </View>
      <Galat pesan={error} />
      <Tombol title={busy ? 'Menyimpan...' : 'Simpan'} onPress={simpan} disabled={busy} />
    </Halaman>
  );
}

const KATEGORI = [['pemrograman', 'Pemrograman'], ['desain', 'Desain'], ['lainnya', 'Lainnya']];

export function PilihSkillScreen({ route, navigation }) {
  const { profil } = route.params;
  const skills = useData('skills', () => api.skills());
  const [dipilih, setDipilih] = useState((profil.skills || []).map((k) => k.id));
  const { busy, error, jalankan } = useAksi();
  const togel = (id) => setDipilih((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  async function simpan() {
    const ok = await jalankan(async () => { await api.setSkills(dipilih); return true; });
    if (ok) navigation.goBack();
  }

  return (
    <Halaman>
      <Status loading={skills.loading} error={skills.error} stale={skills.stale} adaData={!!skills.data} onRetry={skills.reload} />
      {skills.data && KATEGORI.map(([kat, label]) => (
        <View key={kat}>
          <Text style={s.sub}>{label}</Text>
          <View style={s.baris}>
            {skills.data.filter((k) => k.kategori === kat).map((k) => (
              <Chip key={k.id} teks={k.nama} aktif={dipilih.includes(k.id)} onPress={() => togel(k.id)} disabled={busy} />
            ))}
          </View>
        </View>
      ))}
      <Text style={[s.redup, { marginTop: 12 }]}>Hubungkan GitHub/Figma agar skill Anda otomatis bertanda terverifikasi ✓.</Text>
      <Galat pesan={error} />
      <Tombol title={busy ? 'Menyimpan...' : `Simpan (${dipilih.length} skill)`} onPress={simpan} disabled={busy || !skills.data} />
    </Halaman>
  );
}

// M2 — verifikasi portofolio otomatis
export function PortofolioScreen() {
  const d = useData('portofolio', () => api.portofolio());
  const [username, setUsername] = useState('');
  const [kode, setKode] = useState(null);
  const [tokenFigma, setTokenFigma] = useState('');
  const [fileKeys, setFileKeys] = useState('');
  const { busy, error, setError, jalankan } = useAksi();
  const p = d.data;

  const aksi = (fn, sukses) => jalankan(async () => { await fn(); if (sukses) Alert.alert('Berhasil', sukses); await d.reload(); });
  const konfirmasi = (judul, fn) => Alert.alert(judul, 'Skill terverifikasi dari akun ini akan dihitung ulang.',
    [{ text: 'Batal', style: 'cancel' }, { text: 'Putuskan', style: 'destructive', onPress: () => aksi(fn) }]);

  return (
    <Halaman onRefresh={d.reload} refreshing={d.loading && !!p}>
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!p} onRetry={d.reload} />
      <Galat pesan={error} />
      {p && (
        <>
          <Text style={s.sub}>GitHub (untuk developer)</Text>
          {p.github ? (
            <Kartu>
              <Text style={s.kartuJudul}>@{p.github.username}</Text>
              <Text style={s.teks}>{p.github.jumlah_repo} repositori • {p.github.jumlah_commit} commit</Text>
              <Text style={s.redup}>Bahasa: {(p.github.top_languages || []).join(', ') || '-'}</Text>
              <Text style={s.redup}>Diperbarui {tanggalLokal(p.github.diperbarui_pada)}</Text>
              <Tombol title="Sinkronkan ulang" disabled={busy} onPress={() => aksi(() => api.githubSinkron(), 'Data GitHub diperbarui.')} />
              <Tombol title="Putuskan" variant="bahaya" disabled={busy} onPress={() => konfirmasi('Putuskan GitHub', () => api.githubPutus())} />
            </Kartu>
          ) : (
            <Kartu>
              <Text style={s.teks}>Tempel kode verifikasi di Bio GitHub Anda agar terbukti akun milik Anda, lalu hubungkan.</Text>
              <Tombol title="Tampilkan kode verifikasi" variant="garis" disabled={busy}
                onPress={() => jalankan(async () => setKode(await api.githubChallenge()))} />
              {kode && <Text selectable style={[s.kartuJudul, { color: '#0F766E' }]}>{kode.wajib ? kode.kode : 'Kode tidak diperlukan (mode pengembangan)'}</Text>}
              <Text style={s.label}>Username GitHub</Text>
              <TextInput style={s.input} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false}
                editable={!busy} placeholder="contoh: octocat" accessibilityLabel="Username GitHub" />
              <Tombol title={busy ? 'Memproses...' : 'Hubungkan GitHub'} disabled={busy}
                onPress={() => {
                  if (!username.trim()) { setError('Username GitHub wajib diisi'); return; }
                  aksi(() => api.githubHubungkan(username.trim()), 'GitHub terhubung.');
                }} />
            </Kartu>
          )}

          <Text style={s.sub}>Figma (untuk desainer)</Text>
          {p.figma ? (
            <Kartu>
              <Text style={s.kartuJudul}>@{p.figma.username_figma}</Text>
              <Text style={s.teks}>{p.figma.jumlah_proyek} file terverifikasi</Text>
              {(p.figma.files || []).map((f) => <Text key={f.key} style={s.redup}>• {f.name}</Text>)}
              <Tombol title="Putuskan" variant="bahaya" disabled={busy} onPress={() => konfirmasi('Putuskan Figma', () => api.figmaPutus())} />
            </Kartu>
          ) : (
            <Kartu>
              <Text style={s.teks}>Buat Personal Access Token di pengaturan akun Figma. Token hanya dipakai sekali dan tidak disimpan.</Text>
              <Text style={s.label}>Personal Access Token</Text>
              <TextInput style={s.input} value={tokenFigma} onChangeText={setTokenFigma} secureTextEntry autoCapitalize="none"
                editable={!busy} accessibilityLabel="Token Figma" />
              <Text style={s.label}>Kunci file portofolio (pisahkan koma)</Text>
              <TextInput style={s.input} value={fileKeys} onChangeText={setFileKeys} autoCapitalize="none" autoCorrect={false}
                editable={!busy} placeholder="bagian URL figma.com/design/<KUNCI>/..." accessibilityLabel="Kunci file Figma" />
              <Tombol title={busy ? 'Memproses...' : 'Hubungkan Figma'} disabled={busy}
                onPress={() => {
                  if (!tokenFigma.trim()) { setError('Token Figma wajib diisi'); return; }
                  const keys = fileKeys.split(',').map((k) => k.trim()).filter(Boolean);
                  aksi(async () => { await api.figmaHubungkan(tokenFigma.trim(), keys); setTokenFigma(''); }, 'Figma terhubung.');
                }} />
            </Kartu>
          )}
        </>
      )}
    </Halaman>
  );
}
