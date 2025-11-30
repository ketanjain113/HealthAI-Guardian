"""
Brain Tumor Classification - Keras with Transfer Learning
Optimized for small dataset with .h5 output
"""

import numpy as np
import os
import cv2
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D, Input
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

np.random.seed(42)
tf.random.set_seed(42)

IMG_SIZE = 128
BATCH_SIZE = 16
EPOCHS = 50

print("="*60)
print("BRAIN TUMOR MODEL - Transfer Learning (.h5 output)")
print("="*60)


def load_images(folder, label, img_size):
    images, labels = [], []
    if not os.path.exists(folder):
        return images, labels
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    for f in os.listdir(folder):
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            img = cv2.imread(os.path.join(folder, f))
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
                lab[:,:,0] = clahe.apply(lab[:,:,0])
                img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
                img = cv2.resize(img, (img_size, img_size))
                images.append(img)
                labels.append(label)
    return images, labels


# Load data
print("\n[1/5] Loading data...")
all_images, all_labels = [], []

imgs, lbls = load_images("archive (1)/brain_tumor_dataset/yes", 1, IMG_SIZE)
all_images.extend(imgs)
all_labels.extend(lbls)
print(f"  Tumor: {len(imgs)}")

imgs, lbls = load_images("archive (1)/brain_tumor_dataset/no", 0, IMG_SIZE)
all_images.extend(imgs)
all_labels.extend(lbls)
print(f"  Non-tumor: {len(imgs)}")

X = np.array(all_images, dtype='float32') / 255.0
y = np.array(all_labels)
print(f"  Total: {len(X)}")

# Split data
print("\n[2/5] Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42, stratify=y_train)
print(f"  Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

# Class weights
n_pos = np.sum(y_train == 1)
n_neg = np.sum(y_train == 0)
class_weight = {0: len(y_train) / (2 * n_neg), 1: len(y_train) / (2 * n_pos)}
print(f"  Class weights: {class_weight}")

# Build model with Transfer Learning - FROZEN base
print("\n[3/5] Building model (MobileNetV2 - frozen)...")
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))

# Freeze ALL base layers - critical for small datasets
for layer in base_model.layers:
    layer.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.5)(x)
x = Dense(64, activation='relu')(x)
x = Dropout(0.3)(x)
output = Dense(1, activation='sigmoid')(x)

model = Model(inputs=base_model.input, outputs=output)
model.compile(optimizer=Adam(learning_rate=0.001), loss='binary_crossentropy', metrics=['accuracy'])

trainable = sum([np.prod(v.shape) for v in model.trainable_weights])
print(f"  Trainable params: {trainable:,}")

# Data augmentation - mild
datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    zoom_range=0.1
)

# Callbacks
callbacks = [
    EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6)
]

# Train
print("\n[4/5] Training...")
print("-"*60)
history = model.fit(
    datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
    steps_per_epoch=len(X_train) // BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=(X_val, y_val),
    class_weight=class_weight,
    callbacks=callbacks,
    verbose=1
)

# Evaluate
print("\n[5/5] Evaluating...")
print("="*60)

test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
y_pred = (model.predict(X_test, verbose=0) > 0.5).astype(int).flatten()

print(f"\n✓ TEST ACCURACY: {test_acc*100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['No Tumor', 'Tumor']))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Check overfitting
train_acc = history.history['accuracy'][-1]
val_acc = history.history['val_accuracy'][-1]
print(f"\nOverfitting check:")
print(f"  Train Acc: {train_acc*100:.1f}%, Val Acc: {val_acc*100:.1f}%, Test Acc: {test_acc*100:.1f}%")

if test_acc >= 0.80:
    print("\n✓ TARGET ACHIEVED!")
else:
    print(f"\n⚠ Below 80% target")

# Save
model.save('brain_tumor_model.h5')
print("\n✓ Model saved: brain_tumor_model.h5")
model.save('brain_tumor_model.keras')
print("✓ Model saved: brain_tumor_model.keras")
