import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { WardrobeStackScreenProps } from '@/navigation/types';

type Props = WardrobeStackScreenProps<'Wardrobe'>;

export function WardrobeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Wardrobe</Text>
        <Text style={styles.description}>
          Your wardrobe items will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});