import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase/FirebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

// ============================================
// API & ANALYSIS FUNCTIONS
// ============================================

const API_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

// Ingredient safety database
const INGREDIENT_DATABASE = {
  // Proteins
  'whey protein': { purpose: 'Muscle recovery & growth', safety: 'safe', explanation: 'High-quality complete protein, easily absorbed' },
  'casein': { purpose: 'Slow-release protein', safety: 'safe', explanation: 'Digests slowly, good for overnight recovery' },
  'soy protein': { purpose: 'Plant-based protein', safety: 'caution', explanation: 'May affect hormone levels in high doses. Allergen warning.' },
  
  // Amino Acids
  'creatine': { purpose: 'Strength & power', safety: 'safe', explanation: 'Improves strength and muscle performance' },
  'bcaa': { purpose: 'Muscle recovery', safety: 'safe', explanation: 'Reduces muscle breakdown during exercise' },
  'beta-alanine': { purpose: 'Endurance', safety: 'safe', explanation: 'May cause tingling sensation (harmless)' },
  'l-carnitine': { purpose: 'Fat metabolism', safety: 'safe', explanation: 'Helps transport fatty acids for energy' },
  'glutamine': { purpose: 'Recovery & gut health', safety: 'safe', explanation: 'Supports immune function and muscle recovery' },
  
  // Stimulants
  'caffeine': { purpose: 'Energy & focus', safety: 'caution', explanation: 'Effective but monitor total daily intake (limit 400mg)' },
  'dmaa': { purpose: 'Stimulant', safety: 'avoid', explanation: 'Banned by FDA - linked to serious cardiovascular events' },
  'dmha': { purpose: 'Stimulant', safety: 'avoid', explanation: 'Controversial stimulant with limited safety data' },
  
  // Vitamins & Minerals
  'vitamin d': { purpose: 'Bone health & immunity', safety: 'safe', explanation: 'Essential for bone strength and immune function' },
  'vitamin c': { purpose: 'Immunity & antioxidant', safety: 'safe', explanation: 'Supports immune system and collagen production' },
  'magnesium': { purpose: 'Muscle & nerve function', safety: 'safe', explanation: 'Helps with muscle relaxation and sleep' },
  'zinc': { purpose: 'Immunity & testosterone', safety: 'safe', explanation: 'Supports immune health and hormone production' },
  'iron': { purpose: 'Oxygen transport', safety: 'caution', explanation: 'Important but excess can be harmful' },
  
  // Sweeteners
  'sucralose': { purpose: 'Artificial sweetener', safety: 'caution', explanation: 'Zero calories but some concerns about gut bacteria' },
  'aspartame': { purpose: 'Artificial sweetener', safety: 'caution', explanation: 'Safe for most, avoid if phenylketonuria (PKU)' },
  'stevia': { purpose: 'Natural sweetener', safety: 'safe', explanation: 'Plant-based, zero calorie sweetener' },
  'acesulfame k': { purpose: 'Artificial sweetener', safety: 'caution', explanation: 'Generally safe but long-term effects debated' },
  
  // Other Common Ingredients
  'maltodextrin': { purpose: 'Carbohydrate source', safety: 'safe', explanation: 'Quick-absorbing carb for energy' },
  'citric acid': { purpose: 'Flavor & preservation', safety: 'safe', explanation: 'Common food additive, generally safe' },
  'lecithin': { purpose: 'Mixing agent', safety: 'safe', explanation: 'Helps blend ingredients, usually from soy' },
};

// Allergen keywords
const ALLERGENS = {
  dairy: ['milk', 'whey', 'casein', 'lactose', 'dairy'],
  soy: ['soy', 'soya'],
  gluten: ['wheat', 'barley', 'gluten'],
  nuts: ['peanut', 'almond', 'cashew', 'walnut'],
  eggs: ['egg', 'albumin'],
  shellfish: ['shellfish', 'shrimp', 'crab'],
};

