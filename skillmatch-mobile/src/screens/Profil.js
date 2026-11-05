// F1, F2, F3 — profil, tag skill, hubungkan GitHub & Figma (Figma Profil)
import { useState } from 'react';
import { Alert, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { AvatarInitials, Chip, Galat, Halaman, HeaderLayar, InfoBox, Kartu, SkillChips, Status, Tombol } from '../components';
import { PeranPilihan } from './Auth';
import { useAuth } from '../AuthContext';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { labelPeran, tanggalLokal } from '../helpers';
import { c, font, radius, s } from '../theme';
import { IconCheck, IconChevronRight, IconClock, IconEdit, IconLink, IconLogOut } from '../icons';

export function ProfilScreen({ navigation }) {
  const { logout } = useAuth();
  const d = useData('saya', () => api.me());
  const tim = useData('tim', () => api.timSaya());
  const p = d.data;

  const keluar = () =>
    Alert.alert('Keluar akun', 'Keluar dari akun SkillMatch kamu?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);

  const timList = tim.data || [];
  const ketuaCount = timList.filter((t) => t.peran_saya === 'Ketua').length;
  const ringkasanTim = timList.length > 0
    ? `${timList.length} tim aktif · ${ketuaCount} sebagai Ketua`
    : 'Belum bergabung di tim';

  const namaTimTergabung = timList.map((t) => t.nama_tim).join(' dan ') || 'Belum ada tim';

  return (
    <Halaman onRefresh={() => { d.reload(); tim.reload(); }} refreshing={d.loading && !!p}>
      <HeaderLayar judul="Profil saya" />
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!p} onRetry={d.reload} />

      {p && (
        <View style={{ marginTop: 4 }}>
          {/* Header Profil Ringkas (Figma Profil) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <AvatarInitials nama={p.nama} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={[s.judulSerif, { fontSize: 24, marginBottom: 2 }]}>{p.nama}</Text>
              <Text style={[s.redup, { fontSize: 15 }]}>{labelPeran(p.peran_utama)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <IconClock size={14} color={p.ketersediaan ? '#15803D' : c.redup} />
                <Text style={{ fontSize: 13.5, color: p.ketersediaan ? '#15803D' : c.redup, fontWeight: '600' }}>
                  {p.ketersediaan ? 'Tersedia untuk proyek' : 'Sedang tidak tersedia'}
                </Text>
              </View>
            </View>
          </View>

          {/* Subtitle Ringkasan Peran Utama */}
          {timList.length > 0 && (
            <Text style={[s.subKategori, { marginBottom: 12 }]}>
              {ketuaCount > 0 ? `KETUA · ${timList.find((t) => t.peran_saya === 'Ketua')?.nama_tim || ''}` : 'ANGGOTA TIM'}
            </Text>
          )}

          {/* Kartu: Tentang Saya */}
          <Kartu style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.teks, marginBottom: 6 }}>
              Tentang saya
            </Text>
            <Text style={[s.teks, { lineHeight: 22 }]}>
              {p.bio || 'Belum ada bio singkat. Jelaskan minat dan keahlianmu.'}
            </Text>

            <View style={s.garisPemisah} />

            <Tombol
              title="Ubah profil"
              variant="garis"
              icon={<IconEdit size={16} color={c.primer} />}
              onPress={() => navigation.navigate('EditProfil', { profil: p })}
            />
          </Kartu>

          {/* Bagian Skill */}
          <View style={[s.pemisah, { marginBottom: 10, paddingHorizontal: 4 }]}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.teks }}>Skill</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('PilihSkill', { profil: p })}
            >
              <Text style={{ fontSize: 14.5, fontWeight: '700', color: c.primer }}>Pilih skill</Text>
            </Pressable>
          </View>

          <Kartu style={{ marginBottom: 16 }}>
            <SkillChips skills={p.skills} />
            <Text style={[s.redup, { fontSize: 12, marginTop: 10, lineHeight: 18 }]}>
              ✓ Burgundy: ada bukti portofolio.{'\n'}
              Garis: diisi sendiri. Bukti bukan jaminan penguasaan.
            </Text>
          </Kartu>

          {/* Bagian Portofolio */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: c.teks, marginBottom: 10, paddingHorizontal: 4 }}>
            Portofolio
          </Text>

          <Kartu style={{ marginBottom: 16, padding: 16 }}>
            <Pressable
              onPress={() => navigation.navigate('Portofolio')}
              style={s.pemisah}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: c.primer }}>Kelola portofolio</Text>
                <Text style={[s.redup, { marginTop: 4, fontSize: 13 }]}>
                  {p.github ? 'GitHub terhubung' : 'GitHub belum terhubung'} · {p.figma ? 'Figma terhubung' : 'Figma belum terhubung'}
                </Text>
              </View>
              <IconChevronRight size={18} color={c.primer} />
            </Pressable>

            <View style={s.garisPemisah} />

            <Pressable
              onPress={() => navigation.navigate('Portofolio')}
              style={s.pemisah}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: c.teks }}>Hubungkan GitHub / Figma</Text>
                <Text style={[s.redup, { marginTop: 2, fontSize: 13 }]}>
                  Tampilkan ringkasan karya sebagai bukti skill.
                </Text>
              </View>
              <IconLink size={18} color={c.primer} />
            </Pressable>
          </Kartu>

          {/* Bagian Ruang Kolaborasi */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: c.teks, marginBottom: 10, paddingHorizontal: 4 }}>
            Ruang kolaborasi
          </Text>

          <Kartu style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.teks }}>{ringkasanTim}</Text>
            <Text style={[s.redup, { marginTop: 4, fontSize: 13.5 }]}>{namaTimTergabung}</Text>
          </Kartu>

          {/* Tombol Keluar */}
          <Tombol
            title="Keluar"
            variant="garis"
            icon={<IconLogOut size={18} color={c.primer} />}
            onPress={keluar}
            style={{ borderColor: c.garisGelap }}
          />
        </View>
      )}
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
      <HeaderLayar judul="Ubah profil" onBack={() => navigation.goBack()} />
      <View style={{ marginTop: 8 }}>
        <Text style={s.label}>Nama lengkap</Text>
        <TextInput
          style={s.input}
          value={nama}
          onChangeText={setNama}
          maxLength={100}
          editable={!busy}
          placeholder="Nama kamu"
          placeholderTextColor="#8F817B"
          accessibilityLabel="Nama"
        />

        <Text style={s.label}>Bio singkat</Text>
        <TextInput
          style={[s.input, { minHeight: 90, textAlignVertical: 'top' }]}
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={500}
          editable={!busy}
          accessibilityLabel="Bio"
          placeholder="Pengalaman, minat lomba, atau bidang karya yang disukai..."
          placeholderTextColor="#8F817B"
        />

        <Text style={s.label}>Peran utama</Text>
        <PeranPilihan nilai={peran} onPilih={setPeran} disabled={busy} />

        <View style={[s.kartu, s.pemisah, { marginTop: 18, paddingVertical: 12 }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.teks }}>Tersedia untuk proyek</Text>
            <Text style={[s.redup, { fontSize: 12.5, marginTop: 2 }]}>
              Izinkan pencari tim melihatmu di hasil pencarian.
            </Text>
          </View>
          <Switch
            value={tersedia}
            onValueChange={setTersedia}
            disabled={busy}
            trackColor={{ false: '#D1C4B5', true: c.primer }}
            thumbColor={c.putih}
            accessibilityLabel="Tersedia untuk proyek"
          />
        </View>

        <Galat pesan={error} />
        <Tombol title={busy ? 'Menyimpan...' : 'Simpan profil'} onPress={simpan} disabled={busy} />
      </View>
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
    const ok = await jalankan(async () => {
      await api.setSkills(dipilih);
      return true;
    });
    if (ok) navigation.goBack();
  }

  const dataSkills = skills.data || [];

  return (
    <Halaman>
      <HeaderLayar
        judul="Pilih skill"
        onBack={() => navigation.goBack()}
        subKategori="KEAHLIAN & SPESIALISASI"
        keterangan={`${dipilih.length} skill dipilih.`}
      />
      <Status loading={skills.loading} error={skills.error} adaData={!!skills.data} onRetry={skills.reload} />

      {KATEGORI.map(([kat, label]) => {
        const itemKat = dataSkills.filter((s) => s.kategori === kat);
        if (!itemKat.length) return null;
        return (
          <View key={kat} style={{ marginTop: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: c.teks, marginBottom: 8 }}>{label}</Text>
            <View style={s.baris}>
              {itemKat.map((k) => {
                const aktif = dipilih.includes(k.id);
                return (
                  <Chip
                    key={k.id}
                    teks={k.nama}
                    aktif={aktif}
                    onPress={() => togel(k.id)}
                    disabled={busy}
                  />
                );
              })}
            </View>
          </View>
        );
      })}

      <InfoBox
        style={{ marginTop: 20 }}
        teks="Skill yang cocok dengan repositori GitHub atau file Figma kamu akan terverifikasi otomatis dengan centang ✓."
      />

      <Galat pesan={error} />
      <Tombol title={busy ? 'Menyimpan...' : 'Simpan skill'} onPress={simpan} disabled={busy} />
    </Halaman>
  );
}

