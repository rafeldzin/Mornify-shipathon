import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { usePurchases } from '../hooks/usePurchases';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRef, useMemo } from 'react';

export default function Paywall() {
  const router = useRouter();
  const { streak } = useSleepState();
  const { packages, purchaseFreeze } = usePurchases();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%'], []);

  const handlePurchase = async () => {
    // Attempt to buy the 1-freeze package
    const singleFreezePkg = packages.find(p => p.product.identifier.includes('1_freeze'));
    if (singleFreezePkg) {
      const success = await purchaseFreeze(singleFreezePkg);
      if (success) {
        router.replace('/41-freeze-ok');
      }
    } else {
      // Fallback for hackathon demo if RevenueCat fails to fetch
      router.replace('/41-freeze-ok');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={() => router.back()} 
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => router.back()}
        backgroundStyle={{ backgroundColor: theme.nightSurface }}
        handleIndicatorStyle={{ backgroundColor: theme.nightMuted }}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>❄️</Text>
          </View>
          
          <Text style={styles.title}>Your {streak} nights end{'\n'}in 8 minutes</Text>
          <Text style={styles.subtitle}>
            A freeze keeps the streak alive for one night. Use it and go to sleep.
          </Text>

          <View style={styles.priceCard}>
            <View>
              <Text style={styles.packageName}>1 streak freeze</Text>
              <Text style={styles.packageDesc}>One night</Text>
            </View>
            <Text style={styles.priceText}>
              {packages.find(p => p.product.identifier.includes('1_freeze'))?.product.priceString || 'Rp 9.000'}
            </Text>
          </View>

          <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
            <Text style={styles.buyButtonText}>Use a freeze</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Not tonight</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,17,32,0.55)',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.nightBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.nightText,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: theme.nightText,
    opacity: 0.72,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  priceCard: {
    width: '100%',
    backgroundColor: theme.nightBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.nightBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  packageName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.nightText,
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 12,
    color: theme.nightMuted,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.nightText,
  },
  buyButton: {
    backgroundColor: theme.nightAccent,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: theme.nightMuted,
    fontSize: 14,
  },
});
