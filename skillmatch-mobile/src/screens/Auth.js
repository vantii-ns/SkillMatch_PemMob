import { useState } from 'react';
import { Text, View } from 'react-native';
import { Chip, Galat, Halaman, Input, Tombol } from '../components';
import { useAuth } from '../AuthContext';
import { useAksi } from '../hooks';
import { PERAN, validasiLogin, validasiRegister } from '../helpers';
import { s } from '../theme';

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { busy, error, setError, jalankan } = useAksi();

  async function masuk() {
    const pesan = validasiLogin(email, password);
    if (pesan) { setError(pesan); return; }
    await jalankan(() => login(email.trim(), password));
  }

  return (
    <Halaman>
      <Text style={s.judul}>SkillMatch</Text>
      <Text style={s.redup}>Temukan rekan tim dengan kemampuan yang terbukti.</Text>
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address"
        autoCapitalize="none" autoCorrect={false} editable={!busy} placeholder="nama@email.com" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry
        editable={!busy} placeholder="Password" />
      <Galat pesan={error} />
      <Tombol title={busy ? 'Memproses...' : 'Masuk'} onPress={masuk} disabled={busy} />
      <Tombol title="Belum punya akun? Daftar" variant="garis" onPress={() => navigation.navigate('Register')} disabled={busy} />
    </Halaman>
  );
}

export function RegisterScreen() {
  const { register } = useAuth();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [peran, setPeran] = useState('developer');
  const { busy, error, setError, jalankan } = useAksi();

  async function daftar() {
    const pesan = validasiRegister(nama, email, password);
    if (pesan) { setError(pesan); return; }
    await jalankan(() => register({ nama: nama.trim(), email: email.trim(), password, peran_utama: peran }));
  }

  return (
    <Halaman>
      <Input label="Nama lengkap" value={nama} onChangeText={setNama} editable={!busy} maxLength={100} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address"
        autoCapitalize="none" autoCorrect={false} editable={!busy} />
      <Input label="Password (minimal 8 karakter)" value={password} onChangeText={setPassword}
        secureTextEntry editable={!busy} />
      <Text style={s.label}>Peran utama</Text>
      <PeranPilihan nilai={peran} onPilih={setPeran} disabled={busy} />
      <Galat pesan={error} />
      <Tombol title={busy ? 'Memproses...' : 'Daftar'} onPress={daftar} disabled={busy} />
    </Halaman>
  );
}

export function PeranPilihan({ nilai, onPilih, disabled }) {
  return (
    <View style={s.baris}>
      {PERAN.map((p) => (
        <Chip key={p.id} teks={p.label} aktif={nilai === p.id} onPress={() => onPilih(p.id)} disabled={disabled} />
      ))}
    </View>
  );
}
