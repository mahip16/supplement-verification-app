import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase/FirebaseConfig';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

export default function FavouritesScreen() {
  const navigation = useNavigation();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load favourites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, [])
  );

  const loadFavourites = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      
      if (!user) {
        setFavourites([]);
        setLoading(false);
        return;
      }

      // Load from 'favorites' collection
      const favoritesRef = collection(FIREBASE_DB, 'users', user.uid, 'favorites');
      const favoritesQuery = query(favoritesRef, orderBy('savedAt', 'desc'));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      
      const favoritesData = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        savedAt: doc.data().savedAt?.toDate(),
      }));

      setFavourites(favoritesData);
    } catch (error) {
      console.error('Error loading favourites:', error);
      Alert.alert('Error', 'Failed to load favourites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavourites();
  };

  const removeFavourite = async (favouriteId) => {
    Alert.alert(
      'Remove from Favourites',
      'Are you sure you want to remove this from your favourites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = FIREBASE_AUTH.currentUser;
              await deleteDoc(doc(FIREBASE_DB, 'users', user.uid, 'favorites', favouriteId));
              loadFavourites();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove favourite');
            }
          },
        },
      ]
    );
  };

  const getSafetyIcon = (score) => {
    const numScore = Number(score) || 0;
    if (numScore >= 7) return '🟢';
    if (numScore >= 5) return '🟡';
    return '🔴';
  };

  const getSafetyColor = (score) => {
    const numScore = Number(score) || 0;
    if (numScore >= 7) return '#34C759';
    if (numScore >= 5) return '#FF9500';
    return '#FF3B30';
  };

  const getSafetyLabel = (score) => {
    const numScore = Number(score) || 0;
    if (numScore >= 7) return 'Safe';
    if (numScore >= 5) return 'Caution';
    return 'Avoid';
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Saved today';
    if (diffDays === 1) return 'Saved yesterday';
    if (diffDays < 7) return `Saved ${diffDays} days ago`;
    if (diffDays < 30) return `Saved ${Math.floor(diffDays / 7)} weeks ago`;
    
    return `Saved ${date.toLocaleDateString()}`;
  };

  const renderFavouriteItem = ({ item }) => {
    // Convert score to number safely
    const score = Number(item.score) || 0;
    
    return (
      <TouchableOpacity
        style={styles.favouriteItem}
        onPress={() => navigation.navigate('SupplementDetails', {
          barcode: item.barcode,
          barcodeType: item.barcodeType || 'ean13',
        })}
      >
        <View style={styles.favouriteContent}>
          {/* Product Image */}
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productThumbnail} />
          ) : (
            <View style={[styles.productThumbnail, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={24} color="#999" />
            </View>
          )}

          {/* Product Info */}
          <View style={styles.favouriteInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.productName || 'Unknown Product'}
            </Text>
            <Text style={styles.brandName} numberOfLines={1}>
              🏷️ {item.brand || 'Unknown Brand'}
            </Text>
            
            <View style={styles.metaRow}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>⭐ {score.toFixed(1)}</Text>
                <View style={[styles.safetyBadge, { backgroundColor: getSafetyColor(score) }]}>
                  <Text style={styles.safetyBadgeText}>
                    {getSafetyIcon(score)} {getSafetyLabel(score)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.dateText}>
              {formatDate(item.savedAt)}
            </Text>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFavourite(item.id)}
          >
            <Ionicons name="heart" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading favourites...</Text>
      </View>
    );
  }

  if (!FIREBASE_AUTH.currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-outline" size={80} color="#999" />
        <Text style={styles.emptyTitle}>Sign in to save favourites</Text>
        <Text style={styles.emptyText}>
          Sign in to save your favourite supplements for quick access
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (favourites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-outline" size={80} color="#999" />
        <Text style={styles.emptyTitle}>No favourites yet</Text>
        <Text style={styles.emptyText}>
          Save supplements from your scan history to quickly access them here
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.scanButtonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favourites</Text>
        <Text style={styles.headerSubtitle}>
          {favourites.length} saved supplement{favourites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Favourites List */}
      <FlatList
        data={favourites}
        renderItem={renderFavouriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  
  // Header
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // List
  listContent: {
    padding: 15,
  },
  
  // Favourite Item
  favouriteItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favouriteContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favouriteInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  safetyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  // Empty State
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});