export function PortofolioScreen({ navigation }) {
  const d = useData('portofolio', () => api.portofolio());
  const chal = useData('challenge', () => api.githubChallenge());
  const [username, setUsername] = useState('');
  const [tokenFigma, setTokenFigma] = useState('');
  const [keysFigma, setKeysFigma] = useState('');
  const { busy, error, jalankan } = useAksi();
  const p = d.data;

  return (
    <Halaman onRefresh={d.reload} refreshing={d.loading && !!p}>
      <HeaderLayar judul="Portofolio" onBack={() => navigation.goBack()} />
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!p} onRetry={d.reload} />

      {/* GitHub Section */}
      <Text style={s.sub}>GitHub</Text>
      <Kartu style={{ marginBottom: 16 }}>
        {p?.github ? (
          <View style={{ gap: 6 }}>
            <Text style={[s.teks, { fontWeight: '700', color: c.primer }]}>Terhubung: @{p.github.username}</Text>
            <Text style={s.teks}>{p.github.jumlah_repo} repositori · {p.github.jumlah_commit} commit</Text>
            <Text style={s.redup}>Bahasa: {(p.github.top_languages || []).join(', ') || '-'}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Tombol title="Sinkronkan" onPress={() => jalankan(async () => { await api.githubSinkron(); await d.reload(); })} disabled={busy} />
              </View>
              <View style={{ flex: 1 }}>
                <Tombol title="Putuskan" variant="garis" onPress={() => jalankan(async () => { await api.githubPutus(); await d.reload(); })} disabled={busy} />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={s.teks}>Tempel kode verifikasi berikut pada bio profil GitHub kamu:</Text>
            <View style={{ backgroundColor: c.bgInfo, padding: 12, borderRadius: 12 }}>
              <Text selectable style={{ fontFamily: font.serif, fontSize: 16, fontWeight: '700', color: c.primer }}>
                {chal.data?.kode || 'Memuat kode...'}
              </Text>
            </View>
            <TextInput
              style={s.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username GitHub kamu"
              placeholderTextColor="#8F817B"
              autoCapitalize="none"
              editable={!busy}
            />
            <Tombol
              title="Hubungkan GitHub"
              onPress={() => jalankan(async () => { await api.githubHubungkan(username.trim()); await d.reload(); })}
              disabled={busy || !username.trim()}
            />
          </View>
        )}
      </Kartu>

      {/* Figma Section */}
      <Text style={s.sub}>Figma</Text>
      <Kartu style={{ marginBottom: 20 }}>
        {p?.figma ? (
          <View style={{ gap: 6 }}>
            <Text style={[s.teks, { fontWeight: '700', color: c.primer }]}>Terhubung: @{p.figma.username_figma}</Text>
            <Text style={s.teks}>{p.figma.jumlah_proyek} file proyek</Text>
            {(p.figma.files || []).map((f) => (
              <Text key={f.key} style={s.redup}>• {f.name}</Text>
            ))}
            <Tombol title="Putuskan Figma" variant="garis" onPress={() => jalankan(async () => { await api.figmaPutus(); await d.reload(); })} disabled={busy} />
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={s.redup}>Token akses Figma hanya dipakai sekali untuk verifikasi dan tidak disimpan di server.</Text>
            <TextInput
              style={s.input}
              value={tokenFigma}
              onChangeText={setTokenFigma}
              placeholder="Personal Access Token Figma (figd_...)"
              placeholderTextColor="#8F817B"
              secureTextEntry
              editable={!busy}
            />
            <TextInput
              style={s.input}
              value={keysFigma}
              onChangeText={setKeysFigma}
              placeholder="File key (pisahkan dengan koma jika lebih dari satu)"
              placeholderTextColor="#8F817B"
              editable={!busy}
            />
            <Tombol
              title="Hubungkan Figma"
              onPress={() =>
                jalankan(async () => {
                  const arr = keysFigma.split(',').map((x) => x.trim()).filter(Boolean);
                  await api.figmaHubungkan(tokenFigma.trim(), arr);
                  await d.reload();
                })
              }
              disabled={busy || !tokenFigma.trim() || !keysFigma.trim()}
            />
          </View>
        )}
      </Kartu>

      <Galat pesan={error} />
    </Halaman>
  );
}
