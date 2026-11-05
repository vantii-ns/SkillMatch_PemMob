// F4 / US-04 — pencarian & filter kandidat; US-07, US-11 — profil kandidat dengan bukti portofolio; US-05 — undang ke tim
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { AvatarInitials, Chip, Galat, Halaman, HeaderLayar, InfoBox, Kartu, SkillChips, Status, Tombol } from '../components';
import { useAuth } from '../AuthContext';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { labelPeran, tanggalLokal } from '../helpers';
import { c, font, radius, s } from '../theme';
import {
  IconCheck,
  IconCheckCircle,
  IconChevronRight,
  IconClock,
  IconClose,
  IconExternalLink,
  IconFigma,
  IconFilter,
  IconGitHub,
  IconInfo,
  IconSearch,
  IconSend,
  IconUserPlus,
} from '../icons';

const FILTER_PERAN = [['', 'Semua'], ['developer', 'Developer'], ['desainer', 'Desainer'], ['lainnya', 'Lainnya']];
const KOSONG = { q: '', peran: '', tersedia: false, verified: false, skill: [] };

export function CariScreen({ navigation }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState(KOSONG);
  const [kriteria, setKriteria] = useState(KOSONG);
  const [filterBuka, setFilterBuka] = useState(false);
  const skills = useData('skills', () => api.skills());
  const hasil = useData(`cari:${JSON.stringify(kriteria)}`, () => api.cari(kriteria));

  const ubah = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const togelSkill = (nama) => setDraft((d) => ({
    ...d,
    skill: d.skill.includes(nama) ? d.skill.filter((x) => x !== nama) : [...d.skill, nama],
  }));

  const resetFilter = () => {
    setDraft(KOSONG);
    setKriteria(KOSONG);
  };

  const tutupBatal = () => {
    setDraft(kriteria);
    setFilterBuka(false);
  };

  const jumlahFilterAktif = [
    draft.peran ? 1 : 0,
    draft.tersedia ? 1 : 0,
    draft.verified ? 1 : 0,
    draft.skill.length,
  ].reduce((a, b) => a + b, 0);

  const namaPengguna = user?.nama ? user.nama.split(' ')[0].toUpperCase() : 'REKAN';

  return (
    <View style={s.halaman}>
      <HeaderLayar
        judul="Cari rekan tim"
        subKategori={`HALO, ${namaPengguna}`}
        keterangan="Rekan sejalan untuk ide besarmu."
        rightAction={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter"
            onPress={() => setFilterBuka(true)}
            style={{ padding: 6 }}
          >
            <IconFilter size={22} color={c.primer} />
          </Pressable>
        }
      />

      <View style={{ paddingHorizontal: 18, marginBottom: 8 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: c.putih,
          borderRadius: radius.pil,
          borderWidth: 1.2,
          borderColor: c.garisGelap,
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 10,
        }}>
          <Text style={{ fontSize: 16, color: c.redup }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontSize: 15, color: c.teks, padding: 0 }}
            value={draft.q}
            onChangeText={(v) => ubah('q', v)}
            placeholder="Cari nama / kata kunci"
            placeholderTextColor="#8F817B"
            returnKeyType="search"
            onSubmitEditing={() => setKriteria(draft)}
            accessibilityLabel="Cari nama / kata kunci"
          />
          {!!draft.q && (
            <Pressable onPress={() => { ubah('q', ''); setKriteria((k) => ({ ...k, q: '' })); }}>
              <Text style={{ fontSize: 16, color: c.redup, paddingHorizontal: 4 }}>✕</Text>
            </Pressable>
          )}
        </View>

        {jumlahFilterAktif > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={[s.redup, { fontSize: 13, fontWeight: '600' }]}>{jumlahFilterAktif} filter aktif</Text>
            <Pressable onPress={resetFilter}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.primer }}>Reset</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Status loading={hasil.loading} error={hasil.error} stale={hasil.stale} adaData={!!hasil.data} onRetry={hasil.reload} />

      <FlatList
        data={hasil.data || []}
        keyExtractor={(k) => String(k.id_users)}
        contentContainerStyle={[s.isi, { paddingTop: 4 }]}
        refreshing={hasil.loading && !!hasil.data}
        onRefresh={hasil.reload}
        ListHeaderComponent={
          (hasil.data || []).length > 0 ? (
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.teks, marginBottom: 10, paddingHorizontal: 4 }}>
              {(hasil.data || []).length} kandidat ditemukan
            </Text>
          ) : null
        }
        ListEmptyComponent={
          !hasil.loading && !hasil.error ? (
            <View style={[s.kartu, { alignItems: 'center', padding: 24, marginVertical: 20 }]}>
              <IconSearch size={36} color={c.redup} />
              <Text style={[s.kartuJudul, { textAlign: 'center', marginTop: 10, marginBottom: 6 }]}>Tidak ada kandidat yang cocok</Text>
              <Text style={[s.redup, { textAlign: 'center', marginBottom: 14 }]}>
                Coba longgarkan kriteria atau reset filter untuk melihat kandidat lain.
              </Text>
              <Tombol title="Reset filter" variant="garis" onPress={resetFilter} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Kartu
            onPress={() => navigation.navigate('KandidatDetail', { id: item.id_users, nama: item.nama, kandidat: item })}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <AvatarInitials nama={item.nama} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.serif, fontSize: 20, fontWeight: '700', color: c.primer }}>
                  {item.nama}
                </Text>
                <Text style={[s.redup, { marginTop: 2, fontSize: 14 }]}>
                  {labelPeran(item.peran_utama)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <IconClock size={14} color={item.ketersediaan ? '#15803D' : c.redup} />
                  <Text style={{ fontSize: 13, color: item.ketersediaan ? '#15803D' : c.redup, fontWeight: '600' }}>
                    {item.ketersediaan ? 'Tersedia untuk proyek' : 'Sedang sibuk'}
                  </Text>
                </View>
              </View>
            </View>

            {item.skills && item.skills.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <SkillChips skills={item.skills} maks={5} />
              </View>
            )}

            {!!item.github_username && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: c.garis }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconGitHub size={16} color={c.primer} />
                  <Text style={[s.redup, { fontSize: 13 }]}>
                    GitHub · {item.jumlah_repo ?? 0} repositori publik
                  </Text>
                </View>
                <IconChevronRight size={16} color={c.redup} />
              </View>
            )}
          </Kartu>
        )}
      />

      <Modal visible={filterBuka} animationType="slide" onRequestClose={tutupBatal}>
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40, paddingBottom: 130 }}>
            <View style={s.pemisah}>
              <Text style={s.judulSerif}>Filter kandidat</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Tutup" hitSlop={12} onPress={tutupBatal}>
                <IconClose size={24} color={c.primer} />
              </Pressable>
            </View>
            <Text style={[s.keterangan, { marginTop: 12 }]}>
              Pilih kriteria yang relevan untuk kebutuhan timmu.
            </Text>

            <Text style={s.label}>Nama / kata kunci</Text>
            <TextInput
              style={s.input}
              value={draft.q}
              onChangeText={(v) => ubah('q', v)}
              placeholder="Cari nama / kata kunci"
              placeholderTextColor="#8F817B"
            />

            <Text style={s.label}>Peran utama</Text>
            <View style={s.baris}>
              {FILTER_PERAN.map(([id, label]) => (
                <Chip key={id || 'semua'} teks={label} aktif={draft.peran === id} onPress={() => ubah('peran', id)} />
              ))}
            </View>

            <View style={[s.pemisah, { marginTop: 22 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.teks }}>Hanya yang tersedia</Text>
                <Text style={s.redup}>Siap bergabung dalam proyek.</Text>
              </View>
              <Switch
                value={draft.tersedia}
                onValueChange={(v) => ubah('tersedia', v)}
                trackColor={{ false: '#D1C4B5', true: c.primer }}
                thumbColor={c.putih}
              />
            </View>

            <View style={[s.pemisah, { marginTop: 16 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.teks }}>Hanya skill terverifikasi</Text>
                <Text style={s.redup}>Bahasa di repositori atau file Figma terbaca.</Text>
              </View>
              <Switch
                value={draft.verified}
                onValueChange={(v) => ubah('verified', v)}
                trackColor={{ false: '#D1C4B5', true: c.primer }}
                thumbColor={c.putih}
              />
            </View>

            <Text style={[s.label, { marginTop: 22 }]}>Skill</Text>
            <Text style={s.redup}>Bisa pilih lebih dari satu · {draft.skill.length} dipilih</Text>
            <View style={[s.baris, { marginTop: 10 }]}>
              {(skills.data || []).map((k) => (
                <Chip key={k.id} teks={k.nama} aktif={draft.skill.includes(k.nama)} onPress={() => togelSkill(k.nama)} />
              ))}
            </View>

            <InfoBox
              style={{ marginTop: 22 }}
              teks={`${jumlahFilterAktif} filter aktif: peran, ketersediaan, bukti, dan skill. Perubahan diterapkan setelah kamu menekan tombol.`}
            />
          </ScrollView>

          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, flexDirection: 'row', gap: 12, backgroundColor: c.bg }}>
            <View style={{ flex: 1 }}>
              <Tombol title="Reset" variant="garis" onPress={() => setDraft(KOSONG)} />
            </View>
            <View style={{ flex: 1 }}>
              <Tombol title="Terapkan filter" onPress={() => { setKriteria(draft); setFilterBuka(false); }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function KandidatDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const d = useData(`kandidat:${id}`, () => api.kandidat(id));
  const p = d.data;

  return (
    <Halaman onRefresh={d.reload} refreshing={d.loading && !!p}>
      <HeaderLayar judul="Detail kandidat" onBack={() => navigation.goBack()} />
      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!p} onRetry={d.reload} />

      {p && (
        <View style={{ marginTop: 4 }}>
          {/* Header Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <AvatarInitials nama={p.nama} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={[s.judulSerif, { fontSize: 24, marginBottom: 4 }]}>{p.nama}</Text>
              <Text style={[s.redup, { fontSize: 15 }]}>{labelPeran(p.peran_utama)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <IconClock size={14} color={p.ketersediaan ? '#15803D' : c.redup} />
                <Text style={{ fontSize: 13.5, color: p.ketersediaan ? '#15803D' : c.redup, fontWeight: '600' }}>
                  {p.ketersediaan ? 'Tersedia untuk proyek' : 'Sedang tidak tersedia'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bio Tentang Andi / Nama */}
          {!!p.bio && (
            <Kartu style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.teks, marginBottom: 6 }}>
                Tentang {p.nama ? p.nama.split(' ')[0] : 'Kandidat'}
              </Text>
              <Text style={[s.teks, { lineHeight: 22 }]}>{p.bio}</Text>
            </Kartu>
          )}

          {/* Skill */}
          <Text style={s.sub}>Skill</Text>
          <Kartu style={{ marginBottom: 14 }}>
            <SkillChips skills={p.skills} />
            <View style={{ marginTop: 12, borderTopWidth: 1, borderColor: c.garis, paddingTop: 8 }}>
              <Text style={[s.redup, { fontSize: 12, lineHeight: 17 }]}>
                ✓ Burgundy: ada bukti portofolio.
              </Text>
              <Text style={[s.redup, { fontSize: 12, lineHeight: 17 }]}>
                Garis: diisi sendiri. Bukti bukan jaminan penguasaan.
              </Text>
            </View>
          </Kartu>

          {/* Bukti Portofolio */}
          <Text style={s.sub}>Bukti portofolio</Text>
          <Kartu style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconGitHub size={20} color={c.primer} />
                <Text style={{ fontSize: 17, fontWeight: '700', color: c.primer }}>GitHub</Text>
              </View>
              <IconExternalLink size={18} color={c.primer} />
            </View>

            {p.github ? (
              <View style={{ gap: 10 }}>
                <Text style={[s.teks, { fontWeight: '600', fontSize: 15 }]}>@{p.github.username}</Text>

                {/* 2 Stat Boxes */}
                <View style={{ flexDirection: 'row', gap: 16, marginVertical: 4 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.serif, fontSize: 24, fontWeight: '700', color: c.primer }}>
                      {p.github.jumlah_repo}
                    </Text>
                    <Text style={[s.redup, { fontSize: 12.5 }]}>Repositori publik</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.serif, fontSize: 24, fontWeight: '700', color: c.primer }}>
                      {p.github.jumlah_commit}
                    </Text>
                    <Text style={[s.redup, { fontSize: 12.5 }]}>Estimasi commit</Text>
                  </View>
                </View>

                {/* Bahasa Teratas */}
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: c.teks, marginBottom: 6 }}>
                    Bahasa teratas
                  </Text>
                  <View style={s.baris}>
                    {(p.github.top_languages || []).map((lang) => (
                      <Chip key={lang} teks={lang} aktif={true} ok={true} icon={<IconCheck size={11} color={c.putih} />} />
                    ))}
                  </View>
                </View>

                <Text style={[s.redup, { fontSize: 11.5, lineHeight: 16, marginTop: 4 }]}>
                  Lencana hanya menunjukkan bahasa ditemukan di repositori publik, bukan tingkat keahlian. Jumlah commit adalah estimasi.
                </Text>

                <View style={{ marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderColor: c.garis, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.primer, fontWeight: '700', fontSize: 14 }}>Lihat profil GitHub</Text>
                  <IconExternalLink size={16} color={c.primer} />
                </View>
              </View>
            ) : (
              <Text style={s.redup}>Belum terhubung ke GitHub.</Text>
            )}
          </Kartu>

          {/* Figma Card */}
          <Kartu style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <IconFigma size={20} color={c.primer} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.primer }}>
                Figma · {p.figma ? `${p.figma.jumlah_proyek || 1} file terbaca` : 'Belum terhubung'}
              </Text>
            </View>
            {p.figma ? (
              <View style={{ gap: 4 }}>
                <Text style={[s.teks, { fontWeight: '700', fontSize: 15 }]}>
                  {p.figma.files?.[0]?.name || 'Alur Aplikasi Kampus'}
                </Text>
                <Text style={[s.redup, { fontSize: 13 }]}>
                  4 halaman · Alur masuk, beranda, dan komponen.
                </Text>
                <Text style={[s.redup, { fontSize: 11.5, marginTop: 4 }]}>
                  File dapat dibaca; bukan penilaian kualitas desain.
                </Text>
              </View>
            ) : (
              <Text style={s.redup}>Belum terhubung ke Figma.</Text>
            )}
          </Kartu>

          <InfoBox teks="Data ilustratif. Integrasi Figma belum diuji pada aplikasi." style={{ marginBottom: 18 }} />

          {/* Tombol Aksi Undang */}
          <Tombol
            title="Undang ke tim"
            icon={<IconUserPlus size={18} color={c.putih} />}
            onPress={() => navigation.navigate('Undang', { id: p.id_users, nama: p.nama, kandidat: p })}
          />
        </View>
      )}
    </Halaman>
  );
}