// Supplement categories
const categorizeProduct = (productData) => {
  const name = (productData.name + ' ' + productData.categoriesText).toLowerCase();
  
  // Check if it's actually a supplement first
  const supplementKeywords = [
    'supplement', 'vitamin', 'mineral', 'protein powder', 'whey', 'casein',
    'pre-workout', 'pre workout', 'creatine', 'bcaa', 'amino', 'fat burner',
    'mass gainer', 'dietary supplement', 'nutritional supplement', 'omega',
    'fish oil', 'probiotic', 'collagen', 'multivitamin', 'electrolyte'
  ];
  
  const isSupplement = supplementKeywords.some(keyword => name.includes(keyword));
  
  // If it's not a supplement, detect what it is
  if (!isSupplement) {
    if (name.includes('chocolate') || name.includes('candy') || name.includes('sweet')) return 'Food - Sweet/Snack';
    if (name.includes('spread') || name.includes('butter') || name.includes('jam')) return 'Food - Spread';
    if (name.includes('drink') || name.includes('beverage') || name.includes('juice')) return 'Beverage';
    if (name.includes('cereal') || name.includes('breakfast')) return 'Food - Breakfast';
    if (name.includes('snack') || name.includes('bar')) return 'Food - Snack';
    return 'Food Product';
  }
  
  // If it IS a supplement, categorize it
  if (name.includes('protein') || name.includes('whey') || name.includes('casein')) return 'Protein Powder';
  if (name.includes('pre-workout') || name.includes('pre workout')) return 'Pre-Workout';
  if (name.includes('vitamin')) return 'Vitamin';
  if (name.includes('creatine')) return 'Creatine';
  if (name.includes('bcaa') || name.includes('amino')) return 'Amino Acids';
  if (name.includes('fat burn') || name.includes('weight loss')) return 'Fat Burner';
  if (name.includes('mass gainer')) return 'Mass Gainer';
  if (name.includes('mineral')) return 'Mineral';
  if (name.includes('omega') || name.includes('fish oil')) return 'Omega-3 / Fish Oil';
  if (name.includes('probiotic')) return 'Probiotic';
  if (name.includes('collagen')) return 'Collagen';
  if (name.includes('multivitamin')) return 'Multivitamin';
  
  return 'Dietary Supplement';
};

// Analyze ingredients
const analyzeIngredients = (ingredientsText) => {
  if (!ingredientsText) return [];
  
  const text = ingredientsText.toLowerCase();
  const analyzed = [];
  
  for (const [ingredient, info] of Object.entries(INGREDIENT_DATABASE)) {
    if (text.includes(ingredient)) {
      analyzed.push({
        name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
        ...info,
      });
    }
  }
  
  return analyzed;
};

// Calculate overall score
const calculateScore = (analyzedIngredients, productData) => {
  if (analyzedIngredients.length === 0) return { score: 5.0, rating: 'Unknown' };
  
  let score = 7.0;
  let safeCount = 0;
  let cautionCount = 0;
  let avoidCount = 0;
  
  analyzedIngredients.forEach(ing => {
    if (ing.safety === 'safe') safeCount++;
    else if (ing.safety === 'caution') cautionCount++;
    else if (ing.safety === 'avoid') avoidCount++;
  });
  
  // Adjust score based on safety ratings
  score += (safeCount * 0.3);
  score -= (cautionCount * 0.5);
  score -= (avoidCount * 2);
  
  // Bonus for known brand or certifications
  if (productData.labelsText && productData.labelsText.toLowerCase().includes('organic')) {
    score += 0.5;
  }
  
  score = Math.max(0, Math.min(10, score));
  
  let rating, recommendation;
  if (score >= 8) {
    rating = '🟢';
    recommendation = 'Excellent choice';
  } else if (score >= 6.5) {
    rating = '🟢';
    recommendation = 'Good choice';
  } else if (score >= 5) {
    rating = '🟡';
    recommendation = 'Use with caution';
  } else {
    rating = '🔴';
    recommendation = 'Not recommended';
  }
  
  return { score: score.toFixed(1), rating, recommendation, safeCount, cautionCount, avoidCount };
};

// Detect allergens
const detectAllergens = (ingredientsText, allergensText) => {
  const text = (ingredientsText + ' ' + allergensText).toLowerCase();
  const detected = [];
  
  for (const [allergen, keywords] of Object.entries(ALLERGENS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      detected.push(allergen);
    }
  }
  
  return detected;
};

// Detect caffeine
const detectCaffeine = (ingredientsText, nutriments) => {
  const text = ingredientsText.toLowerCase();
  
  if (text.includes('caffeine')) {
    // Try to extract amount from nutriments or estimate
    const caffeineAmount = nutriments.caffeine || 200; // Default estimate
    return {
      present: true,
      amount: caffeineAmount,
      warning: caffeineAmount > 200 ? 'High caffeine content' : 'Contains caffeine',
    };
  }
  
  return { present: false };
};

