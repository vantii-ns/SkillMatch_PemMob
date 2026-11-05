import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { c, font, radius, s } from './theme';
import { IconArrowUpRight, IconBack, IconCheck, IconClock, IconClose, IconInfo, IconUsers } from './icons';

export function Tombol({ title, judul, onPress, disabled = false, loading = false, variant = 'primer', icon = null, style = null }) {
  const isGaris = variant === 'garis';
  const isBahaya = variant === 'bahaya';
  const mati = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={mati}
      onPress={onPress}
      style={({ pressed }) => [
        s.tombol,
        isGaris && s.tombolGaris,
        isBahaya && s.tombolBahaya,
        mati && s.disabled,
        pressed && !mati && { opacity: 0.82, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGaris || isBahaya ? c.primer : c.putih} />
      ) : (
        <>
          {icon}
          <Text style={[s.tombolTeks, (isGaris || isBahaya) && { color: c.primer }]}>{title ?? judul}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Input({ label, subLabel, style, ...props }) {
  return (
    <View style={{ marginVertical: 6 }}>
      {!!label && <Text style={s.label}>{label}</Text>}
      {!!subLabel && <Text style={[s.redup, { marginBottom: 6 }]}>{subLabel}</Text>}
      <TextInput
        style={[s.input, style]}
        placeholderTextColor="#8F817B"
        accessibilityLabel={label}
        {...props}
      />
    </View>
  );
}

export function Chip({ teks, aktif = false, ok = false, onPress, disabled = false, icon = null, style = null }) {
  const gaya = [
    s.chip,
    aktif && s.chipAktif,
    ok && s.chipOk,
    disabled && s.disabled,
    style,
  ];

  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {icon}
      <Text style={[s.chipTeks, (aktif || ok) && s.chipTeksAktif]}>{teks}</Text>
    </View>
  );

  if (!onPress) {
    return <View style={gaya}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [gaya, pressed && !disabled && { opacity: 0.8 }]}
    >
      {content}
    </Pressable>
  );
}

export function SkillChips({ skills = [], maks = 99 }) {
  if (!skills.length) return <Text style={s.redup}>Belum ada skill</Text>;
  return (
    <View style={s.baris}>
      {skills.slice(0, maks).map((k) => {
        const terverifikasi = k.status_verifikasi === 'terverifikasi';
        return (
          <Chip
            key={k.id ?? k.nama}
            teks={k.nama}
            aktif={terverifikasi}
            ok={terverifikasi}
            icon={terverifikasi ? <IconCheck size={12} color={c.putih} /> : null}
          />
        );
      })}
      {skills.length > maks && <Text style={s.redup}>+{skills.length - maks}</Text>}
    </View>
  );
}

export function Kartu({ children, onPress, disabled, style = null }) {
  if (!onPress) return <View style={[s.kartu, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.kartu, pressed && !disabled && { opacity: 0.88 }, style]}
    >
      {children}
    </Pressable>
  );
}

// Kartu Tim persis seperti desain di gambar "Tim saya" (Figma)
export function KartuTim({ tim, onPress }) {
  return (
    <Kartu onPress={onPress}>
      <View style={s.pemisah}>
        <Text style={s.kartuJudul}>{tim.nama_tim}</Text>
        <IconArrowUpRight size={22} color={c.primer} />
      </View>
      {!!tim.deskripsi && (
        <Text style={[s.teks, { marginTop: 2, marginBottom: 4 }]} numberOfLines={2}>
          {tim.deskripsi}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 }}>
        <IconUsers size={16} color={c.primer} />
        <Text style={[s.teks, { fontWeight: '500' }]}>
          {tim.jumlah_anggota} anggota · Peranmu: {tim.peran_saya}
        </Text>
      </View>

      <View style={s.garisPemisah} />

      <Text style={{ fontSize: 13, fontWeight: '700', color: c.teks, marginBottom: 8 }}>
        Skill yang dibutuhkan
      </Text>
      {tim.kebutuhan_skill && tim.kebutuhan_skill.length > 0 ? (
        <View style={s.baris}>
          {tim.kebutuhan_skill.map((k) => (
            <Chip key={k} teks={k} />
          ))}
        </View>
      ) : (
        <Text style={s.redup}>Belum ditentukan</Text>
      )}
    </Kartu>
  );
}

