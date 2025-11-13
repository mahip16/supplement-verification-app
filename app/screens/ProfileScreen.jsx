import { View, Text } from 'react-native'
import React from 'react'
import { Button } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';

// Testing profile screen
export default function Profile() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile</Text>
    </View>
  );
}
