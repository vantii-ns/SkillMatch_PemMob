import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { c, s } from './theme';

export function Tombol({ title, onPress, disabled = false, variant = 'primer' }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={[s.tombol, variant === 'garis' && s.tombolGaris, variant === 'bahaya' && s.tombolBahaya, disabled && s.disabled]}>
      <Text style={[s.tombolTeks, variant === 'garis' && { color: c.primer }]}>{title}</Text>
    </Pressable>
  );
}

export function Input({ label, ...props }) {
  return (
    <View>
      {!!label && <Text style={s.label}>{label}</Text>}
      <TextInput style={s.input} placeholderTextColor="#94A3B8" accessibilityLabel={label} {...props} />
    </View>
  );
}

export function Chip({ teks, aktif = false, ok = false, onPress, disabled }) {
  const gaya = [s.chip, aktif && s.chipAktif, ok && s.chipOk];
  if (!onPress) return <View style={gaya}><Text style={s.chipTeks}>{teks}</Text></View>;
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={gaya}>
      <Text style={s.chipTeks}>{teks}</Text>
    </Pressable>
  );
}

export function SkillChips({ skills = [], maks = 99 }) {
  if (!skills.length) return <Text style={s.redup}>Belum ada skill</Text>;
  return (
    <View style={s.baris}>
      {skills.slice(0, maks).map((k) => (
        <Chip key={k.id ?? k.nama} teks={`${k.nama}${k.status_verifikasi === 'terverifikasi' ? ' ✓' : ''}`}
          ok={k.status_verifikasi === 'terverifikasi'} />
      ))}
      {skills.length > maks && <Text style={s.redup}>+{skills.length - maks}</Text>}
    </View>
  );
}

export function Kartu({ children, onPress, disabled }) {
  if (!onPress) return <View style={s.kartu}>{children}</View>;
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={s.kartu}>{children}</Pressable>;
}

// Menampilkan keadaan loading / error / data lama (offline) di atas isi layar
export function Status({ loading, error, stale, adaData, onRetry }) {
  if (loading && !adaData) return <View style={s.pusat}><ActivityIndicator accessibilityLabel="Memuat data" /></View>;
  if (error && !adaData) {
    return (
      <View style={s.pusat}>
        <Text accessibilityRole="alert" style={s.error}>{error}</Text>
        <Tombol title="Coba lagi" onPress={onRetry} />
      </View>
    );
  }
  if (stale && error) {
    return <View style={s.banner}><Text style={s.teks}>Mode offline: menampilkan data tersimpan. {error}</Text></View>;
  }
  return null;
}

export const Galat = ({ pesan }) => (pesan ? <Text accessibilityRole="alert" style={s.error}>{pesan}</Text> : null);

export function Halaman({ children, onRefresh, refreshing = false }) {
  return (
    <ScrollView style={s.halaman} contentContainerStyle={s.isi} keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}>
      {children}
    </ScrollView>
  );
}
