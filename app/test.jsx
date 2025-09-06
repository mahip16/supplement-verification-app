import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchSupplements } from '../firebase/firestore'; // adjust path if needed

const Test = () => {
  const [supplements, setSupplements] = useState([]);

  useEffect(() => {
    fetchSupplements().then(data => {
      setSupplements(data);
      console.log("Supplements:", data);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supplements (Test):</Text>
      {supplements.map((item) => (
        <Text key={item.id}>{item.name}</Text>
      ))}
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
