import { Redirect } from 'expo-router';

/**
 * 10-home-night and 23-home-dawn are one route: the palette swaps on time of
 * day. This file only exists so links written against the design IDs keep
 * working — there is nothing to maintain here.
 */
export default function HomeDawn() {
  return <Redirect href="/10-home-night" />;
}
