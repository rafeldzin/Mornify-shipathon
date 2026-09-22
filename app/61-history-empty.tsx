import { Redirect } from 'expo-router';

/**
 * The empty state lives inside 60-history, so the list and its first-run copy
 * never drift apart. This route exists so the design ID stays reachable.
 */
export default function HistoryEmpty() {
  return <Redirect href="/60-history" />;
}
