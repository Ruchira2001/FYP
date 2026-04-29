"""
Train a ResNet50 model on the PlantVillage dataset for crop disease detection.

Prerequisites:
1. Download the PlantVillage dataset: https://github.com/spMohanty/PlantVillage-Dataset
2. Organize images into: dataset/train/<class_name>/ and dataset/val/<class_name>/
3. Run: python train_model.py

The trained model will be saved to model/plant_disease_model.h5
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

# --------- Configuration ---------
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
TRAIN_DIR = os.path.join(DATASET_DIR, 'train')
VAL_DIR = os.path.join(DATASET_DIR, 'val')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'plant_disease_model.keras')
LABELS_PATH = os.path.join(os.path.dirname(__file__), 'labels.json')

IMG_SIZE = 224
BATCH_SIZE = 8
EPOCHS = 1
LEARNING_RATE = 0.001
FINE_TUNE_LEARNING_RATE = 0.0001
FINE_TUNE_EPOCHS = 1


def create_data_generators():
    """Create training and validation data generators with augmentation"""
    
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
    )
    
    val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True,
    )
    
    val_generator = val_datagen.flow_from_directory(
        VAL_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False,
    )
    
    return train_generator, val_generator


def build_model(num_classes):
    """Build ResNet50 transfer learning model"""
    
    # Load pre-trained ResNet50 (without top classification layers)
    base_model = ResNet50(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.3)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    return model, base_model


def train():
    """Main training function"""
    
    # Check dataset exists
    if not os.path.exists(TRAIN_DIR):
        print(f"❌ Training data not found at {TRAIN_DIR}")
        print(f"   Please download PlantVillage dataset and organize it into:")
        print(f"   {TRAIN_DIR}/<class_name>/image.jpg")
        print(f"   {VAL_DIR}/<class_name>/image.jpg")
        print(f"\n   Download from: https://github.com/spMohanty/PlantVillage-Dataset")
        return
    
    # Create model directory
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Create data generators
    print("📊 Loading dataset...")
    train_gen, val_gen = create_data_generators()
    
    num_classes = train_gen.num_classes
    class_names = list(train_gen.class_indices.keys())
    
    print(f"   Classes: {num_classes}")
    print(f"   Training samples: {train_gen.samples}")
    print(f"   Validation samples: {val_gen.samples}")
    
    # Save labels
    labels = {"classes": class_names}
    with open(LABELS_PATH, 'w') as f:
        json.dump(labels, f, indent=2)
    print(f"   ✅ Labels saved to {LABELS_PATH}")
    
    # Build model
    print("\n🏗️ Building ResNet50 model...")
    model, base_model = build_model(num_classes)
    
    # Phase 1: Train classification head
    print("\n📈 Phase 1: Training classification head...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )
    
    callbacks = [
        ModelCheckpoint(MODEL_PATH, monitor='val_accuracy', save_best_only=True, verbose=1),
        EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6),
    ]
    
    history1 = model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
    )
    
    # Phase 2: Fine-tune last 30 layers of base model
    print("\n📈 Phase 2: Fine-tuning base model...")
    base_model.trainable = True
    
    # Freeze all layers except last 30
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=FINE_TUNE_LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )
    
    history2 = model.fit(
        train_gen,
        epochs=FINE_TUNE_EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
    )
    
    # Final evaluation
    print("\n📊 Final Evaluation:")
    loss, accuracy = model.evaluate(val_gen)
    print(f"   Validation Loss: {loss:.4f}")
    print(f"   Validation Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
    
    # Save final model
    model.save(MODEL_PATH)
    print(f"\n✅ Model saved to {MODEL_PATH}")
    print(f"   Ready for deployment!")


if __name__ == '__main__':
    train()
