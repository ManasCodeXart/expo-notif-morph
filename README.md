# expo-notif-morph

A notification bell that unfolds into a notification tray, then reshapes itself into a profile card and a reply composer — all inside one measured, morphing container.



<img width="800" height="600" alt="km_20261104_1080p_60f_20261104_113202-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/a3a76fe1-8390-43ae-bc4c-5c0ccb25b09f" />




---

## ✨ Features

- 🔔 **Bell-to-tray morph** — the badge grows into the notification tray while its width, height, corner radius, and the bell's fade/scale animate from shared values.
- 🗂️ **Three-row preview** — the tray viewport is built from the first three measured notification rows, so the remaining rows scroll without resizing the card.
- 👤 **Tray-to-profile morph** — tapping a notification reshapes the same container into that actor's profile card.
- 💬 **Profile-to-composer morph** — the message button opens a reply/message composer; reply notifications carry the quoted text into it.
- 🎞️ **Staggered content** — profile and composer sections fade in sequence (`140 ms + 45 ms × index`) as each stage arrives.
- 🧲 **Measured container** — every content layer reports its own layout; the container animates between those measured sizes instead of hard-coded heights.
- 🧵 **Stacked transitions** — stages are absolute layers rather than swapped screens. Entering layers fade in and scale-spring from `0.97` to `1` while outgoing layers fade out.
- 🪄 **Post-send toast** — after the collapse settles, “Reply sent” or “Message sent” springs in below the badge, holds for `2.1 s`, then fades.
- 📐 **Proportional sizing** — component dimensions run through `verticalScale` (window long side ÷ `812`, rounded to the nearest pixel).
- ♿ **Accessibility labels** — the bell, notification rows, follow/message/mute/more buttons, composer, and send button all expose labels/roles; inactive layers are hidden from touch and accessibility.
- 🧠 **TypeScript-first** — strict types, typed props, and a discriminated `Notification` union.
- 🎛️ **Host-controlled** — `open`, `onOpen`, and `onClose` keep visibility in your screen's state; `triggerIcon` and `onSend` are optional.

---

## ⚙️ Installation

This isn't published as an npm package yet — copy the source into your project.

```bash
git clone https://github.com/ManasCodeXart/expo-notif-morph
```

Copy these files, preserving the `src/components`, `src/hooks`, and `src/constants` layout:

```text
src/components/
  NotifMorph.tsx
  NotifMorphExpanded.tsx
  NotifMorphReply.tsx
  MorphContentLayer.tsx
  MorphStaggerItem.tsx
src/hooks/
  useMorphBox.ts
  useMorphContent.ts
  useMorphSizeMap.ts
src/constants/
  constants.ts
  scaling.ts
  types.ts
  mockNotifications.ts
  mockProfiles.ts
assets/images/
  avatar1.png
  avatar2.png
  avatar3.png
```

The demo data imports its avatars with relative paths (`../../assets/images/avatar*.png`). Keep those files in place or swap in your own sources.

Install the runtime dependencies:

```bash
npx expo install react-native-reanimated react-native-worklets
npm install phosphor-react-native@^3.0.6
```

> Reanimated 4.x ships its worklets runtime as the separate `react-native-worklets` package — it's required alongside `react-native-reanimated`, not optional.

> Expo's `babel-preset-expo` automatically adds `react-native-worklets/plugin` when the package is installed. If you use a custom Babel setup instead, add that plugin yourself.

Optional:

```bash
npx expo install expo-font react-native-safe-area-context
```

`expo-font` is only needed if you want to load the Manrope family; `react-native-safe-area-context` is only for the demo's safe-area-aware anchors — if you use it in your own screen, remember to wrap that screen in `<SafeAreaProvider>` (see [Usage](#-usage)). The component itself uses neither.


## 🚀 Usage

```tsx
// src/app/index.tsx
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotifMorph from "../components/NotifMorph";
import type { Notification } from "../constants/types";

export default function NotificationsScreen() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {open && (
        <Pressable
          accessibilityLabel="Close notifications"
          onPress={() => setOpen(false)}
          style={styles.dismiss}
        />
      )}

      <NotifMorph
        anchorRight={insets.right + 20}
        anchorTop={insets.top + 12}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onSend={(text: string, notification: Notification) => {
          console.log("send", text, notification.id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dismiss: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
});
```

