import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './AuthContext';
import { c } from './theme';
import { LoginScreen, RegisterScreen } from './screens/Auth';
import { CariScreen, KandidatDetailScreen, UndangScreen } from './screens/Cari';
import { DiskusiScreen, TimDetailScreen, TimFormScreen, TimListScreen } from './screens/Tim';
import { NotifikasiScreen, UndanganScreen } from './screens/Kotak';
import { EditProfilScreen, PilihSkillScreen, PortofolioScreen, ProfilScreen } from './screens/Profil';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const header = {
  headerStyle: { backgroundColor: c.primer }, headerTintColor: c.putih, headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: c.bg },
};
const ikon = (emoji) => ({ tabBarIcon: () => <Text style={{ fontSize: 18 }}>{emoji}</Text> });

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ ...header, tabBarActiveTintColor: c.primer }}>
      <Tab.Screen name="Cari" component={CariScreen} options={{ title: 'Cari Rekan', ...ikon('🔎') }} />
      <Tab.Screen name="Tim" component={TimListScreen} options={{ title: 'Tim Saya', ...ikon('👥') }} />
      <Tab.Screen name="Undangan" component={UndanganScreen} options={ikon('✉️')} />
      <Tab.Screen name="Notifikasi" component={NotifikasiScreen} options={ikon('🔔')} />
      <Tab.Screen name="Profil" component={ProfilScreen} options={{ title: 'Profil Saya', ...ikon('👤') }} />
    </Tab.Navigator>
  );
}

export default function Navigasi() {
  const { token, booting } = useAuth();
  if (booting) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Memuat" /></View>;
  return (
    <NavigationContainer>
      {token ? (
        <Stack.Navigator screenOptions={header}>
          <Stack.Screen name="Utama" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="KandidatDetail" component={KandidatDetailScreen} options={({ route }) => ({ title: route.params?.nama || 'Profil Kandidat' })} />
          <Stack.Screen name="Undang" component={UndangScreen} options={{ title: 'Undang ke Tim' }} />
          <Stack.Screen name="TimForm" component={TimFormScreen} options={({ route }) => ({ title: route.params?.tim ? 'Ubah Tim' : 'Buat Tim' })} />
          <Stack.Screen name="TimDetail" component={TimDetailScreen} options={({ route }) => ({ title: route.params?.nama || 'Detail Tim' })} />
          <Stack.Screen name="Diskusi" component={DiskusiScreen} options={({ route }) => ({ title: `Diskusi: ${route.params?.nama || ''}` })} />
          <Stack.Screen name="EditProfil" component={EditProfilScreen} options={{ title: 'Ubah Profil' }} />
          <Stack.Screen name="PilihSkill" component={PilihSkillScreen} options={{ title: 'Pilih Skill' }} />
          <Stack.Screen name="Portofolio" component={PortofolioScreen} options={{ title: 'Portofolio' }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={header}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Masuk' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
