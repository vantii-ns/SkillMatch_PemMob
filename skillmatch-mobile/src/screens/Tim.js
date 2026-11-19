// M3 — tim, anggota, ruang diskusi (US-05, US-09)
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { AvatarInitials, Chip, Galat, Halaman, HeaderLayar, InfoBox, Kartu, KartuTim, Status, StatusBadge, Tombol } from '../components';
import { useAuth } from '../AuthContext';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { labelPeran, validasiTim, waktuSingkat } from '../helpers';
import { c, font, radius, s } from '../theme';
import { IconChat, IconEdit, IconPlus, IconSend, IconTrash, IconUsers } from '../icons';

export function TimListScreen({ navigation }) {
  const d = useData('tim', () => api.timSaya());
  const timList = d.data || [];
  const jumlahTim = timList.length;

  return (
    <View style={s.halaman}>
      <HeaderLayar
        judul="Tim saya"
        subKategori="RUANG UNTUK BERKARYA"
        keterangan={`${jumlahTim} tim, satu semangat kolaborasi.`}
      />

      <View style={{ paddingHorizontal: 18, marginBottom: 8 }}>
        <Tombol
          title="Buat tim baru"
          icon={<IconPlus size={18} color={c.putih} />}
          onPress={() => navigation.navigate('TimForm')}
        />
      </View>

      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!d.data} onRetry={d.reload} />

      <FlatList
        data={timList}
        keyExtractor={(t) => String(t.id_tim)}
        contentContainerStyle={[s.isi, { paddingTop: 4 }]}
        refreshing={d.loading && !!d.data}
        onRefresh={d.reload}
        ListEmptyComponent={
          !d.loading && !d.error ? (
            <View style={[s.kartu, { alignItems: 'center', padding: 24, marginVertical: 20 }]}>
              <IconUsers size={40} color={c.redup} />
              <Text style={[s.kartuJudul, { textAlign: 'center', marginTop: 10, marginBottom: 6 }]}>Belum ada tim</Text>
              <Text style={[s.redup, { textAlign: 'center', marginBottom: 14 }]}>
                Kamu belum tergabung dalam tim mana pun. Buat tim baru untuk memulai kolaborasi.
              </Text>
              <Tombol title="+ Buat tim baru" onPress={() => navigation.navigate('TimForm')} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <KartuTim
            tim={item}
            onPress={() => navigation.navigate('TimDetail', { id: item.id_tim, nama: item.nama_tim })}
          />
        )}
        ListFooterComponent={
          jumlahTim > 0 ? (
            <Text style={[s.keterangan, { textAlign: 'center', marginTop: 12, marginBottom: 24 }]}>
              Buka tim untuk melihat anggota, undangan, dan diskusi bersama.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

export function TimFormScreen({ route, navigation }) {
  const tim = route.params?.tim; // jika ada = mode ubah
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
      if (tim) await api.ubahTim(tim.id_tim, body);
      else await api.buatTim(body);
      return true;
    });
    if (ok) navigation.goBack();
  }

  return (
    <Halaman>
      <HeaderLayar
        judul={tim ? 'Ubah tim' : 'Buat tim baru'}
        onBack={() => navigation.goBack()}
        subKategori="SATUKAN KEAHLIAN"
        keterangan="Jelaskan tujuan tim dan skill yang kamu cari."
      />

      <View style={{ marginTop: 10 }}>
        <Text style={s.label}>Nama tim</Text>
        <TextInput
          style={s.input}
          value={nama}
          onChangeText={setNama}
          maxLength={100}
          editable={!busy}
          placeholder="Contoh: Kreasi Kampus"
          placeholderTextColor="#8F817B"
          accessibilityLabel="Nama tim"
        />

        <Text style={s.label}>Deskripsi</Text>
        <TextInput
          style={[s.input, { minHeight: 90, textAlignVertical: 'top' }]}
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
          maxLength={500}
          editable={!busy}
          placeholder="Lomba inovasi aplikasi kampus"
          placeholderTextColor="#8F817B"
          accessibilityLabel="Deskripsi"
        />

        <Text style={s.label}>Skill yang dibutuhkan</Text>
        <Text style={[s.redup, { marginTop: -4, marginBottom: 10 }]}>
          Pilih beberapa skill · {dipilih.length} dipilih
        </Text>
        <View style={s.baris}>
          {(skills.data || []).map((k) => {
            const aktif = dipilih.includes(k.nama);
            return (
              <Chip
                key={k.id}
                teks={k.nama}
                aktif={aktif}
                onPress={() => togel(k.nama)}
                disabled={busy}
              />
            );
          })}
        </View>

        <InfoBox
          style={{ marginTop: 18 }}
          teks="Kamu otomatis menjadi Ketua. Ketua dapat mengundang, mengelola peran anggota, dan mengubah informasi tim."
        />

        <Text style={[s.redup, { marginTop: 6, marginBottom: 12, textAlign: 'center' }]}>
          Nama dan kebutuhan skill dapat diubah setelah tim dibuat.
        </Text>

        <Galat pesan={error} />
        <Tombol
          title={busy ? 'Menyimpan...' : tim ? 'Simpan perubahan' : '+ Buat tim'}
          onPress={simpan}
          disabled={busy}
        />
      </View>
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
  const ketua = !!t && t.id_users === user?.id_users;

  const aksi = (fn, selesai) => jalankan(async () => {
    await fn();
    if (selesai) selesai();
    else await d.reload();
  });

  const konfirmasi = (judul, pesan, fn, selesai) =>
    Alert.alert(judul, pesan, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Ya, bubarkan tim', style: 'destructive', onPress: () => aksi(fn, selesai) },
    ]);

  return (
    <Halaman onRefresh={d.reload} refreshing={d.loading && !!t}>
      <HeaderLayar
        judul="Detail tim"
        onBack={() => navigation.goBack()}
        rightAction={
          ketua && t ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ubah tim"
              onPress={() => navigation.navigate('TimForm', { tim: t })}
              style={{ padding: 6 }}
            >
              <IconEdit size={22} color={c.primer} />
            </Pressable>
          ) : null
        }
      />

      <Status loading={d.loading} error={d.error} stale={d.stale} adaData={!!t} onRetry={d.reload} />
      <Galat pesan={error} />

      {t && (
        <View style={{ marginTop: 4 }}>
          {/* Subheader Peran */}
          <Text style={s.subKategori}>
            {ketua ? 'PERANMU · KETUA' : 'PERANMU · ANGGOTA'}
          </Text>

          {/* Nama Tim & Subtitle */}
          <Text style={[s.judulSerif, { fontSize: 26, marginVertical: 4 }]}>{t.nama_tim}</Text>
          <Text style={[s.redup, { fontSize: 14.5, marginBottom: 16 }]}>
            {(t.anggota || []).length} anggota · {t.deskripsi || 'Belum ada deskripsi'}
          </Text>

          {/* Kartu: Tentang Tim */}
          <Kartu>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.teks, marginBottom: 6 }}>
              Tentang tim
            </Text>
            <Text style={[s.teks, { lineHeight: 22 }]}>
              {t.deskripsi || 'Tim kolaborasi untuk mewujudkan ide bersama.'}
            </Text>

            <Text style={{ fontSize: 13, fontWeight: '700', color: c.teks, marginTop: 12, marginBottom: 8 }}>
              Skill yang dibutuhkan
            </Text>
            {t.kebutuhan_skill && t.kebutuhan_skill.length > 0 ? (
              <View style={s.baris}>
                {t.kebutuhan_skill.map((k) => (
                  <Chip key={k} teks={k} />
                ))}
              </View>
            ) : (
              <Text style={s.redup}>Belum ada skill yang ditentukan.</Text>
            )}

            {ketua && (
              <>
                <View style={s.garisPemisah} />
                <Tombol
                  title="Ubah tim"
                  variant="garis"
                  icon={<IconEdit size={16} color={c.primer} />}
                  onPress={() => navigation.navigate('TimForm', { tim: t })}
                  disabled={busy}
                />
              </>
            )}
          </Kartu>

          {/* Tombol Utama: Buka Ruang Diskusi */}
          <Tombol
            title="Buka ruang diskusi"
            icon={<IconChat size={18} color={c.putih} />}
            onPress={() => navigation.navigate('Diskusi', { id, nama: t.nama_tim })}
            style={{ marginVertical: 14 }}
          />

          {/* Bagian Anggota */}
          <View style={[s.pemisah, { marginTop: 12, marginBottom: 8, paddingHorizontal: 4 }]}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: c.teks }}>
              Anggota · {(t.anggota || []).length}
            </Text>
            {ketua && (
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Utama', { screen: 'Cari' })}
              >
                <Text style={{ fontSize: 14.5, fontWeight: '700', color: c.primer }}>Undang</Text>
              </Pressable>
            )}
          </View>

          <Kartu style={{ padding: 14, gap: 14 }}>
            {(t.anggota || []).map((a, index) => {
              const isSaya = a.id_users === user?.id_users;
              const peranTeks = [
                isSaya ? 'Kamu' : null,
                labelPeran(a.peran_utama),
                a.peran || 'Anggota',
              ].filter(Boolean).join(' · ');

              return (
                <View key={a.id_users}>
                  {index > 0 && <View style={[s.garisPemisah, { marginVertical: 10 }]} />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <AvatarInitials nama={a.nama} size={44} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: font.serif, fontSize: 18, fontWeight: '700', color: c.primer }}>
                        {a.nama}
                      </Text>
                      <Text style={[s.redup, { marginTop: 2 }]}>{peranTeks}</Text>
                    </View>
                  </View>

                  {/* Tombol ubah peran / keluarkan (khusus Ketua pada anggota lain) */}
                  {ketua && !isSaya && (
                    <View style={{ marginTop: 10 }}>
                      {edit?.id_users === a.id_users ? (
                        <View style={{ gap: 8, marginTop: 4 }}>
                          <TextInput
                            style={s.input}
                            value={edit.peran}
                            onChangeText={(v) => setEdit({ ...edit, peran: v })}
                            maxLength={50}
                            placeholder="Peran anggota (misal: UI Designer)"
                            placeholderTextColor="#8F817B"
                            accessibilityLabel="Peran anggota"
                          />
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                              <Tombol
                                title="Simpan peran"
                                disabled={busy || !edit.peran.trim()}
                                onPress={() =>
                                  aksi(
                                    () => api.ubahPeran(id, a.id_users, edit.peran.trim()),
                                    () => { setEdit(null); d.reload(); }
                                  )
                                }
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Tombol
                                title="Batal"
                                variant="garis"
                                onPress={() => setEdit(null)}
                              />
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                          <View style={{ flex: 1 }}>
                            <Tombol
                              title="Ubah peran"
                              variant="garis"
                              onPress={() => setEdit({ id_users: a.id_users, peran: a.peran })}
                              disabled={busy}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Tombol
                              title="Keluarkan"
                              variant="garis"
                              onPress={() =>
                                konfirmasi(
                                  'Keluarkan anggota',
                                  `Keluarkan ${a.nama} dari tim?`,
                                  () => api.keluarkan(id, a.id_users)
                                )
                              }
                              disabled={busy}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </Kartu>

          {/* Bagian Undangan Terkirim (Hanya untuk Ketua) */}
          {ketua && (
            <View style={{ marginTop: 18 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: c.teks, marginBottom: 8, paddingHorizontal: 4 }}>
                Undangan terkirim · {(t.undangan || []).length}
              </Text>

              {(t.undangan || []).length === 0 ? (
                <Kartu style={{ padding: 18 }}>
                  <Text style={[s.redup, { textAlign: 'center' }]}>
                    Belum ada undangan aktif. Cari kandidat di tab Cari untuk mengundang rekan tim.
                  </Text>
                </Kartu>
              ) : (
                <Kartu style={{ padding: 14, gap: 12 }}>
                  {t.undangan.map((u, idx) => (
                    <View key={u.id_undangan}>
                      {idx > 0 && <View style={[s.garisPemisah, { marginVertical: 8 }]} />}
                      <View style={s.pemisah}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: c.teks }}>
                            {u.nama}
                          </Text>
                          <Text style={[s.redup, { marginTop: 2 }]}>
                            {u.peran_ditawarkan || 'Anggota'}
                          </Text>
                        </View>
                        <StatusBadge status={u.status} />
                      </View>
                    </View>
                  ))}
                </Kartu>
              )}

              {/* Info Box Ketua */}
              <InfoBox
                style={{ marginTop: 16 }}
                teks="Hanya Ketua yang dapat mengedit tim, mengundang, mengubah peran, mengeluarkan anggota, dan membubarkan tim."
              />

              {/* Aksi Bubarkan Tim */}
              <Tombol
                title="Bubarkan tim"
                variant="bahaya"
                icon={<IconTrash size={18} color={c.primer} />}
                disabled={busy}
                onPress={() =>
                  konfirmasi(
                    'Bubarkan Kreasi Kampus?',
                    `Hapus tim "${t.nama_tim}" beserta seluruh diskusinya? Anggota kehilangan akses ke tim ini. Tindakan ini tidak dapat dibatalkan.`,
                    () => api.hapusTim(id),
                    () => navigation.popToTop()
                  )
                }
              />
              <Text style={[s.redup, { textAlign: 'center', marginTop: -4, marginBottom: 20 }]}>
                Membubarkan tim juga menghapus seluruh diskusinya. Konfirmasi diperlukan.
              </Text>
            </View>
          )}

          {/* Opsi Anggota Biasa: Keluar dari Tim */}
          {!ketua && (
            <View style={{ marginTop: 18, marginBottom: 24 }}>
              <Tombol
                title="Keluar dari tim"
                variant="bahaya"
                disabled={busy}
                onPress={() =>
                  konfirmasi(
                    'Keluar dari tim',
                    `Keluar dari "${t.nama_tim}"?`,
                    () => api.keluarkan(id, user.id_users),
                    () => navigation.popToTop()
                  )
                }
              />
            </View>
          )}
        </View>
      )}
    </Halaman>
  );
}

// US-09 — ruang diskusi tim (polling tiap 4 detik, hanya pesan baru yang diambil)
export function DiskusiScreen({ route, navigation }) {
  const idRaw = route.params?.id ?? route.params?.id_tim;
  const id = idRaw ? Number(idRaw) : null;
  const nama = route.params?.nama || 'Diskusi Tim';
  const { user } = useAuth();
  const [pesan, setPesan] = useState([]);
  const [teks, setTeks] = useState('');
  const [galatTarik, setGalatTarik] = useState('');
  const { busy, error, setError, jalankan } = useAksi();
  const daftar = useRef(null);
  const terakhir = useRef(0);
  const tarikRef = useRef(null);

  // Ambil data tim untuk header info anggota
  const timData = useData(id ? `tim:${id}` : null, () => (id ? api.timDetail(id) : null));
  const t = timData.data;
  const namaAnggota = (t?.anggota || []).slice(0, 3).map((a) => a.nama.split(' ')[0]).join(', ');
  const anggotaKeterangan = t ? `${namaAnggota} · ${t.anggota.length} anggota` : '';

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setGalatTarik('ID tim tidak ditemukan');
      return;
    }
    let aktif = true;
    let jalan = false;

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
      } catch (e) {
        if (aktif) setGalatTarik(e.message);
      } finally {
        jalan = false;
      }
    }

    tarikRef.current = tarik;
    tarik();
    const timer = setInterval(tarik, 4000);
    return () => {
      aktif = false;
      clearInterval(timer);
    };
  }, [id]);

  async function kirim() {
    const isi = teks.trim();
    if (!isi) {
      setError('Pesan tidak boleh kosong');
      return;
    }
    const ok = await jalankan(async () => {
      await api.kirimPesan(id, isi);
      return true;
    });
    if (ok) {
      setTeks('');
      tarikRef.current?.();
    }
  }

  return (
    <View style={s.halaman}>
      {/* Header Diskusi */}
      <HeaderLayar
        judul="Diskusi tim"
        onBack={() => navigation.goBack()}
        subKategori={nama}
        keterangan={anggotaKeterangan}
      />

      {!!galatTarik && (
        <View style={{ paddingHorizontal: 18 }}>
          <View style={[s.banner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
            <Text style={[s.teks, { fontSize: 13, color: c.bahaya }]}>
              Tidak dapat memperbarui pesan: {galatTarik}
            </Text>
          </View>
        </View>
      )}

      {/* Daftar Pesan Chat */}
      <FlatList
        ref={daftar}
        data={pesan}
        keyExtractor={(m) => String(m.id_diskusi)}
        contentContainerStyle={[s.isi, { paddingBottom: 16 }]}
        onContentSizeChange={() => daftar.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32 }}>
            <IconChat size={36} color={c.redup} />
            <Text style={[s.redup, { textAlign: 'center', marginTop: 10 }]}>
              Belum ada pesan. Mulai percakapan tim dengan mengirim pesan di bawah.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const saya = item.id_users === user?.id_users;
          return (
            <View style={{ alignItems: saya ? 'flex-end' : 'flex-start', marginVertical: 6 }}>
              <View
                style={{
                  maxWidth: '82%',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 18,
                  backgroundColor: saya ? c.primer : c.putih,
                  borderWidth: saya ? 0 : 1,
                  borderColor: c.garis,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                {!saya && (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: c.teksPrimer, marginBottom: 4 }}>
                    {item.nama}
                  </Text>
                )}
                <Text style={{ fontSize: 14.5, color: saya ? c.putih : c.teks, lineHeight: 21 }}>
                  {item.isi_pesan}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: saya ? c.krem : c.redup,
                    alignSelf: 'flex-end',
                    marginTop: 4,
                  }}
                >
                  {waktuSingkat(item.waktu_pesan)}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input Pesan di Bawah */}
      <View
        style={{
          padding: 14,
          paddingHorizontal: 18,
          borderTopWidth: 1,
          borderColor: c.garis,
          backgroundColor: c.bg,
        }}
      >
        <Galat pesan={error} />
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput
            style={[
              s.input,
              {
                flex: 1,
                backgroundColor: c.putih,
                borderRadius: radius.pil,
                paddingHorizontal: 18,
                paddingVertical: 12,
              },
            ]}
            value={teks}
            onChangeText={setTeks}
            placeholder="Tulis pesan..."
            placeholderTextColor="#8F817B"
            maxLength={2000}
            editable={!busy}
            accessibilityLabel="Tulis pesan"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kirim"
            disabled={busy || !teks.trim()}
            onPress={kirim}
            style={({ pressed }) => [
              {
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: c.primer,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: busy || !teks.trim() ? 0.6 : 1,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconSend size={18} color={c.putih} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
