// dashboard after login (buttons: Scan, History, Profile)

import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Button } from '@react-navigation/elements';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Testing HomeScreen screen
export default function Home() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
      <Button onPressIn={() => navigation.navigate('Scanner')}>
              Scanner
            </Button>
      <Button onPressIn={() => navigation.navigate('History')}>
              History
      <Button onPressIn={()=> navigation.navigate('Profile')}>
              Profile
      </Button>
      </Button>
    </View>
  );
}