// Avatar lingkaran dengan inisial nama
export function AvatarInitials({ nama = 'U', size = 48, style = null }) {
  const inisial = nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.beige,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: font.serif, fontSize: size * 0.42, fontWeight: '700', color: c.teksPrimer }}>
        {inisial || 'U'}
      </Text>
    </View>
  );
}

// Lencana status undangan (Menunggu, Diterima, Ditolak)
export function StatusBadge({ status = 'menunggu' }) {
  if (status === 'diterima') {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: c.primer,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: radius.pil,
      }}>
        <IconCheck size={13} color={c.putih} />
        <Text style={{ color: c.putih, fontSize: 13, fontWeight: '700' }}>Diterima</Text>
      </View>
    );
  }
  if (status === 'ditolak') {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: c.putih,
        borderWidth: 1.2,
        borderColor: c.garisGelap,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: radius.pil,
      }}>
        <IconClose size={12} color={c.redup} />
        <Text style={{ color: c.redup, fontSize: 13, fontWeight: '700' }}>Ditolak</Text>
      </View>
    );
  }
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.statusMenunggu,
      borderWidth: 1,
      borderColor: c.garis,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: radius.pil,
    }}>
      <IconClock size={13} color={c.teks} />
      <Text style={{ color: c.teks, fontSize: 13, fontWeight: '600' }}>Menunggu</Text>
    </View>
  );
}

// Kotak informasi dengan ikon i
export function InfoBox({ teks, style = null }) {
  return (
    <View style={[s.banner, { backgroundColor: c.bgInfo, borderRadius: 16, padding: 14 }, style]}>
      <IconInfo size={18} color={c.primer} />
      <Text style={[s.teks, { flex: 1, fontSize: 13.5, lineHeight: 19 }]}>{teks}</Text>
    </View>
  );
}

// Header layar standar dengan tombol kembali opsional
export function HeaderLayar({ judul, onBack, rightAction, subKategori, keterangan }) {
  return (
    <View style={s.headerLayar}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {!!onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              onPress={onBack}
              hitSlop={12}
              style={{ padding: 4 }}
            >
              <IconBack size={24} color={c.primer} />
            </Pressable>
          )}
          <Text style={s.judulSerif}>{judul}</Text>
        </View>
        {rightAction}
      </View>
      {!!subKategori && <Text style={s.subKategori}>{subKategori}</Text>}
      {!!keterangan && <Text style={s.keterangan}>{keterangan}</Text>}
    </View>
  );
}

// Status layar (Loading, Galat, Data Offline)
export function Status({ loading, error, stale, adaData, onRetry }) {
  if (loading && !adaData) {
    return (
      <View style={s.pusat}>
        <ActivityIndicator size="large" color={c.primer} accessibilityLabel="Memuat data" />
        <Text style={[s.redup, { marginTop: 8 }]}>Memuat data...</Text>
      </View>
    );
  }
  if (error && !adaData) {
    return (
      <View style={s.pusat}>
        <Text accessibilityRole="alert" style={s.error}>{error}</Text>
        <Tombol title="Coba lagi" onPress={onRetry} variant="garis" />
      </View>
    );
  }
  if (stale && error) {
    return (
      <View style={s.banner}>
        <IconInfo size={16} color={c.primer} />
        <Text style={[s.teks, { flex: 1, fontSize: 13 }]}>
          Mode offline: menampilkan data tersimpan. {error}
        </Text>
      </View>
    );
  }
  return null;
}

export const Galat = ({ pesan }) => {
  if (!pesan) return null;
  return (
    <View style={[s.banner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
      <Text accessibilityRole="alert" style={[s.error, { marginVertical: 0 }]}>{pesan}</Text>
    </View>
  );
};

export function Halaman({ children, onRefresh, refreshing = false, style = null }) {
  return (
    <ScrollView
      style={[s.halaman, style]}
      contentContainerStyle={s.isi}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primer} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}
