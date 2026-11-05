import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Chip, Galat, Halaman, InfoBox, Tombol } from '../components';
import { useAuth } from '../AuthContext';
import { useAksi } from '../hooks';
import { PERAN, validasiLogin, validasiRegister } from '../helpers';
import { c, font, radius, s } from '../theme';
import {
  IconBack,
  IconEye,
  IconEyeOff,
  IconInfo,
  IconMail,
  IconSchool,
  IconUser,
  SkillMatchWordmark,
} from '../icons';
export function PeranPilihan({ nilai, onPilih, disabled = false }) {
  return (
    <View style={s.baris}>
      {PERAN.map((p) => (
        <Chip
          key={p.id}
          teks={p.label}
          aktif={nilai === p.id}
          disabled={disabled}
          onPress={() => onPilih(p.id)}
        />
      ))}
    </View>
  );
}
export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lihatPass, setLihatPass] = useState(false);
  const { busy, error, setError, jalankan } = useAksi();

  async function masuk() {
    const pesan = validasiLogin(email, password);
    if (pesan) { setError(pesan); return; }
    await jalankan(() => login(email.trim(), password));
  }

  return (
    <Halaman>
      {/* Top Header Logo Brand persis Figma login.pdf */}
      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <SkillMatchWordmark width={140} height={32} />
      </View>

      {/* Hero Card Burgundy Figma */}
      <View
        style={{
          backgroundColor: c.primer,
          borderRadius: 24,
          padding: 22,
          marginBottom: 22,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            borderWidth: 1.2,
            borderColor: '#A78E75',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <IconSchool size={24} color="#E8D9C8" />
        </View>
        <Text
          style={{
            fontFamily: font.serif,
            fontSize: 23,
            fontWeight: '700',
            color: c.putih,
            lineHeight: 30,
            marginBottom: 8,
          }}
        >
          Ide hebat dimulai dari rekan yang tepat.
        </Text>
        <Text style={{ fontSize: 14, color: '#E8D9C8', lineHeight: 21 }}>
          Temukan rekan untuk lomba, tugas kuliah, dan karya bersama.
        </Text>
      </View>

      {/* Sub-header */}
      <Text style={s.subKategori}>SELAMAT DATANG KEMBALI</Text>
      <Text style={[s.judulSerif, { fontSize: 24, marginBottom: 14 }]}>
        Masuk ke ruang kolaborasi.
      </Text>

      {/* Form Input Email & Password */}
      <View style={{ gap: 14 }}>
        <View>
          <Text style={s.label}>Email</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: c.putih,
              borderWidth: 1.2,
              borderColor: c.garisGelap,
              borderRadius: radius.input,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: c.teks }}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="nabila.putri@kampus.ac.id"
              placeholderTextColor={c.redup}
            />
            <IconMail size={18} color="#A78E75" />
          </View>
        </View>

        <View>
          <Text style={s.label}>Kata sandi</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: c.putih,
              borderWidth: 1.2,
              borderColor: c.garisGelap,
              borderRadius: radius.input,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: c.teks }}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!lihatPass}
              placeholder="••••••••••"
              placeholderTextColor={c.redup}
            />
            <Pressable onPress={() => setLihatPass(!lihatPass)} hitSlop={10}>
              {lihatPass ? (
                <IconEye size={18} color="#A78E75" />
              ) : (
                <IconEyeOff size={18} color="#A78E75" />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <Galat pesan={error} />

      {/* Tombol Masuk */}
      <Tombol
        judul="→ Masuk"
        onPress={masuk}
        loading={busy}
        style={{ marginTop: 18 }}
      />

      {/* Tautan Daftar */}
      <View style={{ alignItems: 'center', marginTop: 16, gap: 6 }}>
        <Text style={{ color: c.teks, fontSize: 14 }}>Belum punya akun?</Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: c.primer, fontWeight: '700', fontSize: 15 }}>
            Daftar sekarang
          </Text>
        </Pressable>
      </View>

      {/* Tagline Bawah */}
      <View style={{ alignItems: 'center', marginTop: 36, marginBottom: 12 }}>
        <Text style={{ color: c.redup, fontSize: 13, fontStyle: 'italic' }}>
          Skill nyata. Rekan sejalan. Karya bersama.
        </Text>
      </View>
    </Halaman>
  );
}

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [peranUtama, setPeranUtama] = useState('desainer');
  const [lihatPass, setLihatPass] = useState(false);
  const { busy, error, setError, jalankan } = useAksi();

  async function daftar() {
    const pesan = validasiRegister(nama, email, password, peranUtama);
    if (pesan) { setError(pesan); return; }
    await jalankan(() => register({
      nama: nama.trim(),
      email: email.trim(),
      password,
      peran_utama: peranUtama,
    }));
  }
  return (
    <Halaman>
      {/* Header dengan Tombol Kembali & Logo Brand */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 16 }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <IconBack size={24} color={c.primer} />
        </Pressable>
        <SkillMatchWordmark width={130} height={30} />
      </View>

      {/* Sub-header Mulai Perjalananmu */}
      <Text style={s.subKategori}>MULAI PERJALANANMU</Text>
      <Text style={[s.judulSerif, { fontSize: 24, marginBottom: 8 }]}>
        Satu profil, banyak peluang.
      </Text>
      <Text style={[s.keterangan, { marginBottom: 16 }]}>
        Kenalkan dirimu dan temukan rekan untuk mewujudkan ide berikutnya.
      </Text>

      {/* Input Nama Lengkap */}
      <View style={{ gap: 14 }}>
        <View>
          <Text style={s.label}>Nama lengkap</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: c.putih,
              borderWidth: 1.2,
              borderColor: c.garisGelap,
              borderRadius: radius.input,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: c.teks }}
              value={nama}
              onChangeText={setNama}
              placeholder="Nabila Putri"
              placeholderTextColor={c.redup}
            />
            <IconUser size={18} color="#A78E75" />
          </View>
        </View>

        {/* Input Email */}
        <View>
          <Text style={s.label}>Email</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: c.putih,
              borderWidth: 1.2,
              borderColor: c.garisGelap,
              borderRadius: radius.input,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: c.teks }}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="nabila.putri@kampus.ac.id"
              placeholderTextColor={c.redup}
            />
            <IconMail size={18} color="#A78E75" />
          </View>
        </View>

        {/* Input Kata Sandi */}
        <View>
          <Text style={s.label}>Kata sandi</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: c.putih,
              borderWidth: 1.2,
              borderColor: c.garisGelap,
              borderRadius: radius.input,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: c.teks }}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!lihatPass}
              placeholder="••••••••••"
              placeholderTextColor={c.redup}
            />
            <Pressable onPress={() => setLihatPass(!lihatPass)} hitSlop={10}>
              {lihatPass ? (
                <IconEye size={18} color="#A78E75" />
              ) : (
                <IconEyeOff size={18} color="#A78E75" />
              )}
            </Pressable>
          </View>
          <Text style={{ fontSize: 12.5, color: c.redup, marginTop: 4 }}>
            Gunakan minimal 8 karakter.
          </Text>
        </View>

        {/* Pemilihan Peran Utama */}
        <View>
          <Text style={s.label}>Peran utama</Text>
          <PeranPilihan nilai={peranUtama} onPilih={setPeranUtama} />
        </View>
      </View>

      {/* Info Box Peran & Skill */}
      <View
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: radius.input,
          backgroundColor: c.putih,
          borderWidth: 1,
          borderColor: c.garisGelap,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <IconInfo size={18} color={c.primer} />
        <Text style={{ flex: 1, fontSize: 13, color: c.teks, lineHeight: 18 }}>
          Peran dan skill bisa kamu ubah nanti melalui profil.
        </Text>
      </View>

      <Galat pesan={error} />

      {/* Tombol Buat Akun */}
      <Tombol
        judul="→ Buat akun"
        onPress={daftar}
        loading={busy}
        style={{ marginTop: 18 }}
      />

      {/* Tautan Sudah punya akun? */}
      <View style={{ alignItems: 'center', marginTop: 14, marginBottom: 20, gap: 6 }}>
        <Text style={{ color: c.teks, fontSize: 14 }}>Sudah punya akun?</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: c.primer, fontWeight: '700', fontSize: 15 }}>
            Masuk
          </Text>
        </Pressable>
      </View>
    </Halaman>
  );
}
