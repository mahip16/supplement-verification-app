// camera barcode scanner with Expo

import { View, Text } from 'react-native'
import React from 'react'
import { Button } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';

// Testing Scanner screen
export default function Scanner() {
    const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Scanner Screen</Text>
      {/* <Button onPressIn={() => navigation.goBack()}>Go back</Button> */}
    </View>
  );
}
