import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { palettes, layout } from '../constants/tokens';
import { useFreezes, useStreak } from '../hooks/useStore';
import { usePurchases } from '../hooks/usePurchases';
import { Icon } from '../components/Icon';
import { Body, Button, Caption, Card, HeadingM, LinkButton } from '../components/ui';

/**
 * Fires when the streak is genuinely minutes from breaking — never at install,
 * never on a timer. The copy tells the user to use a freeze and go to sleep: an
 * app about sleep that keeps you awake selling things has lost the plot.
 */
export default function Paywall() {
  const router = useRouter();
  const palette = palettes.night;
  const { current, minutesLeft } = useStreak();
  const { freezesLeft } = useFreezes();
  const { packages, purchaseFreeze } = usePurchases();
  const [busy, setBusy] = useState(false);

  const single = packages.find((p) => p.product.identifier.includes('1_freeze'));
  const price = single?.product.priceString ?? 'Rp 9.000';

  const handleUse = async () => {
    // A freeze already on the shelf is used without a paywall transaction.
    if (freezesLeft > 0) {
      router.replace('/41-freeze-ok');
      return;
    }
    if (!single) return;
    setBusy(true);
    const bought = await purchaseFreeze(single);
    setBusy(false);
    if (bought) router.replace('/41-freeze-ok');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={() => router.back()} />
      <View style={[styles.sheet, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={{ alignItems: 'center' }}>
          <Icon name="freeze" size={44} color={palette.text} />
          <HeadingM palette={palette} style={{ marginTop: 14, textAlign: 'center' }}>
            Your {current} nights end{'\n'}in {Math.max(minutesLeft, 1)} minutes
          </HeadingM>
          <Body palette={palette} muted style={{ marginTop: 9, textAlign: 'center' }}>
            A freeze keeps the streak alive for one night. Use it and go to sleep.
          </Body>
        </View>

        <Card palette={palette} style={styles.priceRow}>
          <View>
            <Body palette={palette}>1 streak freeze</Body>
            <Caption palette={palette}>One night</Caption>
          </View>
          {/* Price is visible before the tap, always. */}
          <Body palette={palette} style={{ fontWeight: '600' }}>
            {freezesLeft > 0 ? `${freezesLeft} left` : price}
          </Body>
        </Card>

        <Button
          label={busy ? 'Talking to the store' : 'Use a freeze'}
          palette={palette}
          disabled={busy || (freezesLeft === 0 && !single)}
          onPress={handleUse}
          style={{ marginTop: 12 }}
        />
        {freezesLeft === 0 && !single && (
          <Caption palette={palette} style={{ textAlign: 'center', marginTop: 8 }}>
            The store is not reachable right now. Tonight is still yours until the window closes.
          </Caption>
        )}
        <LinkButton label="Not tonight" palette={palette} onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: layout.scrim,
  },
  sheet: {
    borderTopLeftRadius: layout.sheetRadius,
    borderTopRightRadius: layout.sheetRadius,
    borderTopWidth: 1,
    padding: 18,
    paddingBottom: 26,
  },
  priceRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