`open` is fully controlled: pressing the bell only calls `onOpen`. The parent must set `open` to `true`. The full-screen dismiss layer is host code — `NotifMorph` only covers its own card and lets presses outside pass through.

The snippet is an Expo Router route, so it uses a **default export** and imports from `../components` and `../constants`. Expo Router requires route files to default-export their screen; a named export alone leaves the route blank. If you are not using Expo Router, put the component in any regular file, switch the export back to `export function NotificationsScreen()` if you prefer, and adjust the relative imports to your layout.

`useSafeAreaInsets()` requires a `SafeAreaProvider` above the screen. Expo Router mounts one for you, so this repo needs no extra setup; in a bare React Native app, wrap your app root yourself:

```tsx
import { SafeAreaProvider } from "react-native-safe-area-context";

<SafeAreaProvider>
  <NotificationsScreen />
</SafeAreaProvider>;
```

If you don't need safe-area-aware anchors, drop the hook and pass fixed values such as `anchorRight={20}` and `anchorTop={12}` — `NotifMorph` itself never touches safe-area insets.

### Custom trigger icon

```tsx
import { Bell } from "phosphor-react-native";

<NotifMorph
  anchorRight={20}
  anchorTop={12}
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  triggerIcon={<Bell size={20} color="#6E6E73" weight="regular" />}
/>
```

The red dot on the badge is rendered independently and stays visible when `triggerIcon` is supplied.

### Wiring real notifications

`NotifMorph` imports the `notifications` array and `getProfileById` directly from `@/constants/mockNotifications` and `@/constants/mockProfiles`. There is no `notifications` prop. To use real data, replace those exports (or change the imports), keeping every `actorId` resolvable by `getProfileById` — rows with no matching profile are skipped.

---


## 🧱 Component Anatomy

```text
<NotifMorph>                        default export, memoized
  ├─ NotifMorphToast                internal (function, not memoized); sibling of the card
  └─ morphing box (Animated.View)
      ├─ bell trigger                Phosphor Bell or `triggerIcon`, cross-fades/scales with `openProgress`
      ├─ MorphContentLayer           stage 1
      │   └─ NotifMorphPanel         internal, memoized
      │       └─ notification rows in ScrollView (viewport = first 3 measured rows)
      ├─ MorphContentLayer           stage 2 (mounted when a profile is active)
      │   └─ NotifMorphExpanded      named export, memoized
      │       └─ MorphStaggerItem × 5 (header / bio / stats / mutuals / actions)
      └─ MorphContentLayer           stage 3 (mounted when a profile + notification are active)
          └─ NotifMorphReply         named export, memoized
              └─ MorphStaggerItem × 4 (header / recipient / quote / composer)
```

`NotifMorphToast` is rendered next to the card, not inside the morphing box.

The rendered surface is derived, not stored directly — an internal `stage` state is combined with `open` and `activeProfile` into `effectiveStage`:

| `effectiveStage` | Surface |
|---|---|
| `0` | Collapsed bell badge |
| `1` | Notification tray |
| `2` | Actor profile card (`activeProfile` set) |
| `3` | Reply/message composer (`activeProfile` set + `stage === 3`) |

Stage 2 and 3 require `activeProfile != null`; the stage 3 layer only mounts when both a profile and a notification are active.

---

## 🧩 API

### `<NotifMorph>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `anchorRight` | `number` | `0` | Distance from the host's right edge to the card's right edge. Applied as-is; the demo passes `insets.right + 20`. |
| `anchorTop` | `number` | `0` | Distance from the host's top edge to the card's top edge. Applied as-is; ignored when `centered` is set. |
| `centered` | `boolean` | `false` | Centres the card (and the toast) in the parent instead of anchoring it, and lets the card widen to the screen width minus `2 × verticalScale(48)` (both sides). |
| `open` | `boolean` | — | Controlled visibility. `true` shows the tray; `false` collapses to the badge. |
| `onOpen` | `() => void` | — | Fired when the collapsed bell is pressed. The component does not change `open` itself. |
| `onClose` | `() => void` | — | Fired when the profile/reply card background is tapped or after the composer's Send runs, so the host can set `open` to `false`. |
| `onSend` | `(text: string, notification: Notification) => void` | — | Fired after Send with the trimmed composer text and the active notification. The internal reset and toast happen even when omitted. |
| `triggerIcon` | `ReactNode` | built-in Phosphor `<Bell />` | Replaces the collapsed badge icon. The red dot is still rendered. |

