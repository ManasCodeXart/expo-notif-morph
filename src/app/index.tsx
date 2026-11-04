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
