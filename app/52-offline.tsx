import { Redirect } from 'expo-router';

/**
 * Offline is a state of the morning card, not a separate screen: the banner,
 * the greyed group panel and "counted locally" all live in 21-morning-card so
 * there is one card to maintain. This route forces that state for testing.
 */
export default function Offline() {
  return <Redirect href="/21-morning-card?offline=1" />;
}