The card is anchored by its top and right edges only. Its host fills the parent and uses `pointerEvents="box-none"`, so taps outside the card reach whatever is behind it.

### `<NotifMorphExpanded>`

Named export, memoized.

| Prop | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | — | Drives the staggered content reveal. |
| `profile` | `Profile` | — | Actor shown in the card. |
| `width` | `number` | — | Card width. `NotifMorph` caps it at `300` design units and clamps it to the space left of the anchor. |
| `onPress` | `() => void` | — | Fired when the card background is pressed. |
| `onReplyPress` | `() => void` | — | Fired by the message button; opens the composer. |

The Follow/Following button is local component state initialized from `profile.isFollowing`; it does not notify a parent. The mute and more buttons only stop propagation.

### `<NotifMorphReply>`

Named export, memoized.

| Prop | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | — | Drives the staggered content reveal. |
| `notification` | `Notification` | — | Supplies the quoted reply text and selects reply vs. message copy. |
| `profile` | `Profile` | — | Actor shown in the header. |
| `width` | `number` | — | Card width, using the same computed width as the profile card. |
| `onPress` | `() => void` | — | Fired when the card background is pressed. |
| `onSend` | `(text: string) => void` | — | Fired with trimmed text. The Send button only appears while the input contains non-whitespace. |

For `reply` notifications the header reads “replying to @handle” and the quoted text is shown. For `like`/`follow` it reads “Message to Name” with no quote.

### `<MorphContentLayer>`

Memoized absolute layer used for the tray, profile, and composer stages.

| Prop | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | — | Controls opacity, scale, touch, and accessibility visibility. |
| `children` | `ReactNode` | — | Layer content. |
| `contentKey` | `string` | — | Key passed back with the measured size. |
| `direction` | `-1 \| 0 \| 1` | `0` | Horizontal travel direction for the fade/spring transition. |
| `duration` | `number` | `520` | Fade timing duration in ms. |
| `easing` | `EasingFunctionFactory` | `MORPH_EASING` | Fade easing. |
| `onMeasure` | `(key: string, w: number, h: number) => void` | — | Receives ceil-rounded dimensions from `onLayout`. |

### `<MorphStaggerItem>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | — | Reveals or hides the item. |
| `index` | `number` | — | Stagger position: delay is `140 + 45 × index` ms. |
| `children` | `ReactNode` | — | Item content. |

Fade-in duration is `500 ms`; fade-out is `160 ms`. Only opacity is animated.

### `useMorphBox`

