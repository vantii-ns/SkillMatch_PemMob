import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useNotifikasi, notifikasiNavRef } from './NotifikasiContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { c, radius } from './theme';
import { IconBox, IconSearch, IconUser, IconUsers, SkillMatchLogo } from './icons';
import { LoginScreen, RegisterScreen, LupaPasswordScreen, VerifikasiKodeScreen, ResetPasswordScreen } from './screens/Auth';
import { CariScreen, KandidatDetailScreen, UndangScreen } from './screens/Cari';
import { DiskusiScreen, TimDetailScreen, TimFormScreen, TimListScreen } from './screens/Tim';
import { KotakScreen } from './screens/Kotak';
import { EditProfilScreen, PilihSkillScreen, PortofolioScreen, ProfilScreen } from './screens/Profil';

export const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Bottom Tab Bar yang persis mengikuti desain Figma
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: c.putih,
        borderTopWidth: 1,
        borderColor: c.garis,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let label = route.name;
        let renderIcon = (color) => null;

        if (route.name === 'Cari') {
          label = 'Cari';
          renderIcon = (color) => <IconSearch size={20} color={color} />;
        } else if (route.name === 'Tim') {
          label = 'Tim';
          renderIcon = (color) => <IconUsers size={20} color={color} />;
        } else if (route.name === 'Kotak') {
          label = 'Kotak';
          renderIcon = (color) => <IconBox size={20} color={color} />;
        } else if (route.name === 'Profil') {
          label = 'Profil';
          renderIcon = (color) => <IconUser size={20} color={color} />;
        }

        if (isFocused) {
          // Tab aktif: kapsul/pil burgundy dengan teks dan ikon putih (Figma)
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: true }}
              onPress={onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: c.primer,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: radius.pil,
              }}
            >
              {renderIcon(c.putih)}
              <Text style={{ color: c.putih, fontSize: 14, fontWeight: '700' }}>
                {label}
              </Text>
            </Pressable>
          );
        }

        // Tab tidak aktif: ikon di atas, label di bawah
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
            onPress={onPress}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 6,
              paddingHorizontal: 12,
              minWidth: 50,
            }}
          >
            {renderIcon(c.primer)}
            <Text style={{ color: c.primer, fontSize: 11.5, fontWeight: '600', marginTop: 4 }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Cari" component={CariScreen} />
      <Tab.Screen name="Tim" component={TimListScreen} />
      <Tab.Screen name="Kotak" component={KotakScreen} />
      <Tab.Screen name="Profil" component={ProfilScreen} />
    </Tab.Navigator>
  );
}

export default function Navigasi() {
  const { token, booting } = useAuth();

  if (booting) {
    // Splash screen persis seperti logo.pdf
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SkillMatchLogo width={260} height={220} />
        <ActivityIndicator size="small" color={c.primer} style={{ marginTop: 28 }} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        notifikasiNavRef.navigate = (name, params) => {
          if (navigationRef.isReady()) {
            navigationRef.navigate(name, params);
          }
        };
      }}
    >
      {token ? (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="Utama" component={Tabs} />
          <Stack.Screen name="KandidatDetail" component={KandidatDetailScreen} />
          <Stack.Screen name="Undang" component={UndangScreen} />
          <Stack.Screen name="TimForm" component={TimFormScreen} />
          <Stack.Screen name="TimDetail" component={TimDetailScreen} />
          <Stack.Screen name="Diskusi" component={DiskusiScreen} />
          <Stack.Screen name="EditProfil" component={EditProfilScreen} />
          <Stack.Screen name="PilihSkill" component={PilihSkillScreen} />
          <Stack.Screen name="Portofolio" component={PortofolioScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="LupaPassword" component={LupaPasswordScreen} />
          <Stack.Screen name="VerifikasiKode" component={VerifikasiKodeScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
