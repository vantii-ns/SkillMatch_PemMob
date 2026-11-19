import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/AuthContext';
import { NotifikasiProvider } from './src/NotifikasiContext';
import Navigasi from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotifikasiProvider>
          <Navigasi />
          <StatusBar style="dark" />
        </NotifikasiProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
