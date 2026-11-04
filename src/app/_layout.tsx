import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    ManropeSemiBold: require("../../assets/fonts/manrope-semibold.ttf"),
    ManropeBold: require("../../assets/fonts/manrope-bold.ttf"),
    ManropeMedium: require("../../assets/fonts/manrope-medium.ttf"),
    ManropeRegular: require("../../assets/fonts/manrope-regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack
        screenOptions={{
          animation: "fade",
          animationDuration: 500,
          gestureEnabled: true,
          headerShown: false,
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
