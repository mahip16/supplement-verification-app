import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase/FirebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Daily tips rotation
const DAILY_TIPS = [
  "💡 Creatine is one of the most researched and safest supplements.",
  "💡 Vitamin D is best absorbed when taken with a meal containing fat.",
  "💡 Most people don't need pre-workout supplements to see results.",
  "💡 Protein powder is just convenient food - whole foods work too.",
  "💡 Caffeine tolerance builds quickly. Consider cycling your intake.",
  "💡 BCAAs are helpful during fasted training, but not necessary otherwise.",
  "💡 More supplements ≠ better results. Focus on the basics first.",
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalScans: 0,
    avoidCount: 0,
    favoritesCount: 0,
  });
  const [lastScan, setLastScan] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [dailyTip, setDailyTip] = useState('');

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  useEffect(() => {
    // Set daily tip based on day of year
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    setDailyTip(DAILY_TIPS[dayOfYear % DAILY_TIPS.length]);
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      
      if (!user) {
        setStats({ totalScans: 0, avoidCount: 0, favoritesCount: 0 });
        setLastScan(null);
        setAlerts([]);
        setLoading(false);
        return;
      }

      // Load scans
      const scansRef = collection(FIREBASE_DB, 'users', user.uid, 'scans');
      const scansQuery = query(scansRef, orderBy('scannedAt', 'desc'));
      const scansSnapshot = await getDocs(scansQuery);
      
      const scans = scansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scannedAt: doc.data().scannedAt?.toDate(),
      }));

      // Load favorites
      const favoritesRef = collection(FIREBASE_DB, 'users', user.uid, 'favorites');
      const favoritesSnapshot = await getDocs(favoritesRef);

      // Calculate stats
      const avoidCount = scans.filter(s => (s.score || 0) < 5).length;
      
      setStats({
        totalScans: scans.length,
        avoidCount: avoidCount,
        favoritesCount: favoritesSnapshot.size,
      });

      // Get last scan
      if (scans.length > 0) {
        setLastScan(scans[0]);
      }

      // Generate alerts
      const generatedAlerts = [];
      
      // High caffeine alert
      const highCaffeineCount = scans.filter(s => 
        s.productName?.toLowerCase().includes('caffeine') || 
        s.productName?.toLowerCase().includes('pre-workout') ||
        s.productName?.toLowerCase().includes('energy')
      ).length;
      if (highCaffeineCount > 0) {
        generatedAlerts.push({
          icon: 'flash',
          color: '#FF9500',
          text: `${highCaffeineCount} product${highCaffeineCount > 1 ? 's' : ''} may contain high caffeine`,
        });
      }

      // Artificial sweeteners alert
      const sweetenerCount = scans.filter(s => 
        s.productName?.toLowerCase().includes('sugar free') ||
        s.productName?.toLowerCase().includes('zero')
      ).length;
      if (sweetenerCount > 0) {
        generatedAlerts.push({
          icon: 'warning',
          color: '#FF9500',
          text: `${sweetenerCount} product${sweetenerCount > 1 ? 's' : ''} may contain artificial sweeteners`,
        });
      }

      // Low score products
      if (avoidCount > 0) {
        generatedAlerts.push({
          icon: 'alert-circle',
          color: '#FF3B30',
          text: `${avoidCount} product${avoidCount > 1 ? 's' : ''} scored below 5/10`,
        });
      }

      setAlerts(generatedAlerts);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getSafetyIcon = (score) => {
    if (score >= 7) return '🟢';
    if (score >= 5) return '🟡';
    return '🔴';
  };

  const getSafetyColor = (score) => {
    if (score >= 7) return '#34C759';
    if (score >= 5) return '#FF9500';
    return '#FF3B30';
  };

  const handleScan = () => {
    navigation.navigate('Scanner');
  };

  const handleViewLastScan = () => {
    if (lastScan) {
      navigation.navigate('SupplementDetails', {
        barcode: lastScan.barcode,
        barcodeType: lastScan.barcodeType || 'ean13',
      });
    }
  };

  // Guest user view
  if (!FIREBASE_AUTH.currentUser) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>SuppleScan</Text>
        </View>

        {/* Primary Scan Button */}
        <TouchableOpacity style={styles.scanCard} onPress={handleScan}>
          <View style={styles.scanIconContainer}>
            <Ionicons name="scan" size={40} color="white" />
          </View>
          <View style={styles.scanTextContainer}>
            <Text style={styles.scanTitle}>Scan a Supplement</Text>
            <Text style={styles.scanSubtitle}>Point camera at barcode to analyze</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Guest Notice */}
        <View style={styles.guestNotice}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <View style={styles.guestNoticeContent}>
            <Text style={styles.guestNoticeTitle}>You're in Guest Mode</Text>
            <Text style={styles.guestNoticeText}>
              Sign in to save scan history, track favorites, and get personalized alerts.
            </Text>
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Tip */}
        {!tipDismissed && (
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>{dailyTip}</Text>
            <TouchableOpacity onPress={() => setTipDismissed(true)}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Shortcuts */}
        <View style={styles.shortcutsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.shortcutsGrid}>
            <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate('History')}>
              <Ionicons name="time" size={30} color="#007AFF" />
              <Text style={styles.shortcutText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcutCard} onPress={() => Alert.alert('Coming Soon', 'Learn about common supplement ingredients')}>
              <Ionicons name="school" size={30} color="#007AFF" />
              <Text style={styles.shortcutText}>Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcutCard} onPress={() => Alert.alert('Coming Soon', 'Compare different supplements')}>
              <Ionicons name="git-compare" size={30} color="#007AFF" />
              <Text style={styles.shortcutText}>Compare</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Logged-in user view
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.userName}>{FIREBASE_AUTH.currentUser.email?.split('@')[0]}</Text>
      </View>

      {/* Primary Scan Button */}
      <TouchableOpacity style={styles.scanCard} onPress={handleScan}>
        <View style={styles.scanIconContainer}>
          <Ionicons name="scan" size={40} color="white" />
        </View>
        <View style={styles.scanTextContainer}>
          <Text style={styles.scanTitle}>Scan a Supplement</Text>
          <Text style={styles.scanSubtitle}>Point camera at barcode to analyze</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* At a Glance Summary */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>At a Glance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>Total Scanned</Text>
            <Ionicons name="barcode-outline" size={24} color="#007AFF" style={styles.statIcon} />
          </View>
          
          <View style={[styles.statCard, stats.avoidCount > 0 && styles.statCardWarning]}>
            <Text style={[styles.statNumber, stats.avoidCount > 0 && styles.statNumberWarning]}>
              {stats.avoidCount}
            </Text>
            <Text style={styles.statLabel}>Avoid 🔴</Text>
            <Ionicons 
              name="warning-outline" 
              size={24} 
              color={stats.avoidCount > 0 ? "#FF3B30" : "#999"} 
              style={styles.statIcon} 
            />
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
              {stats.favoritesCount}
            </Text>
            <Text style={styles.statLabel}>Favorites ❤️</Text>
            <Ionicons name="heart-outline" size={24} color="#FF3B30" style={styles.statIcon} />
          </View>
        </View>
      </View>

      {/* Last Scan Highlight */}
      {lastScan && (
        <View style={styles.lastScanSection}>
          <Text style={styles.sectionTitle}>Last Scanned</Text>
          <TouchableOpacity style={styles.lastScanCard} onPress={handleViewLastScan}>
            {lastScan.image ? (
              <Image source={{ uri: lastScan.image }} style={styles.lastScanImage} />
            ) : (
              <View style={[styles.lastScanImage, styles.lastScanImagePlaceholder]}>
                <Ionicons name="image-outline" size={30} color="#999" />
              </View>
            )}
            <View style={styles.lastScanInfo}>
              <Text style={styles.lastScanName} numberOfLines={1}>
                {lastScan.productName || 'Unknown Product'}
              </Text>
              <Text style={styles.lastScanBrand} numberOfLines={1}>
                {lastScan.brand || 'Unknown Brand'}
              </Text>
              <View style={styles.lastScanScore}>
                <Text style={styles.scoreText}>⭐ {(lastScan.score || 0).toFixed(1)}</Text>
                <View style={[styles.scoreBadge, { backgroundColor: getSafetyColor(lastScan.score || 0) }]}>
                  <Text style={styles.scoreBadgeText}>{getSafetyIcon(lastScan.score || 0)}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Alerts & Warnings */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>⚠️ Alerts</Text>
          {alerts.map((alert, index) => (
            <View key={index} style={styles.alertCard}>
              <Ionicons name={alert.icon} size={20} color={alert.color} />
              <Text style={styles.alertText}>{alert.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Shortcuts */}
      <View style={styles.shortcutsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.shortcutsGrid}>
          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => navigation.navigate('Favourites')}  // CHANGED
          >
            <Ionicons name="heart" size={30} color="#FF3B30" />
            <Text style={styles.shortcutText}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shortcutCard}
            onPress={() => Alert.alert('Coming Soon', 'Compare different supplements side-by-side')}
          >
            <Ionicons name="git-compare" size={30} color="#007AFF" />
            <Text style={styles.shortcutText}>Compare</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shortcutCard}
            onPress={() => Alert.alert('Coming Soon', 'Learn about common supplement ingredients')}
          >
            <Ionicons name="school" size={30} color="#34C759" />
            <Text style={styles.shortcutText}>Learn</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Tip */}
      {!tipDismissed && (
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>{dailyTip}</Text>
          <TouchableOpacity onPress={() => setTipDismissed(true)}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  // Primary Scan Card
  scanCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  scanIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scanSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  
  // Guest Notice
  guestNotice: {
    backgroundColor: '#E3F2FD',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  guestNoticeContent: {
    marginLeft: 12,
    flex: 1,
  },
  guestNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  guestNoticeText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Stats Section
  statsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 4,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardWarning: {
    backgroundColor: '#FFF3F3',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statNumberWarning: {
    color: '#FF3B30',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  statIcon: {
    marginTop: 8,
    opacity: 0.3,
  },
  
  // Last Scan Section
  lastScanSection: {
    padding: 15,
  },
  lastScanCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lastScanImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  lastScanImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastScanInfo: {
    flex: 1,
  },
  lastScanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  lastScanBrand: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  lastScanScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  scoreBadgeText: {
    fontSize: 14,
  },
  
  // Alerts Section
  alertsSection: {
    padding: 15,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  alertText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  
  // Shortcuts Section
  shortcutsSection: {
    padding: 15,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shortcutCard: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  shortcutText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  
  // Tip Card
  tipCard: {
    backgroundColor: '#E8F5E9',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipText: {
    fontSize: 13,
    color: '#2E7D32',
    flex: 1,
    lineHeight: 18,
  },
  
  spacing: {
    height: 20,
  },
});