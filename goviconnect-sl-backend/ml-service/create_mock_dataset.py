import os
import numpy as np
from PIL import Image

CLASSES = [
    "Rice___Brown_Spot",
    "Rice___Leaf_Blast",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight"
]

DATASET_DIR = "dataset"
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VAL_DIR = os.path.join(DATASET_DIR, "val")

def create_mock_images():
    for class_name in CLASSES:
        os.makedirs(os.path.join(TRAIN_DIR, class_name), exist_ok=True)
        os.makedirs(os.path.join(VAL_DIR, class_name), exist_ok=True)
        
        # 10 train images, 2 val images per class
        for i in range(10):
            img_array = np.random.rand(224,224,3) * 255
            img = Image.fromarray(img_array.astype('uint8')).convert('RGB')
            img.save(os.path.join(TRAIN_DIR, class_name, f"mock_train_{i}.jpg"))
            
        for i in range(2):
            img_array = np.random.rand(224,224,3) * 255
            img = Image.fromarray(img_array.astype('uint8')).convert('RGB')
            img.save(os.path.join(VAL_DIR, class_name, f"mock_val_{i}.jpg"))

if __name__ == '__main__':
    print("Generating mock image dataset...")
    create_mock_images()
    print("Mock dataset created successfully!")