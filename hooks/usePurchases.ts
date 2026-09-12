import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSleepState } from './useStore';
import { useGroup } from './useGroup';
import { supabase } from '../lib/supabase';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY || 'placeholder_ios',
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY || 'placeholder_android',
});

export function usePurchases() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const { addFreezes, freezesLeft } = useSleepState();
  const { userId } = useGroup();

  useEffect(() => {
    const init = async () => {
      if (!API_KEY) return;
      
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      if (userId) {
        await Purchases.configure({ apiKey: API_KEY, appUserID: userId });
      } else {
        await Purchases.configure({ apiKey: API_KEY });
      }

      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [userId]);

  const syncFreezesToSupabase = async (newAmount: number) => {
    if (!userId) return;
    await supabase.from('streaks').upsert({ user_id: userId, freezes_left: newAmount });
  };

  const purchaseFreeze = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      let newAmount = freezesLeft;
      if (pkg.product.identifier.includes('1_freeze')) {
        newAmount = addFreezes(1);
      } else if (pkg.product.identifier.includes('5_freeze')) {
        newAmount = addFreezes(5);
      } else if (pkg.product.identifier.includes('unlimited')) {
        newAmount = addFreezes(999);
      }
      await syncFreezesToSupabase(newAmount);
      return true;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error(e);
      }
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['unlimited_freezes']) {
         const newAmount = addFreezes(999);
         await syncFreezesToSupabase(newAmount);
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  return { packages, purchaseFreeze, restorePurchases };
}
