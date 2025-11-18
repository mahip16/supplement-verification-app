<h1 style="font-size: 40px; font-weight: 800; margin-bottom: 0;">📱 SuppleScan</h1>
<span style="font-size: 20px;">A supplement verification & tracking app built with React Native, Expo, and Firebase</span>

SuppleScan helps users verify supplement products by scanning barcodes and retrieving trusted product information. The app includes secure authentication, real-time cloud syncing, and a polished mobile interface.

<h2 style="font-size: 34px; font-weight: 800;">🚀 Features</h2>
<h3 style="font-size: 26px; font-weight: 700;">🔒 User Authentication</h3>

- Email/password signup and login

- Secure session handling via Firebase Auth

<h3 style="font-size: 26px; font-weight: 700;">📸 Barcode Scanning</h3>

- Real-time scanning using Expo Camera

- Accurate detection for UPC barcodes

- Auto-fetches supplement details

<h3 style="font-size: 26px; font-weight: 700;">📦 Product Verification</h3>

- Displays verified supplement name, brand, ingredients (if added)

- Flags unverified or unknown products

- History or search (if included)

<h3 style="font-size: 26px; font-weight: 700;">☁️ Cloud Integration</h3>

- Firebase Firestore for product metadata

- Real-time syncing across devices

- Secure Firestore rules

<h3 style="font-size: 26px; font-weight: 700;">🎨 Clean Mobile UI</h3>

- React Native + Expo

- Responsive layout & reusable components

<h2 style="font-size: 34px; font-weight: 800;">🛠️ Tech Stack</h2>

Frontend: React Native, Expo, JavaScript/TypeScript
Backend: Firebase Auth, Firestore, Firebase Storage
Tools: Expo Barcode Scanner, React Navigation, GitHub


<h2 style="font-size: 34px; font-weight: 800;">🔧 Installation & Setup</h2>
git clone https://github.com/mahip16/SuppleScan.git
cd SuppleScan
npm install
npx expo start


Open on your phone using Expo Go or run it on a simulator.

<h2 style="font-size: 34px; font-weight: 800;">📘 How It Works</h2>

1. User logs in via Firebase Auth

2. User scans a supplement barcode

3. Firestore checks for a matching UPC

4. If found → displays product details

5. If not → flags as unverified

6. User can view previous scans

<h2 style="font-size: 34px; font-weight: 800;">🧪 Future Enhancements</h2>

- Ingredient breakdown

- AI safety analysis

- User dashboard + daily tracking

- Admin console

- Dark mode

<h2 style="font-size: 34px; font-weight: 800;">👤 Author</h2>

Mahi Patel
Computer Science @ Toronto Metropolitan University
GitHub: github.com/mahip16
