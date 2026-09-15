/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/04-group-setup` | `/10-home-night` | `/11-alarm-set` | `/12-sleeping` | `/20-alarm` | `/21-morning-card` | `/23-home-dawn` | `/30-group-empty` | `/31-group` | `/32-create` | `/33-join` | `/40-paywall` | `/41-freeze-ok` | `/42-freezes` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
