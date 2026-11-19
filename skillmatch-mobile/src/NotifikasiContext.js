import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { api } from './api';
import { c, font, radius } from './theme';
import { IconBell, IconClose, IconArrowRight } from './icons';

const NotifikasiContext = createContext({
  jumlahBelumDibaca: 0,
  muatNotifikasi: async () => {},
});

export const useNotifikasi = () => useContext(NotifikasiContext);

// Navigation ref global untuk bisa navigasi dari popup
export const notifikasiNavRef = {
  navigate: null,
};

export function NotifikasiProvider({ children }) {
  const { token, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [jumlahBelumDibaca, setJumlahBelumDibaca] = useState(0);
  const [popupAktif, setPopupAktif] = useState(null);

  // Animasi pop-up slide down dari atas
  const animY = useRef(new Animated.Value(-150)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const timerDismiss = useRef(null);
  const idTerkonfirmasi = useRef(new Set());
  const inisialRef = useRef(false);

  const tutupPopup = useCallback(() => {
    if (timerDismiss.current) clearTimeout(timerDismiss.current);
    Animated.parallel([
      Animated.timing(animY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPopupAktif(null);
    });
  }, [animY, animOpacity]);

  const munculkanPopup = useCallback((notif) => {
    if (timerDismiss.current) clearTimeout(timerDismiss.current);
    setPopupAktif(notif);

    Animated.parallel([
      Animated.timing(animY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss dalam 6 detik
    timerDismiss.current = setTimeout(() => {
      tutupPopup();
    }, 6000);
  }, [animY, animOpacity, tutupPopup]);

  const periksaNotifikasi = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.notifikasi();
      if (!Array.isArray(data)) return;

      const belumDibaca = data.filter((n) => !n.status_dibaca);
      setJumlahBelumDibaca(belumDibaca.length);

      // Pertama kali load, catat semua id yang ada agar tidak spam pop up riwayat lama
      if (!inisialRef.current) {
        data.forEach((n) => idTerkonfirmasi.current.add(n.id_notifikasi));
        inisialRef.current = true;
        return;
      }

      // Cari notifikasi baru yang belum pernah dilihat dalam sesi ini
      const notifBaru = data.find((n) => !n.status_dibaca && !idTerkonfirmasi.current.has(n.id_notifikasi));

      if (notifBaru) {
        idTerkonfirmasi.current.add(notifBaru.id_notifikasi);
        munculkanPopup(notifBaru);
      }
    } catch {
      // Abaikan jika network sementara gagal
    }
  }, [token, munculkanPopup]);

  // Polling setiap 4 detik saat pengguna aktif login
  useEffect(() => {
    if (!token) {
      setJumlahBelumDibaca(0);
      setPopupAktif(null);
      inisialRef.current = false;
      idTerkonfirmasi.current.clear();
      return;
    }

    periksaNotifikasi();
    const interval = setInterval(periksaNotifikasi, 4000);
    return () => clearInterval(interval);
  }, [token, periksaNotifikasi]);

  const aksiBuka = useCallback(async () => {
    if (!popupAktif) return;
    const item = popupAktif;
    tutupPopup();

    // Tandai sudah dibaca di backend
    try {
      await api.bacaNotifikasi(item.id_notifikasi);
      setJumlahBelumDibaca((prev) => Math.max(0, prev - 1));
    } catch {
      // Abaikan
    }

    // Arahkan navigasi ke tujuan
    if (notifikasiNavRef.navigate) {
      if (item.jenis === 'pesan_diskusi' && item.data?.id_tim) {
        const idTimNum = Number(item.data.id_tim);
        notifikasiNavRef.navigate('Diskusi', { id: idTimNum, id_tim: idTimNum, nama: 'Diskusi Tim' });
      } else {
        notifikasiNavRef.navigate('Kotak');
      }
    }
  }, [popupAktif, tutupPopup]);

  // Label & ikon berdasarkan jenis notifikasi
  const judulJenis = (() => {
    if (!popupAktif) return 'Notifikasi';
    switch (popupAktif.jenis) {
      case 'undangan_tim':
        return 'Undangan Tim Masuk';
      case 'pesan_diskusi':
        return 'Pesan Diskusi Baru';
      case 'respons_undangan':
        return 'Status Undangan';
      case 'kandidat_cocok':
        return 'Kandidat Cocok Ditemukan';
      default:
        return 'Notifikasi Baru';
    }
  })();

  return (
    <NotifikasiContext.Provider value={{ jumlahBelumDibaca, muatNotifikasi: periksaNotifikasi }}>
      {children}

      {/* Floating Pop-up Banner Notification */}
      {popupAktif && (
        <Animated.View
          style={[
            styles.popupContainer,
            {
              top: Math.max(insets.top, 14) + 6,
              transform: [{ translateY: animY }],
              opacity: animOpacity,
            },
          ]}
        >
          <Pressable
            accessibilityRole="alert"
            onPress={aksiBuka}
            style={({ pressed }) => [
              styles.popupCard,
              pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
          >
            {/* Header Pop-up */}
            <View style={styles.headerBar}>
              <View style={styles.badgeLabel}>
                <IconBell size={14} color={c.putih} />
                <Text style={styles.badgeText}>{judulJenis}</Text>
              </View>

              <Pressable
                hitSlop={10}
                onPress={(e) => {
                  e.stopPropagation?.();
                  tutupPopup();
                }}
                style={styles.closeBtn}
              >
                <IconClose size={16} color={c.redup} />
              </Pressable>
            </View>

            {/* Isi Pesan Pop-up */}
            <Text style={styles.isiPesan} numberOfLines={2}>
              {popupAktif.isi}
            </Text>

            {/* Tombol Aksi "Lihat" */}
            <View style={styles.footerBar}>
              <Text style={styles.tapPrompt}>Ketuk untuk membuka</Text>
              <View style={styles.tombolBuka}>
                <Text style={styles.tombolBukaTeks}>Lihat</Text>
                <IconArrowRight size={12} color={c.primer} />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </NotifikasiContext.Provider>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  popupCard: {
    backgroundColor: c.putih,
    borderRadius: radius.kartu,
    borderWidth: 1.5,
    borderColor: c.primer,
    padding: 14,
    gap: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.primer,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pil,
  },
  badgeText: {
    color: c.putih,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F3EFE9',
  },
  isiPesan: {
    fontSize: 14,
    color: c.teks,
    fontWeight: '600',
    lineHeight: 20,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: c.garis,
  },
  tapPrompt: {
    fontSize: 12,
    color: c.redup,
  },
  tombolBuka: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tombolBukaTeks: {
    fontSize: 13,
    fontWeight: '700',
    color: c.primer,
  },
});

