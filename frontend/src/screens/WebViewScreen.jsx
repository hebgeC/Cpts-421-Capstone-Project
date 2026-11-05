import { colors } from '../theme/colors';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';

export default function WebViewScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{params?.title ?? ''}</Text>
        <View style={styles.backBtn} />
      </View>
      <WebView
        source={{ uri: params?.url }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.warm,
    backgroundColor: '#FFFFFF',
  },
  backBtn: { width: 36, alignItems: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
