import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function ScreenHeader({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.kicker}>TACOMA RESCUE MISSION</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  kicker: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
});