// Fetch product from API
const fetchProductByBarcode = async (barcode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 0) {
      return { found: false, error: 'Product not found in database' };
    }
    
    const product = data.product;
    
    return {
      found: true,
      data: {
        name: product.product_name || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        barcode: barcode,
        image: product.image_url || product.image_front_url || null,
        imageThumbnail: product.image_thumb_url || product.image_front_thumb_url || null,
        categories: product.categories_tags || [],
        categoriesText: product.categories || 'Not specified',
        ingredients: product.ingredients_text || '',
        ingredientsList: product.ingredients || [],
        nutriments: product.nutriments || {},
        servingSize: product.serving_size || 'Not specified',
        quantity: product.quantity || 'Not specified',
        labels: product.labels_tags || [],
        labelsText: product.labels || '',
        allergens: product.allergens_tags || [],
        allergensText: product.allergens || '',
        traces: product.traces_tags || [],
        tracesText: product.traces || '',
        raw: product,
      }
    };
    
  } catch (error) {
    console.error('API Error:', error);
    return { found: false, error: error.message || 'Failed to fetch product data' };
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function SupplementDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { barcode, barcodeType } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (barcode) {
      fetchAndAnalyzeProduct(barcode);
    } else {
      setError('No barcode provided');
      setLoading(false);
    }
  }, [barcode]);

  const fetchAndAnalyzeProduct = async (code) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchProductByBarcode(code);
      
      if (!result.found) {
        setError(result.error || 'Product not found');
        setProductData(null);
        return;
      }
      
      setProductData(result.data);
      
      // Analyze the product
      const category = categorizeProduct(result.data);
      const analyzedIngredients = analyzeIngredients(result.data.ingredients);
      const overallScore = calculateScore(analyzedIngredients, result.data);
      const allergens = detectAllergens(result.data.ingredients, result.data.allergensText);
      const caffeine = detectCaffeine(result.data.ingredients, result.data.nutriments);
      
      const analysisData = {
        category,
        ingredients: analyzedIngredients,
        score: overallScore,
        allergens,
        caffeine,
      };
      
      setAnalysis(analysisData);
      
      // Auto-save to history (background operation)
      saveToHistory(result.data, analysisData);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (productData, analysis) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      
      // Only save if user is logged in
      if (!user) return;

      // Save to user's scan history
      await addDoc(collection(FIREBASE_DB, 'users', user.uid, 'scans'), {
        barcode: barcode,
        barcodeType: barcodeType,
        productName: productData.name,
        brand: productData.brand,
        category: analysis.category,
        score: parseFloat(analysis.score.score),
        image: productData.imageThumbnail || productData.image,
        scannedAt: new Date(),
      });

      console.log('✓ Saved to history');
    } catch (error) {
      console.error('Error saving to history:', error);
      // Don't show error to user - history save is background operation
    }
  };

  const saveToFavorites = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to save favorites');
        return;
      }

      await addDoc(collection(FIREBASE_DB, 'users', user.uid, 'favorites'), {
        barcode: barcode,
        productName: productData.name,
        brand: productData.brand,
        category: analysis.category,
        score: analysis.score.score,
        image: productData.imageThumbnail || productData.image,
        savedAt: new Date(),
      });

      setIsSaved(true);
      Alert.alert('✓ Saved!', 'Added to your favorites');
    } catch (error) {
      console.error('Error saving:', error);
      Alert.alert('Error', 'Failed to save to favorites');
    }
  };

  const shareResults = () => {
    Alert.alert(
      'Share Results',
      `${productData.name}\nScore: ${analysis.score.score}/10\n${analysis.score.recommendation}`,
      [{ text: 'OK' }]
    );
  };

  const learnMore = () => {
    Alert.alert(
      'Learn More',
      'This feature will provide detailed research articles about ingredients.',
      [{ text: 'OK' }]
    );
  };

  const findAlternatives = () => {
    Alert.alert(
      'Find Alternatives',
      'This feature will suggest better alternatives based on your preferences.',
      [{ text: 'OK' }]
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing supplement...</Text>
      </View>
    );
  }

  // Error state
  if (error || !productData) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <Text style={styles.errorSubtext}>
          This product may not be in our database yet.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const safetyIcon = (safety) => {
    if (safety === 'safe') return '🟢';
    if (safety === 'caution') return '🟡';
    return '🔴';
  };

  const getCategoryStyle = (category) => {
    const isFood = category.startsWith('Food') || category === 'Beverage';
    return {
      icon: isFood ? '🍽️' : '🧴',
      backgroundColor: isFood ? '#FF9500' : '#007AFF',
    };
  };

  const categoryStyle = getCategoryStyle(analysis.category);

  return (
    <ScrollView style={styles.container}>
      {/* 1️⃣ PRODUCT HEADER - Quick Overview */}
      <View style={styles.productHeader}>
        {productData.image && (
          <Image 
            source={{ uri: productData.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
        )}
        <Text style={styles.productName}>{productData.name}</Text>
        <Text style={styles.brandName}>🏷️ {productData.brand}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.backgroundColor }]}>
          <Text style={styles.categoryText}>{categoryStyle.icon} {analysis.category}</Text>
        </View>
      </View>

      {/* Food Product Notice */}
      {(analysis.category.startsWith('Food') || analysis.category === 'Beverage') && (
        <View style={styles.foodNotice}>
          <Ionicons name="information-circle" size={24} color="#FF9500" />
          <View style={styles.foodNoticeContent}>
            <Text style={styles.foodNoticeTitle}>This is not a supplement</Text>
            <Text style={styles.foodNoticeText}>
              SuppleScan is designed for dietary supplements. This product is a regular food item.
              The analysis below is limited.
            </Text>
          </View>
        </View>
      )}

      {/* 3️⃣ OVERALL SCORE - Quick Decision */}
      <View style={styles.scoreCard}></View>
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Overall Rating</Text>
          <Text style={styles.scoreValue}>{analysis.score.score} / 10</Text>
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingEmoji}>{analysis.score.rating}</Text>
          <Text style={styles.recommendation}>{analysis.score.recommendation}</Text>
        </View>
        <View style={styles.scoreBreakdown}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>🟢 Safe</Text>
            <Text style={styles.scoreCount}>{analysis.score.safeCount}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>🟡 Caution</Text>
            <Text style={styles.scoreCount}>{analysis.score.cautionCount}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>🔴 Avoid</Text>
            <Text style={styles.scoreCount}>{analysis.score.avoidCount}</Text>
          </View>
        </View>
      </View>

      {/* 2️⃣ INGREDIENT BREAKDOWN - Core Feature */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Ingredient Analysis</Text>
        {analysis.ingredients.length > 0 ? (
          analysis.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientCard}>
              <View style={styles.ingredientHeader}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.safetyBadge}>{safetyIcon(ingredient.safety)} {ingredient.safety.toUpperCase()}</Text>
              </View>
              <Text style={styles.ingredientPurpose}>💡 {ingredient.purpose}</Text>
              <Text style={styles.ingredientExplanation}>{ingredient.explanation}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No detailed ingredient analysis available. This may be a whole food or the ingredients aren't in our database yet.</Text>
        )}
      </View>

      {/* 4️⃣ PERSONALIZED WARNINGS */}
      {(analysis.allergens.length > 0 || analysis.caffeine.present) && (
        <View style={styles.warningsCard}>
          <Text style={styles.sectionTitle}>⚠️ Important Warnings</Text>
          
          {analysis.allergens.length > 0 && (
            <View style={styles.warningItem}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Contains Allergens</Text>
                <Text style={styles.warningText}>
                  {analysis.allergens.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                </Text>
              </View>
            </View>
          )}
          
          {analysis.caffeine.present && (
            <View style={styles.warningItem}>
              <Ionicons name="flash" size={20} color="#FF9500" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>{analysis.caffeine.warning}</Text>
                <Text style={styles.warningText}>
                  ~{analysis.caffeine.amount}mg per serving. Limit total daily intake to 400mg.
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Full Ingredients List */}
      {productData.ingredients && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Full Ingredients List</Text>
          <Text style={styles.ingredientsText}>{productData.ingredients}</Text>
        </View>
      )}

      {/* 6️⃣ ACTION BUTTONS */}
      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={[styles.actionButton, isSaved && styles.actionButtonSaved]}
          onPress={saveToFavorites}
        >
          <Ionicons name={isSaved ? "heart" : "heart-outline"} size={20} color="white" />
          <Text style={styles.actionButtonText}>{isSaved ? 'Saved' : 'Save to Favorites'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={learnMore}>
          <Ionicons name="book-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Learn More</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareResults}>
          <Ionicons name="share-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Share Results</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonSecondary} onPress={findAlternatives}>
          <Ionicons name="search-outline" size={20} color="#007AFF" />
          <Text style={styles.actionButtonSecondaryText}>Find Better Alternatives</Text>
        </TouchableOpacity>
      </View>

      {/* Data Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>
          Data from Open Food Facts • Analysis by SuppleScan
        </Text>
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Product Header
  productHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
    borderRadius: 10,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Score Card
  scoreCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  recommendation: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  scoreCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Food Product Notice
  foodNotice: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  foodNoticeContent: {
    marginLeft: 12,
    flex: 1,
  },
  foodNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 5,
  },
  foodNoticeText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  // Sections
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  
  // Ingredient Cards
  ingredientCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  safetyBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  ingredientPurpose: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
    fontWeight: '500',
  },
  ingredientExplanation: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  
  // Warnings
  warningsCard: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  warningContent: {
    marginLeft: 10,
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 3,
  },
  warningText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  // Ingredients Text
  ingredientsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  
  // Action Buttons
  actionsSection: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonSaved: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  actionButtonSecondaryText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Attribution
  attribution: {
    padding: 15,
    alignItems: 'center',
  },
  attributionText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  spacing: {
    height: 20,
  },
});