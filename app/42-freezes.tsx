import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useSleepState } from '../hooks/useStore';
import { usePurchases } from '../hooks/usePurchases';

export default function FreezesSettings() {
  const router = useRouter();
  const { freezesLeft } = useSleepState();
  const { packages, purchaseFreeze, restorePurchases } = usePurchases();

  const handlePurchase = async (identifier: string) => {
    const pkg = packages.find(p => p.product.identifier.includes(identifier));
    if (pkg) {
      await purchaseFreeze(pkg);
    }
  };

  const getPrice = (identifier: string, fallback: string) => {
    const pkg = packages.find(p => p.product.identifier.includes(identifier));
    return pkg?.product.priceString || fallback;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Streak freezes</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceNumber}>{freezesLeft}</Text>
        <Text style={styles.balanceLabel}>left</Text>
      </View>

      <Text style={styles.sectionTitle}>GET MORE</Text>

      <TouchableOpacity 
        style={styles.packageCard} 
        onPress={() => handlePurchase('5_freeze')}
      >
        <View>
          <Text style={styles.packageName}>5 freezes</Text>
          <Text style={styles.packagePrice}>{getPrice('5_freeze', 'Rp 35.000')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.packageCard} 
        onPress={() => handlePurchase('unlimited')}
      >
        <View>
          <Text style={styles.packageName}>Unlimited</Text>
          <Text style={styles.packagePrice}>{getPrice('unlimited', 'Rp 25.000 / month')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.grow} />

      <TouchableOpacity style={styles.restoreButton} onPress={restorePurchases}>
        <Text style={styles.restoreText}>Restore purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dawnBg,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: theme.dawnMuted,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.dawnText,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: theme.dawnSurface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.dawnBorder,
    marginBottom: 40,
  },
  balanceNumber: {
    fontSize: 48,
    fontWeight: '300',
    color: theme.dawnText,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.dawnMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.dawnMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: theme.dawnSurface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.dawnBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.dawnText,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    color: theme.dawnMuted,
  },
  chevron: {
    fontSize: 24,
    color: theme.dawnMuted,
    opacity: 0.5,
  },
  grow: {
    flex: 1,
  },
  restoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  restoreText: {
    color: theme.dawnMuted,
    fontSize: 14,
  },
});