```ts
const { boxStyle, openProgress } = useMorphBox({
  activeKey,
  sizes,
  collapsedSize,
  mode: "replace",
  onCollapseComplete,
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `activeKey` | `string \| null` | — | Key into `sizes` to open, or `null` to collapse. |
| `sizes` | `MorphSizeMap` | — | Measured sizes keyed by content key. |
| `collapsedSize` | `MorphSize` | — | Size to animate back to when collapsed. |
| `mode` | `"stack" \| "replace"` | `"stack"` | `stack` uses `collapsed height + target height`; `replace` uses the target height. |
| `minWidth` | `number` | `0` | Lower bound for the open width. |
| `duration` | `number` | `600` | Box timing duration in ms. |
| `easing` | `EasingFunctionFactory` | `cubic-bezier(0.22, 1, 0.36, 1)` | Box timing easing. |
| `onCollapseComplete` | `() => void` | — | Called after the collapse height animation finishes. |

Returns `boxStyle` (animated `width`/`height`) and `openProgress` (`0 → 1`). A missing or unmeasured target leaves the box unchanged. The first size is applied without animation; the collapse progress uses `duration - 80` ms.

### `useMorphContent`

```ts
const { progress, style } = useMorphContent({
  active,
  direction: -1,
  slideDistance: 65,
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | — | Target visibility. |
| `direction` | `-1 \| 0 \| 1` | `0` | Entrance/exit horizontal direction. |
| `duration` | `number` | `520` | Opacity timing duration in ms. |
| `easing` | `EasingFunctionFactory` | `MORPH_EASING` | Opacity easing. |
| `slideDistance` | `number` | `65` | Horizontal travel distance in design units. |

Returns `progress` and an animated style containing opacity, `translateX`, and scale. Scale springs from `0.97` to `1` on enter and back on exit.

### `useMorphSizeMap`

```ts
const { measure, sizes } = useMorphSizeMap();
```

`measure(key, w, h)` ignores non-positive sizes and returns the same state object when the stored size is unchanged. `sizes` is a plain `Record<string, MorphSize>`.

### Motion defaults

| Behavior | Value |
|---|---|
| Tray open / close | `600 ms`, `MORPH_EASING` (`cubic-bezier(0.22, 1, 0.36, 1)` wrap) |
| Profile and composer morph | `420 ms`, `cubic-bezier(0.2, 0.9, 0.25, 1)` |
| Profile/composer content fade | `260 ms` |
| Tray content fade | `520 ms` |
| Content scale spring | damping `14`, mass `0.6`, stiffness `220` |
| Stagger | `140 ms + 45 ms × index`, `500 ms` in, `160 ms` out |
| Toast | spring in, `2100 ms` hold, `260 ms` fade out |
| Slide distance | `65` design units (the component passes `direction={0}`, so no horizontal travel is used) |

### Demo wiring — read before shipping

- **Data is static.** Notifications and profiles come from the mock constants; there is no fetch or data prop.
- **The `read` flag is unused.** The bell's red dot is always rendered.
- **Follow is local UI state.** It resets when the card remounts and has no callback.
- **Mute and More are non-functional.** They only call `stopPropagation`.
- **No dark mode / theme prop.** Surfaces are hard-coded translucent white with a single purple accent.
- **Outside-tap dismissal is host code.** The component requests a close only from card-background taps and sends; the full-screen `Pressable` in the usage example is what handles taps outside the badge.
- **The toast is internal.** There is no toast callback or custom text prop.

---

### Types

```ts
import type { ImageSourcePropType } from "react-native";
import type { EasingFunctionFactory } from "react-native-reanimated";

interface MorphSize {
  readonly w: number;
  readonly h: number;
}

type MorphSizeMap = Record<string, MorphSize>;

type MorphMode = "stack" | "replace";

interface UseMorphBoxOptions {
  activeKey: string | null;
  sizes: MorphSizeMap;
  collapsedSize: MorphSize;
  mode?: MorphMode;
  minWidth?: number;
  duration?: number;
  easing?: EasingFunctionFactory;
  onCollapseComplete?: () => void;
}

interface UseMorphContentOptions {
  active: boolean;
  direction?: -1 | 0 | 1;
  duration?: number;
  easing?: EasingFunctionFactory;
  slideDistance?: number;
}

type NotificationType = "like" | "follow" | "reply";

type Notification =
  | {
      id: string;
      actorId: string;
      timestamp: string;
      read: boolean;
      type: "like";
      postSnippet: string;
    }
  | {
      id: string;
      actorId: string;
      timestamp: string;
      read: boolean;
      type: "follow";
    }
  | {
      id: string;
      actorId: string;
      timestamp: string;
      read: boolean;
      type: "reply";
      replyText: string;
      replyingToHandle: string;
    };

type Profile = {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly avatarSource: ImageSourcePropType;
  readonly verified: boolean;
  readonly bio: string;
  readonly followers: number;
  readonly following: number;
  readonly isFollowing: boolean;
  readonly mutualFollowers: {
    readonly previewIds: readonly string[];
    readonly totalCount: number;
  };
};
```

---

## 🔤 Fonts

Text uses the **Manrope** family by name: `ManropeRegular`, `ManropeMedium`, `ManropeSemiBold`, and `ManropeBold`. The demo loads the bundled files from `assets/fonts` with `useFonts` in `src/app/_layout.tsx`.

If you don't register these names yourself, React Native falls back to the system font silently — everything still renders, you'll just get system-font weights instead of Manrope. Load the family under those exact names if you want the intended look.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

## 🧱 Stack

[Expo SDK 58](https://expo.dev/changelog) · [React Native 0.88](https://reactnative.dev/) · [React 19.3](https://react.dev/) · [Reanimated 4.7](https://docs.swmansion.com/react-native-reanimated/) · [React Native Worklets 0.13](https://docs.swmansion.com/react-native-reanimated/) · [phosphor-react-native 3.0](https://github.com/phosphor-icons/react-native) · TypeScript 6.0
