// US-06 — undangan masuk (terima/tolak), US-10 — notifikasi (Kotak Figma)
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { AvatarInitials, Chip, Galat, HeaderLayar, Kartu, Status, StatusBadge, Tombol } from '../components';
import { useAksi, useData } from '../hooks';
import { api } from '../api';
import { tanggalLokal, waktuSingkat } from '../helpers';
import { c, font, radius, s } from '../theme';
import { IconBox, IconChat, IconCheck, IconChevronRight, IconMail, IconRefresh, IconUsers } from '../icons';

export function KotakScreen({ navigation }) {
  const [tabAktif, setTabAktif] = useState('undangan'); // 'undangan' | 'notifikasi'
  const [detailNotif, setDetailNotif] = useState(null);
  const dUndangan = useData('undangan', () => api.undanganMasuk());
  const dNotifikasi = useData('notifikasi', () => api.notifikasi());
  const { busy, error, jalankan } = useAksi();

  const undanganList = dUndangan.data || [];
  const notifikasiList = dNotifikasi.data || [];
  const menungguCount = undanganList.filter((u) => u.status === 'menunggu').length;
  const belumDibacaCount = notifikasiList.filter((n) => !n.status_dibaca).length;

  const respons = (u, status) =>
    jalankan(async () => {
      await api.responUndangan(u.id_undangan, status);
      await dUndangan.reload();
    });

  const tolak = (u) =>
    Alert.alert('Tolak undangan', `Tolak undangan ke tim "${u.nama_tim}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Tolak', style: 'destructive', onPress: () => respons(u, 'ditolak') },
    ]);

  const muatUlang = () => {
    dUndangan.reload();
    dNotifikasi.reload();
  };

  return (
    <View style={s.halaman}>
      <HeaderLayar
        judul="Kotak"
        rightAction={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Muat ulang"
            onPress={muatUlang}
            style={{ padding: 6 }}
          >
            <IconRefresh size={22} color={c.primer} />
          </Pressable>
        }
      />

      {/* Sub-tab pills: Undangan & Notifikasi (Figma Kotak) */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginBottom: 12 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setTabAktif('undangan')}
          style={{
            flex: 1,
            backgroundColor: tabAktif === 'undangan' ? c.primer : c.putih,
            borderWidth: 1.2,
            borderColor: tabAktif === 'undangan' ? c.primer : c.garisGelap,
            borderRadius: radius.pil,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: tabAktif === 'undangan' ? c.putih : c.teks,
            }}
          >
            Undangan {menungguCount > 0 ? `(${menungguCount})` : ''}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setTabAktif('notifikasi')}
          style={{
            flex: 1,
            backgroundColor: tabAktif === 'notifikasi' ? c.primer : c.putih,
            borderWidth: 1.2,
            borderColor: tabAktif === 'notifikasi' ? c.primer : c.garisGelap,
            borderRadius: radius.pil,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: tabAktif === 'notifikasi' ? c.putih : c.teks,
            }}
          >
            Notifikasi {belumDibacaCount > 0 ? `(${belumDibacaCount})` : ''}
          </Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 18 }}><Galat pesan={error} /></View>

      {/* Konten Tab Undangan */}
      {tabAktif === 'undangan' && (
        <View style={{ flex: 1 }}>
          <Status
            loading={dUndangan.loading}
            error={dUndangan.error}
            stale={dUndangan.stale}
            adaData={!!dUndangan.data}
            onRetry={dUndangan.reload}
          />

          <FlatList
            data={undanganList}
            keyExtractor={(u) => String(u.id_undangan)}
            contentContainerStyle={[s.isi, { paddingTop: 4 }]}
            refreshing={dUndangan.loading && !!dUndangan.data}
            onRefresh={dUndangan.reload}
            ListHeaderComponent={
              undanganList.length > 0 ? (
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.teks, marginBottom: 10, paddingHorizontal: 4 }}>
                  {menungguCount} undangan menunggu
                </Text>
              ) : null
            }
            ListEmptyComponent={
              !dUndangan.loading && !dUndangan.error ? (
                <View style={[s.kartu, { alignItems: 'center', padding: 24, marginVertical: 20 }]}>
                  <IconMail size={40} color={c.redup} />
                  <Text style={[s.kartuJudul, { textAlign: 'center', marginTop: 10, marginBottom: 6 }]}>Belum ada undangan</Text>
                  <Text style={[s.redup, { textAlign: 'center' }]}>
                    Undangan tim yang ditujukan kepadamu akan muncul di sini.
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item: u }) => (
              <Kartu style={{ marginBottom: 12, padding: 16 }}>
                {/* Header Pengirim & Waktu */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <AvatarInitials nama={u.nama_pengirim || 'Pengirim'} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.serif, fontSize: 18, fontWeight: '700', color: c.teks }}>
                      {u.nama_pengirim}
                    </Text>
                    <Text style={[s.redup, { fontSize: 12.5, marginTop: 2 }]}>
                      {tanggalLokal(u.tanggal_undangan)}
                    </Text>
                  </View>
                </View>

                {/* Nama Tim */}
                <Text style={[s.kartuJudul, { fontSize: 20, marginTop: 2 }]}>
                  {u.nama_tim}
                </Text>

                <Text style={[s.teks, { marginTop: 4, fontWeight: '500' }]}>
                  Peran ditawarkan: <Text style={{ fontWeight: '700' }}>{u.peran_ditawarkan}</Text>
                </Text>

                {!!u.deskripsi && (
                  <Text style={[s.redup, { marginTop: 4 }]} numberOfLines={2}>
                    {u.deskripsi}
                  </Text>
                )}

                <View style={{ marginTop: 10, marginBottom: 6 }}>
                  <StatusBadge status={u.status} />
                </View>

                {/* Tombol Aksi Terima / Tolak */}
                {u.status === 'menunggu' && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Tombol
                        title="Tolak"
                        variant="garis"
                        onPress={() => tolak(u)}
                        disabled={busy}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Tombol
                        title="Terima"
                        icon={<IconCheck size={14} color={c.putih} />}
                        onPress={() => respons(u, 'diterima')}
                        disabled={busy}
                      />
                    </View>
                  </View>
                )}

                {u.status === 'diterima' && (
                  <Text style={[s.redup, { fontSize: 13, marginTop: 4 }]}>
                    Kamu sudah bergabung dalam tim ini.
                  </Text>
                )}

                {u.status === 'ditolak' && (
                  <Text style={[s.redup, { fontSize: 13, marginTop: 4 }]}>
                    Undangan sudah kamu tolak.
                  </Text>
                )}
              </Kartu>
            )}
            ListFooterComponent={
              <Text style={[s.redup, { textAlign: 'center', marginTop: 12, marginBottom: 24, fontSize: 13 }]}>
                Tarik ke bawah atau tekan muat ulang untuk memperbarui.
              </Text>
            }
          />
        </View>
      )}

      {/* Konten Tab Notifikasi */}
      {tabAktif === 'notifikasi' && (
        <View style={{ flex: 1 }}>
          <Status
            loading={dNotifikasi.loading}
            error={dNotifikasi.error}
            stale={dNotifikasi.stale}
            adaData={!!dNotifikasi.data}
            onRetry={dNotifikasi.reload}
          />

          <View style={{ paddingHorizontal: 18, marginBottom: 6 }}>
            {belumDibacaCount > 0 && (
              <Tombol
                title={`Tandai semua dibaca (${belumDibacaCount})`}
                variant="garis"
                disabled={busy}
                onPress={() =>
                  jalankan(async () => {
                    await api.bacaSemua();
                    await dNotifikasi.reload();
                  })
                }
              />
            )}
          </View>

          <FlatList
            data={notifikasiList}
            keyExtractor={(n) => String(n.id_notifikasi)}
            contentContainerStyle={[s.isi, { paddingTop: 4 }]}
            refreshing={dNotifikasi.loading && !!dNotifikasi.data}
            onRefresh={dNotifikasi.reload}
            ListEmptyComponent={
              !dNotifikasi.loading && !dNotifikasi.error ? (
                <View style={[s.kartu, { alignItems: 'center', padding: 24, marginVertical: 20 }]}>
                  <IconBox size={40} color={c.redup} />
                  <Text style={[s.kartuJudul, { textAlign: 'center', marginTop: 10, marginBottom: 6 }]}>Belum ada notifikasi</Text>
                  <Text style={[s.redup, { textAlign: 'center' }]}>
                    Pemberitahuan undangan tim dan kecocokan skill akan muncul di sini.
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item: n }) => {
              const dataParsed = typeof n.data === 'string' ? (() => { try { return JSON.parse(n.data); } catch { return {}; } })() : (n.data || {});
              return (
              <Kartu
                onPress={() => {
                  if (!n.status_dibaca) {
                    jalankan(async () => {
                      await api.bacaNotifikasi(n.id_notifikasi);
                      await dNotifikasi.reload();
                    });
                  }
                  setDetailNotif({ ...n, dataParsed });
                }}
                style={{
                  marginBottom: 10,
                  backgroundColor: n.status_dibaca ? c.putih : '#FBF7F0',
                  borderWidth: n.status_dibaca ? 1 : 1.5,
                  borderColor: n.status_dibaca ? c.garis : c.primer,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  {!n.status_dibaca && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: c.primer,
                        marginTop: 7,
                      }}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        s.teks,
                        !n.status_dibaca && { fontWeight: '700', color: c.teksPrimer },
                        { lineHeight: 21 },
                      ]}
                    >
                      {n.isi}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={[s.redup, { fontSize: 12 }]}>
                        {waktuSingkat(n.waktu)} · Ketuk untuk detail
                      </Text>
                      <IconChevronRight size={14} color={c.redup} />
                    </View>
                  </View>
                </View>
              </Kartu>
            ); }}
          />
        </View>
      )}

      {/* Modal Detail Notifikasi */}
      <Modal visible={!!detailNotif} animationType="slide" transparent onRequestClose={() => setDetailNotif(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }} onPress={() => setDetailNotif(null)}>
          <Pressable style={{ backgroundColor: c.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 34 }} onPress={() => {}}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.garisGelap, alignSelf: 'center', marginBottom: 14 }} />
            <Text style={[s.judulSerif, { fontSize: 20, marginBottom: 4 }]}>Detail notifikasi</Text>
            <Text style={[s.redup, { fontSize: 12.5, marginBottom: 12 }]}>
              {detailNotif ? `${tanggalLokal(detailNotif.waktu)} · ${waktuSingkat(detailNotif.waktu)}` : ''}
            </Text>

            <Kartu style={{ marginBottom: 14 }}>
              <Text style={[s.teks, { lineHeight: 22, fontWeight: '600' }]}>{detailNotif?.isi}</Text>
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: c.garis, gap: 4 }}>
                <Text style={[s.redup, { fontSize: 12.5 }]}>
                  Kategori: {detailNotif?.jenis === 'undangan_tim' ? 'Undangan Tim' : detailNotif?.jenis === 'pesan_diskusi' ? 'Pesan Diskusi' : detailNotif?.jenis === 'kandidat_cocok' ? 'Kandidat Cocok' : detailNotif?.jenis === 'respons_undangan' ? 'Respons Undangan' : detailNotif?.jenis || '-'}
                </Text>
                <Text style={[s.redup, { fontSize: 12.5 }]}>
                  Status: {detailNotif?.status_dibaca ? 'Sudah dibaca' : 'Baru'}
                </Text>
              </View>
            </Kartu>

            {detailNotif?.dataParsed?.id_tim && (
              <View style={{ gap: 10 }}>
                <Tombol
                  title="Masuk ke Tim"
                  icon={<IconUsers size={16} color={c.putih} />}
                  onPress={() => {
                    const idTim = detailNotif.dataParsed.id_tim;
                    setDetailNotif(null);
                    navigation.navigate('TimDetail', { id: idTim });
                  }}
                />
                <Tombol
                  title="Buka Room Chat"
                  variant="garis"
                  icon={<IconChat size={16} color={c.primer} />}
                  onPress={() => {
                    const idTim = detailNotif.dataParsed.id_tim;
                    setDetailNotif(null);
                    navigation.navigate('Diskusi', { id: idTim });
                  }}
                />
              </View>
            )}

            {detailNotif?.jenis === 'undangan_tim' && (
              <Tombol
                title="Buka Tab Undangan"
                variant="garis"
                style={{ marginTop: 10 }}
                onPress={() => {
                  setDetailNotif(null);
                  setTabAktif('undangan');
                }}
              />
            )}

            {detailNotif?.jenis === 'kandidat_cocok' && detailNotif?.dataParsed?.id_users && (
              <Tombol
                title="Lihat Profil Kandidat"
                variant="garis"
                style={{ marginTop: 10 }}
                onPress={() => {
                  const idUser = detailNotif.dataParsed.id_users;
                  setDetailNotif(null);
                  navigation.navigate('KandidatDetail', { id: idUser });
                }}
              />
            )}

            <Tombol
              title="Tutup"
              variant="garis"
              style={{ marginTop: 10 }}
              onPress={() => setDetailNotif(null)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Untuk kompatibilitas backward ekspor nama lama
export const UndanganScreen = KotakScreen;
export const NotifikasiScreen = KotakScreen;
