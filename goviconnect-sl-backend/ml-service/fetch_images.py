import os
import time
import requests
from duckduckgo_search import DDGS

# 5 target classes based on our custom ResNet50 model
CLASSES = [
    "Rice___Brown_Spot",
    "Rice___Leaf_Blast",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight"
]

# Query map for DuckDuckGo Image Search
SEARCH_QUERIES = {
    "Rice___Brown_Spot": "Rice brown spot leaf disease symptoms",
    "Rice___Leaf_Blast": "Rice leaf blast disease agriculture",
    "Tomato___Bacterial_spot": "Tomato bacterial spot leaf disease",
    "Tomato___Early_blight": "Tomato early blight leaf disease",
    "Tomato___Late_blight": "Tomato late blight leaf disease",
}

NUM_IMAGES_PER_CLASS = 40  # 40 total = 32 train + 8 val per class
DATASET_DIR = "dataset"
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VAL_DIR = os.path.join(DATASET_DIR, "val")

def build_directories():
    for class_name in CLASSES:
        os.makedirs(os.path.join(TRAIN_DIR, class_name), exist_ok=True)
        os.makedirs(os.path.join(VAL_DIR, class_name), exist_ok=True)

def download_images_for_class(class_name, query):
    print(f"\n🔍 Searching for '{query}'...")
    with DDGS() as ddgs:
        results = list(ddgs.images(query, max_results=NUM_IMAGES_PER_CLASS))
    
    if not results:
        print(f"⚠️ No results found for {class_name}")
        return

    # Split 80/20 train/val
    train_count = int(len(results) * 0.8)
    
    for i, res in enumerate(results):
        url = res.get('image')
        if not url: continue
        
        is_train = i < train_count
        target_dir = TRAIN_DIR if is_train else VAL_DIR
        filepath = os.path.join(target_dir, class_name, f"img_{i}.jpg")
        
        try:
            print(f"   Downloading into {'train' if is_train else 'val'}: {filepath}")
            # Timeout is important to skip slow image hosts
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            with open(filepath, 'wb') as f:
                f.write(response.content)
        except Exception as e:
            print(f"   ❌ Failed to download {url}: {e}")
        
        time.sleep(0.5)

if __name__ == '__main__':
    print("🌱 Building realistic dataset starting...")
    build_directories()
    for current_class in CLASSES:
        download_images_for_class(current_class, SEARCH_QUERIES[current_class])
    print("\n✅ Dataset successfully built with real images! Ready for training.")