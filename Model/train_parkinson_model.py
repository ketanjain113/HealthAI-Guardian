"""
Retrain Parkinson's model with production-compatible versions
Run this script to generate a new parkinson_model.h5 file
"""
import os
import cv2
import numpy as np
import h5py
import pickle
from glob import glob
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier
from skimage.feature import graycomatrix, graycoprops
import warnings
warnings.filterwarnings('ignore')

print(f"Using: numpy {np.__version__}, sklearn {__import__('sklearn').__version__}, xgboost {__import__('xgboost').__version__}")

# Configuration
TARGET_SIZE = (128, 128)
MODEL_H5_PATH = 'parkinson_model.h5'
DATA_DIR = 'Parkinson data'

def preprocess_image(path):
    """Load and preprocess image with CLAHE enhancement"""
    img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if img is None: 
        return None
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    return cv2.resize(clahe.apply(img), TARGET_SIZE)

def extract_features(img):
    """Extract comprehensive feature set from image"""
    features = [
        np.mean(img), np.std(img), np.median(img), np.min(img), np.max(img),
        np.percentile(img, 10), np.percentile(img, 25), 
        np.percentile(img, 75), np.percentile(img, 90), np.var(img)
    ]
    
    hist, _ = np.histogram(img.flatten(), bins=16, range=(0, 256))
    features.extend((hist / (hist.sum() + 1e-7)).tolist())
    
    try:
        glcm = graycomatrix(img, [1], [0], 256, True, True)
        for prop in ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation', 'ASM']:
            features.append(graycoprops(glcm, prop)[0, 0])
    except:
        features.extend([0] * 6)
    
    edges = cv2.Canny(img, 50, 150)
    features.extend([
        np.mean(edges), np.std(edges), 
        np.sum(edges > 0) / edges.size, np.max(edges)
    ])
    
    sobel_x = cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(img, cv2.CV_64F, 0, 1, ksize=3)
    features.extend([
        np.mean(np.abs(sobel_x)), np.mean(np.abs(sobel_y)),
        np.std(sobel_x), np.std(sobel_y)
    ])
    
    return features

def load_data(base_dir=DATA_DIR):
    """Load all images and labels from dataset"""
    images, labels = [], []
    
    for split in ['training', 'testing']:
        for label, value in [('parkinson', 1), ('healthy', 0)]:
            pattern = os.path.join(base_dir, '**', split, label, '*.*')
            for file_path in glob(pattern, recursive=True):
                img = preprocess_image(file_path)
                if img is not None:
                    images.append(img)
                    labels.append(value)
    
    print(f'Loaded: {sum(labels)} Parkinson, {len(labels) - sum(labels)} Healthy')
    return images, labels

def augment_data(images, labels):
    """Apply data augmentation techniques"""
    aug_images, aug_labels = list(images), list(labels)
    
    for img, label in zip(images, labels):
        aug_images.append(cv2.flip(img, 1))
        aug_labels.append(label)
        
        for angle in [5, -5]:
            M = cv2.getRotationMatrix2D((64, 64), angle, 1.0)
            rotated = cv2.warpAffine(img, M, TARGET_SIZE)
            aug_images.append(rotated)
            aug_labels.append(label)
    
    print(f'Augmented: {len(images)} -> {len(aug_images)} samples')
    return aug_images, aug_labels

print("Loading data...")
images, labels = load_data()

print("Augmenting data...")
images, labels = augment_data(images, labels)

print("Extracting features...")
X = np.array([extract_features(img) for img in images])
y = np.array(labels)
print(f'Feature matrix shape: {X.shape}')

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f'Train: {len(X_train)} | Test: {len(X_test)}')

print("Training ensemble model...")
rf = RandomForestClassifier(
    n_estimators=300, max_depth=20, min_samples_split=3, 
    random_state=42, n_jobs=-1
)
xgb = XGBClassifier(
    n_estimators=300, max_depth=8, learning_rate=0.1, 
    subsample=0.8, random_state=42, n_jobs=-1
)
gb = GradientBoostingClassifier(
    n_estimators=200, max_depth=6, learning_rate=0.1, 
    random_state=42
)

model = VotingClassifier(
    estimators=[('rf', rf), ('xgb', xgb), ('gb', gb)], 
    voting='soft', n_jobs=-1
)

model.fit(X_train_scaled, y_train)
print("✓ Training completed!")

y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)

print(f'\n🎯 Model Accuracy: {accuracy:.2%}')
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Healthy', 'Parkinson']))

print(f"\n💾 Saving model to {MODEL_H5_PATH}...")
with h5py.File(MODEL_H5_PATH, 'w') as h5f:
    h5f.attrs['model_name'] = 'Enhanced_Ensemble'
    h5f.attrs['accuracy'] = float(accuracy)
    
    scaler_group = h5f.create_group('scaler')
    scaler_group.create_dataset('mean', data=scaler.mean_)
    scaler_group.create_dataset('scale', data=scaler.scale_)
    
    pickle_group = h5f.create_group('pickle_model')
    model_data = pickle.dumps({'model': model, 'scaler': scaler}, protocol=4)
    pickle_group.create_dataset('data', data=np.frombuffer(model_data, dtype=np.uint8))

print(f"✅ Model saved successfully!")

# Test loading
with h5py.File(MODEL_H5_PATH, 'r') as h:
    loaded_data = pickle.loads(bytes(h['pickle_model']['data'][:]))
loaded_accuracy = accuracy_score(y_test, loaded_data['model'].predict(X_test_scaled))
print(f'✅ Loaded model accuracy: {loaded_accuracy:.2%}')
