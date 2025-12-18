import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Image,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase/FirebaseConfig';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, safe, caution, avoid
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, score
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Load scans when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [])
  );

  const loadScans = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      
      if (!user) {
        setScans([]);
        setFilteredScans([]);
        setLoading(false);
        return;
      }

      // Load from both 'scans' and 'favorites' collections
      const scansRef = collection(FIREBASE_DB, 'users', user.uid, 'scans');
      const scansQuery = query(scansRef, orderBy('scannedAt', 'desc'));
      const scansSnapshot = await getDocs(scansQuery);
      
      const scansData = scansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scannedAt: doc.data().scannedAt?.toDate(),
      }));

      setScans(scansData);
      setFilteredScans(scansData);
    } catch (error) {
      console.error('Error loading scans:', error);
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadScans();
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...scans];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(scan => 
        scan.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Safety filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(scan => {
        const score = scan.score || 0;
        if (selectedFilter === 'safe') return score >= 7;
        if (selectedFilter === 'caution') return score >= 5 && score < 7;
        if (selectedFilter === 'avoid') return score < 5;
        return true;
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scan => 
        scan.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'score') {
      filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
      filtered.sort((a, b) => (b.scannedAt || 0) - (a.scannedAt || 0));
    }

    setFilteredScans(filtered);
  }, [searchQuery, selectedFilter, selectedCategory, sortBy, scans]);

  // Get statistics
  const getStats = () => {
    const total = scans.length;
    const safeCount = scans.filter(s => (s.score || 0) >= 7).length;
    const cautionCount = scans.filter(s => (s.score || 0) >= 5 && (s.score || 0) < 7).length;
    const avoidCount = scans.filter(s => (s.score || 0) < 5).length;

    // Most scanned category
    const categories = scans.map(s => s.category).filter(Boolean);
    const categoryCount = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const mostScanned = Object.keys(categoryCount).length > 0
      ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
      : 'None';

    return { total, safeCount, cautionCount, avoidCount, mostScanned };
  };

  const deleteScan = async (scanId) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = FIREBASE_AUTH.currentUser;
              await deleteDoc(doc(FIREBASE_DB, 'users', user.uid, 'scans', scanId));
              loadScans();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete scan');
            }
          },
        },
      ]
    );
  };

  const toggleFavorite = async (scan) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      
      // Add to favorites collection
      await addDoc(collection(FIREBASE_DB, 'users', user.uid, 'favorites'), {
        barcode: scan.barcode,
        productName: scan.productName,
        brand: scan.brand,
        category: scan.category,
        score: scan.score,
        image: scan.image,
        savedAt: new Date(),
      });

      Alert.alert('✓ Saved!', 'Added to your favorites');
    } catch (error) {
      Alert.alert('Error', 'Failed to save to favorites');
    }
  };

  const saveNote = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      await updateDoc(doc(FIREBASE_DB, 'users', user.uid, 'scans', selectedScan.id), {
        note: noteText,
      });
      
      setShowNoteModal(false);
      setNoteText('');
      loadScans();
      Alert.alert('✓ Saved', 'Note added to scan');
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const openActions = (scan) => {
    setSelectedScan(scan);
    setShowActionsModal(true);
  };

  const openNoteModal = (scan) => {
    setSelectedScan(scan);
    setNoteText(scan.note || '');
    setShowActionsModal(false);
    setShowNoteModal(true);
  };

  const getSafetyColor = (score) => {
    if (score >= 7) return '#34C759';
    if (score >= 5) return '#FF9500';
    return '#FF3B30';
  };

  const getSafetyIcon = (score) => {
    if (score >= 7) return '🟢';
    if (score >= 5) return '🟡';
    return '🔴';
  };

  const getSafetyLabel = (score) => {
    if (score >= 7) return 'Safe';
    if (score >= 5) return 'Caution';
    return 'Avoid';
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  };

  const renderScanItem = ({ item }) => (
    <TouchableOpacity
      style={styles.scanItem}
      onPress={() => navigation.navigate('SupplementDetails', {
        barcode: item.barcode,
        barcodeType: item.barcodeType || 'ean13',
      })}
      onLongPress={() => openActions(item)}
    >
      <View style={styles.scanContent}>
        {/* Product Image */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productThumbnail} />
        ) : (
          <View style={[styles.productThumbnail, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={24} color="#999" />
          </View>
        )}

        {/* Product Info */}
        <View style={styles.scanInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.productName || 'Unknown Product'}
          </Text>
          <Text style={styles.brandName} numberOfLines={1}>
            🏷️ {item.brand || 'Unknown Brand'}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>⭐ {(item.score || 0).toFixed(1)}</Text>
              <View style={[styles.safetyBadge, { backgroundColor: getSafetyColor(item.score || 0) }]}>
                <Text style={styles.safetyBadgeText}>
                  {getSafetyIcon(item.score || 0)} {getSafetyLabel(item.score || 0)}
                </Text>
              </View>
            </View>
            <Text style={styles.dateText}>📅 {formatDate(item.scannedAt)}</Text>
          </View>

          {item.note && (
            <View style={styles.notePreview}>
              <Ionicons name="chatbox-outline" size={12} color="#666" />
              <Text style={styles.noteText} numberOfLines={1}> {item.note}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => openActions(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const stats = getStats();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading history...</Text>
      </View>
    );
  }

  if (!FIREBASE_AUTH.currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="time-outline" size={80} color="#999" />
        <Text style={styles.emptyTitle}>Sign in to view history</Text>
        <Text style={styles.emptyText}>
          Your scan history will appear here once you sign in
        </Text>
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="scan-outline" size={80} color="#999" />
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptyText}>
          Start scanning supplements to build your history
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.scanButtonText}>Scan Your First Product</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.safeCount}</Text>
            <Text style={styles.statLabel}>Safe</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF9500' }]}>{stats.cautionCount}</Text>
            <Text style={styles.statLabel}>Caution</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF3B30' }]}>{stats.avoidCount}</Text>
            <Text style={styles.statLabel}>Avoid</Text>
          </View>
        </View>
        {stats.mostScanned !== 'None' && (
          <Text style={styles.insightText}>
            Most scanned: {stats.mostScanned}
          </Text>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or brands..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'safe' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('safe')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'safe' && styles.filterChipTextActive]}>
            🟢 Safe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'caution' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('caution')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'caution' && styles.filterChipTextActive]}>
            🟡 Caution
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'avoid' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('avoid')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'avoid' && styles.filterChipTextActive]}>
            🔴 Avoid
          </Text>
        </TouchableOpacity>

        <View style={styles.filterDivider} />

        <TouchableOpacity
          style={[styles.filterChip, sortBy === 'date' && styles.filterChipActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={[styles.filterChipText, sortBy === 'date' && styles.filterChipTextActive]}>
            📅 Recent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, sortBy === 'score' && styles.filterChipActive]}
          onPress={() => setSortBy('score')}
        >
          <Text style={[styles.filterChipText, sortBy === 'score' && styles.filterChipTextActive]}>
            ⭐ Best Score
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Scan List */}
      <FlatList
        data={filteredScans}
        renderItem={renderScanItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No scans match your filters</Text>
          </View>
        }
      />

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={styles.actionsModal}>
            <Text style={styles.actionsTitle}>{selectedScan?.productName}</Text>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionsModal(false);
                toggleFavorite(selectedScan);
              }}
            >
              <Ionicons name="heart-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Save to Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => openNoteModal(selectedScan)}
            >
              <Ionicons name="chatbox-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Add/Edit Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionsModal(false);
                navigation.navigate('SupplementDetails', {
                  barcode: selectedScan.barcode,
                  barcodeType: selectedScan.barcodeType || 'ean13',
                });
              }}
            >
              <Ionicons name="refresh-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Re-scan / Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.actionItemDanger]}
              onPress={() => {
                setShowActionsModal(false);
                deleteScan(selectedScan.id);
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              <Text style={[styles.actionText, styles.actionTextDanger]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowActionsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowNoteModal(false);
          setNoteText('');
        }}
      >
        <TouchableOpacity 
          style={styles.noteModalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowNoteModal(false);
            setNoteText('');
          }}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.noteModal}>
                <View style={styles.noteModalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteModalTitle}>Add Note</Text>
                    <Text style={styles.noteModalSubtitle} numberOfLines={1}>
                      {selectedScan?.productName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowNoteModal(false);
                      setNoteText('');
                    }}
                  >
                    <Ionicons name="close" size={28} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.noteInput}
                  placeholder="e.g., Made me feel bloated, Too sweet, Good price at Costco"
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  maxLength={200}
                  placeholderTextColor="#999"
                  autoFocus
                  textAlignVertical="top"
                />

                <Text style={styles.characterCount}>
                  {noteText.length}/200
                </Text>

                <View style={styles.noteModalButtons}>
                  <TouchableOpacity
                    style={styles.noteModalButtonCancel}
                    onPress={() => {
                      setShowNoteModal(false);
                      setNoteText('');
                    }}
                  >
                    <Text style={styles.noteModalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.noteModalButtonSave}
                    onPress={saveNote}
                  >
                    <Text style={styles.noteModalButtonTextSave}>Save Note</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  insightText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  filterBar: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterBarContent: {
    paddingHorizontal: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  filterDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  listContent: {
    padding: 15,
  },
  scanItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanContent: {
    flexDirection: 'row',
    padding: 12,
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
  scanInfo: {
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
    justifyContent: 'space-between',
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
  },
  notePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    flex: 1,
  },
  moreButton: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
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
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionsModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  actionItemDanger: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 15,
    fontWeight: '500',
  },
  actionTextDanger: {
    color: '#FF3B30',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  noteModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  noteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  noteModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  noteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteModalButtonCancel: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    alignItems: 'center',
  },
  noteModalButtonTextCancel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  noteModalButtonSave: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  noteModalButtonTextSave: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});