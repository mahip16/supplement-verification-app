import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../firebase/FirebaseConfig';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = FIREBASE_AUTH.currentUser;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(FIREBASE_AUTH);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!user || !user.email) return 'G';
    return user.email.charAt(0).toUpperCase();
  };

  const getUsername = () => {
    if (!user || !user.email) return 'Guest';
    return user.email.split('@')[0];
  };

  const getJoinDate = () => {
    if (!user || !user.metadata.creationTime) return 'Recently';
    const date = new Date(user.metadata.creationTime);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const showInfo = (title, message) => {
    Alert.alert(title, message, [{ text: 'Got it' }]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        </View>
        <Text style={styles.username}>{getUsername()}</Text>
        <Text style={styles.subtitle}>
          Scanning smarter since {getJoinDate()}
        </Text>
      </View>

      {/* Saved & Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved & Activity</Text>

        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row}
            onPress={() => navigation.navigate('Favourites')}  // CHANGED
          >
            <View style={styles.rowLeft}>
              <Ionicons name="heart" size={22} color="#FF3B30" />
              <Text style={styles.rowText}>Favorites</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row}
            onPress={() => navigation.navigate('History')}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="time" size={22} color="#007AFF" />
              <Text style={styles.rowText}>Scan History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.card}>
          {user && (
            <>
              <TouchableOpacity 
                style={styles.row}
                onPress={handleSignOut}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="log-out" size={22} color="#FF3B30" />
                  <Text style={[styles.rowText, { color: '#FF3B30' }]}>Sign Out</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </>
          )}

          {!user && (
            <TouchableOpacity 
              style={styles.row}
              onPress={() => navigation.navigate('Login')}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="log-in" size={22} color="#007AFF" />
                <Text style={styles.rowText}>Sign In</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Info & Support</Text>

        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row}
            onPress={() => showInfo(
              'How SuppleScan Works',
              'SuppleScan analyzes supplement barcodes using the Open Food Facts database and evaluates ingredients based on safety research. We provide ratings, allergen warnings, and detailed ingredient breakdowns to help you make informed decisions.'
            )}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle" size={22} color="#007AFF" />
              <Text style={styles.rowText}>How SuppleScan Works</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row}
            onPress={() => showInfo(
              'Data Sources',
              'Product data is sourced from Open Food Facts, a free, open database of food products from around the world. Ingredient safety information is based on published research and regulatory guidelines.'
            )}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="server" size={22} color="#34C759" />
              <Text style={styles.rowText}>Data Sources</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row}
            onPress={() => showInfo(
              'Important Disclaimer',
              'SuppleScan is for informational purposes only and is not medical advice. Always consult with a healthcare professional before starting any supplement regimen. Individual results and reactions may vary.'
            )}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="alert-circle" size={22} color="#FF9500" />
              <Text style={styles.rowText}>Disclaimer</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Alert.alert(
              'Contact Us', 
              'Email: support@supplescan.com\n\nWe typically respond within 24-48 hours.'
            )}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="mail" size={22} color="#007AFF" />
              <Text style={styles.rowText}>Contact / Feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>SuppleScan v1.0.0</Text>
        <Text style={styles.versionSubtext}>Made with care for your health</Text>
      </View>

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
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Sections
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 15,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 49,
  },
  
  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 3,
  },
  versionSubtext: {
    fontSize: 11,
    color: '#bbb',
  },
  
  spacing: {
    height: 20,
  },
});