// US-05 — pilih tim (sebagai ketua) lalu kirim undangan (Gambar 4 Figma)
export function UndangScreen({ route, navigation }) {
  const { id, nama, kandidat } = route.params;
  const tim = useData('tim', () => api.timSaya());
  const [idTim, setIdTim] = useState(null);
  const [peran, setPeran] = useState('Developer');
  const [customPeran, setCustomPeran] = useState('');
  const { busy, error, setError, jalankan } = useAksi();

  const milikku = (tim.data || []).filter((t) => t.peran_saya === 'Ketua');

  // Set default team otomatis ke tim pertama yang dipimpin jika belum dipilih
  const timTerpilih = (tim.data || []).find((t) => t.id_tim === (idTim ?? milikku[0]?.id_tim));
  const activeIdTim = idTim ?? milikku[0]?.id_tim;

  const rolePills = ['Developer', 'Desainer', 'Lainnya'];
  const peranEfektif = peran === 'Lainnya' ? (customPeran.trim() || 'Anggota') : peran;

  async function kirim() {
    if (!activeIdTim) {
      setError('Pilih tim terlebih dahulu');
      return;
    }
    if (!peranEfektif) {
      setError('Peran yang ditawarkan wajib diisi');
      return;
    }
    const hasil = await jalankan(() =>
      api.undang(activeIdTim, { id_users: id, peran_ditawarkan: peranEfektif })
    );
    if (hasil) {
      Alert.alert(
        'Undangan terkirim',
        `${nama} akan menerima undangan sebagai ${peranEfektif} di ${timTerpilih?.nama_tim || 'tim kamu'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }

  return (
    <Halaman>
      <HeaderLayar
        judul="Undang ke tim"
        onBack={() => navigation.goBack()}
        subKategori="MULAI KOLABORASI"
      />

      <Status loading={tim.loading} error={tim.error} stale={tim.stale} adaData={!!tim.data} onRetry={tim.reload} />

      {/* Kartu Profil Kandidat Ringkas (Figma Image 4) */}
      <Kartu style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 10 }}>
        <AvatarInitials nama={nama} size={54} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.serif, fontSize: 21, fontWeight: '700', color: c.primer }}>
            {nama}
          </Text>
          <Text style={[s.redup, { fontSize: 14.5, marginTop: 2 }]}>
            {kandidat?.peran_utama ? labelPeran(kandidat.peran_utama) : 'Developer'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <IconClock size={13} color="#15803D" />
            <Text style={{ fontSize: 13, color: '#15803D', fontWeight: '600' }}>
              Tersedia untuk proyek
            </Text>
          </View>
        </View>
      </Kartu>

      {/* Peringatan jika belum memimpin tim */}
      {tim.data && milikku.length === 0 && (
        <View style={[s.kartu, { alignItems: 'center', padding: 24, marginVertical: 14 }]}>
          <Text style={[s.kartuJudul, { textAlign: 'center', marginBottom: 6 }]}>Belum ada tim milikmu</Text>
          <Text style={[s.redup, { textAlign: 'center', marginBottom: 14 }]}>
            Buat tim agar kamu dapat mengundang rekan dan mengatur peran mereka.
          </Text>
          <Tombol title="+ Buat tim dulu" onPress={() => navigation.navigate('TimForm')} />
        </View>
      )}

      {/* Pilihan Tim Milikmu */}
      {milikku.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.teks, marginBottom: 10 }}>
            Pilih tim milikmu
          </Text>

          {milikku.map((t) => {
            const terpilih = activeIdTim === t.id_tim;
            return (
              <Pressable
                key={t.id_tim}
                accessibilityRole="button"
                onPress={() => setIdTim(t.id_tim)}
                style={[
                  s.kartu,
                  {
                    borderWidth: terpilih ? 2 : 1,
                    borderColor: terpilih ? c.primer : c.garis,
                    marginBottom: 10,
                  },
                ]}
              >
                <View style={s.pemisah}>
                  <Text style={[s.kartuJudul, { fontSize: 18 }]}>{t.nama_tim}</Text>
                  {terpilih ? (
                    <IconCheckCircle size={22} color={c.primer} />
                  ) : (
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: c.garisGelap }} />
                  )}
                </View>
                <Text style={[s.redup, { fontSize: 13.5, marginTop: 2 }]}>
                  Kamu Ketua · {t.jumlah_anggota} anggota
                </Text>
                {!!t.deskripsi && (
                  <Text style={[s.teks, { fontSize: 13.5, marginTop: 4 }]} numberOfLines={2}>
                    {t.deskripsi}
                  </Text>
                )}
              </Pressable>
            );
          })}

          {/* Peran Ditawarkan */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.teks, marginTop: 14, marginBottom: 10 }}>
            Peran ditawarkan
          </Text>
          <View style={s.baris}>
            {rolePills.map((r) => (
              <Chip
                key={r}
                teks={r}
                aktif={peran === r}
                onPress={() => setPeran(r)}
                disabled={busy}
              />
            ))}
          </View>

          {peran === 'Lainnya' && (
            <TextInput
              style={[s.input, { marginTop: 10 }]}
              value={customPeran}
              onChangeText={setCustomPeran}
              placeholder="Ketik nama peran (misal: UI/UX Researcher)"
              placeholderTextColor="#8F817B"
              maxLength={50}
              editable={!busy}
            />
          )}

          {/* Kotak Info Dinamis (Figma Image 4) */}
          <InfoBox
            style={{ marginTop: 18 }}
            teks={`${nama} akan menerima undangan sebagai ${peranEfektif} di ${timTerpilih?.nama_tim || 'tim'}. Keanggotaan baru dimulai setelah undangan diterima.`}
          />

          <Text style={[s.redup, { marginTop: 6, marginBottom: 16, textAlign: 'center' }]}>
            Hanya tim yang kamu pimpin yang dapat dipilih.
          </Text>

          <Galat pesan={error} />

          {/* Tombol Kirim Undangan */}
          <Tombol
            title={busy ? 'Mengirim...' : 'Kirim undangan'}
            icon={<IconSend size={18} color={c.putih} />}
            onPress={kirim}
            disabled={busy || !activeIdTim}
          />
        </View>
      )}
    </Halaman>
  );
}
