/**
 * Open Food Facts API Service
 * 
 * Free API for product information by barcode
 * Documentation: https://world.openfoodfacts.org/data
 */

const API_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

/**
 * Fetch product details by barcode
 * @param {string} barcode - Product barcode (UPC, EAN, etc.)
 * @returns {Promise<Object>} Product data or error
 */
export const fetchProductByBarcode = async (barcode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if product was found
    if (data.status === 0) {
      return {
        found: false,
        error: 'Product not found in database',
      };
    }
    
    // Extract and format relevant product information
    const product = data.product;
    
    return {
      found: true,
      data: {
        // Basic info
        name: product.product_name || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        barcode: barcode,
        
        // Images
        image: product.image_url || product.image_front_url || null,
        imageThumbnail: product.image_thumb_url || product.image_front_thumb_url || null,
        
        // Categories
        categories: product.categories_tags || [],
        categoriesText: product.categories || 'Not specified',
        
        // Ingredients
        ingredients: product.ingredients_text || 'Ingredients information not available',
        ingredientsList: product.ingredients || [],
        
        // Nutritional info
        nutriments: product.nutriments || {},
        servingSize: product.serving_size || 'Not specified',
        
        // Additional details
        quantity: product.quantity || 'Not specified',
        packaging: product.packaging || 'Not specified',
        
        // Labels & certifications
        labels: product.labels_tags || [],
        labelsText: product.labels || '',
        
        // Allergens
        allergens: product.allergens_tags || [],
        allergensText: product.allergens || 'None specified',
        
        // Warnings
        traces: product.traces_tags || [],
        tracesText: product.traces || '',
        
        // Additional metadata
        countries: product.countries_tags || [],
        manufacturingPlaces: product.manufacturing_places || 'Not specified',
        stores: product.stores || 'Not specified',
        
        // Raw product data (in case you need more fields)
        raw: product,
      }
    };
    
  } catch (error) {
    console.error('Open Food Facts API Error:', error);
    return {
      found: false,
      error: error.message || 'Failed to fetch product data',
    };
  }
};

/**
 * Search products by name
 * @param {string} searchTerm - Product name to search
 * @param {number} page - Page number (default 1)
 * @param {number} pageSize - Results per page (default 20)
 * @returns {Promise<Object>} Search results
 */
export const searchProducts = async (searchTerm, page = 1, pageSize = 20) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search?search_terms=${encodeURIComponent(searchTerm)}&page=${page}&page_size=${pageSize}&json=true`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      count: data.count || 0,
      page: data.page || 1,
      pageSize: data.page_size || pageSize,
      products: data.products || [],
    };
    
  } catch (error) {
    console.error('Search Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to search products',
    };
  }
};

/**
 * Helper function to format nutrients for display
 * @param {Object} nutriments - Nutriments object from API
 * @returns {Array} Formatted nutrient list
 */
export const formatNutrients = (nutriments) => {
  if (!nutriments) return [];
  
  const commonNutrients = [
    { key: 'energy-kcal', label: 'Calories', unit: 'kcal' },
    { key: 'fat', label: 'Fat', unit: 'g' },
    { key: 'saturated-fat', label: 'Saturated Fat', unit: 'g' },
    { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g' },
    { key: 'sugars', label: 'Sugars', unit: 'g' },
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'proteins', label: 'Protein', unit: 'g' },
    { key: 'salt', label: 'Salt', unit: 'g' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
  ];
  
  return commonNutrients
    .filter(nutrient => nutriments[nutrient.key] !== undefined)
    .map(nutrient => ({
      label: nutrient.label,
      value: nutriments[nutrient.key],
      unit: nutrient.unit,
      per100g: nutriments[`${nutrient.key}_100g`],
      perServing: nutriments[`${nutrient.key}_serving`],
    }));
};

/**
 * Helper to check if product is likely a supplement
 * @param {Object} productData - Product data from API
 * @returns {boolean} True if likely a supplement
 */
export const isSupplement = (productData) => {
  if (!productData) return false;
  
  const categories = productData.categories_tags || [];
  const supplementKeywords = [
    'supplement',
    'vitamin',
    'mineral',
    'protein-powder',
    'dietary-supplement',
    'food-supplement',
  ];
  
  return categories.some(cat => 
    supplementKeywords.some(keyword => cat.toLowerCase().includes(keyword))
  );
};

export default {
  fetchProductByBarcode,
  searchProducts,
  formatNutrients,
  isSupplement,
};
