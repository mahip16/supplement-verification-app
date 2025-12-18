import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Scanner() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Request permissions when component loads
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Handle barcode scan
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return; // Prevent multiple scans
    
    setScanned(true);
    setScannedData({ type, data });
    setShowModal(true);
    console.log('Scanned:', type, data);
  };

  const handleViewDetails = () => {
    setShowModal(false);
    setScanned(false);
    navigation.navigate('SupplementDetails', {
      barcode: scannedData.data,
      barcodeType: scannedData.type,
    });
  };

  const handleScanAnother = () => {
    setShowModal(false);
    setScanned(false);
    setScannedData(null);
  };

  // Show loading while checking permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  // Show permission request if not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={80} color="#666" />
        <Text style={styles.message}>Camera access is required to scan supplements</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show camera
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: [
            'upc_a',
            'upc_e',
            'ean13',
            'ean8',
            'code128',
            'code39',
            'qr',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {/* Top instruction */}
          <View style={styles.topSection}>
            <Text style={styles.instructionText}>
              {scanned ? '✓ Scanned!' : 'Point camera at supplement barcode'}
            </Text>
          </View>

          {/* Middle scanning frame */}
          <View style={styles.middleSection}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomSection}>
            {/* Flash toggle */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setFlashEnabled(!flashEnabled)}
            >
              <Ionicons
                name={flashEnabled ? 'flash' : 'flash-off'}
                size={30}
                color="white"
              />
              <Text style={styles.controlText}>
                {flashEnabled ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Custom Modal Instead of Alert */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleScanAnother}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#34C759" />
            <Text style={styles.modalTitle}>Supplement Scanned!</Text>
            <Text style={styles.modalBarcode}>
              Barcode: {scannedData?.data}
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButtonPrimary}
              onPress={handleViewDetails}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonPrimaryText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalButtonSecondary}
              onPress={handleScanAnother}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonSecondaryText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topSection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  middleSection: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#007AFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
  },
  controlText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  modalBarcode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  modalButtonSecondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});