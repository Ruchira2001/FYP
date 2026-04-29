"""
GoviConnect SL - Research Dataset Downloader
============================================
Downloads real research datasets from Kaggle:
  1. PlantVillage Dataset   -> Tomato___Bacterial_spot, Early_blight, Late_blight
  2. Rice Diseases Dataset  -> Rice___Brown_Spot, Rice___Leaf_Blast

Uses Kaggle Python API directly to avoid Windows path-length issues with --unzip flag.
"""

import os
import sys
import shutil
import zipfile
import random

# ---- Config ----
ML_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(ML_DIR, "dataset")
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VAL_DIR = os.path.join(DATASET_DIR, "val")
# Use a short path at root level to avoid Windows 260-char path limit
TMP_DIR = r"C:\kgl_tmp"
VAL_SPLIT = 0.2


# ---------------------------
# 1. Authenticate Kaggle API
# ---------------------------
def get_kaggle_api():
    try:
        from kaggle import KaggleApi
    except ImportError:
        print("📦 Installing kaggle package...")
        os.system(f'"{sys.executable}" -m pip install kaggle -q')
        from kaggle import KaggleApi

    api = KaggleApi()
    api.authenticate()
    print("✅ Kaggle authenticated.")
    return api


# ---------------------------
# 2. Download + extract zip
# ---------------------------
def download_and_extract(api, dataset_slug, dest_dir):
    """Download a Kaggle dataset zip and extract it using Python zipfile."""
    os.makedirs(dest_dir, exist_ok=True)
    slug_name = dataset_slug.split("/")[-1]
    zip_path = os.path.join(dest_dir, f"{slug_name}.zip")

    print(f"\n⬇️  Downloading: {dataset_slug}")
    api.dataset_download_files(dataset_slug, path=dest_dir, quiet=False, force=True)

    # Find the downloaded zip (kaggle names it <dataset-name>.zip)
    zips = [f for f in os.listdir(dest_dir) if f.endswith(".zip")]
    if not zips:
        print(f"   ❌ No zip found in {dest_dir}")
        return

    zip_path = os.path.join(dest_dir, zips[0])
    print(f"   📦 Extracting {zips[0]} ...")
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for member in zf.infolist():
            # Sanitize path to avoid Windows long-path issues
            target_path = os.path.join(dest_dir, member.filename)
            if member.is_dir():
                os.makedirs(target_path, exist_ok=True)
            else:
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                try:
                    with zf.open(member) as src, open(target_path, "wb") as dst:
                        shutil.copyfileobj(src, dst)
                except Exception as e:
                    pass  # Skip files with problematic names

    os.remove(zip_path)
    print(f"   ✅ Extracted to {dest_dir}")


# ---------------------------
# 3. Find class folder
# ---------------------------
def find_folder_by_name(root, name, keywords=None):
    """Walk tree looking for a folder that matches name or any keyword."""
    name_lower = name.lower()
    for dirpath, dirnames, _ in os.walk(root):
        for d in dirnames:
            d_lower = d.lower().replace(" ", "_").replace("-", "_")
            if d_lower == name_lower:
                return os.path.join(dirpath, d)
            if keywords:
                for kw in keywords:
                    if kw.lower() in d_lower:
                        return os.path.join(dirpath, d)
    return None


# ---------------------------
# 4. Copy + split images
# ---------------------------
def copy_and_split(source_folder, class_name):
    if source_folder is None or not os.path.isdir(source_folder):
        print(f"   ⚠️  Source not found for {class_name}, skipping.")
        return 0, 0

    images = [
        f for f in os.listdir(source_folder)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ]

    if not images:
        print(f"   ⚠️  No images in {source_folder}")
        return 0, 0

    random.shuffle(images)
    split_idx = int(len(images) * (1 - VAL_SPLIT))
    train_imgs = images[:split_idx]
    val_imgs = images[split_idx:]

    train_dst = os.path.join(TRAIN_DIR, class_name)
    val_dst = os.path.join(VAL_DIR, class_name)
    os.makedirs(train_dst, exist_ok=True)
    os.makedirs(val_dst, exist_ok=True)

    for i, fname in enumerate(train_imgs):
        shutil.copy2(os.path.join(source_folder, fname), os.path.join(train_dst, f"train_{i}.jpg"))
    for i, fname in enumerate(val_imgs):
        shutil.copy2(os.path.join(source_folder, fname), os.path.join(val_dst, f"val_{i}.jpg"))

    print(f"   ✅ {class_name}: {len(train_imgs)} train + {len(val_imgs)} val")
    return len(train_imgs), len(val_imgs)


# ---------------------------
# 5. Main
# ---------------------------
def main():
    print("=" * 60)
    print(" GoviConnect SL - Research Dataset Downloader")
    print("=" * 60)

    api = get_kaggle_api()

    # Clean old dataset
    if os.path.exists(DATASET_DIR):
        print("\n🗑️  Clearing old dataset...")
        shutil.rmtree(DATASET_DIR)

    # Temp download dirs (short paths to avoid Windows limit)
    pv_dir = os.path.join(TMP_DIR, "pv")
    rice_dir = os.path.join(TMP_DIR, "rice")

    # ---- Download both datasets ----
    download_and_extract(api, "abdallahalidev/plantvillage-dataset", pv_dir)
    download_and_extract(api, "minhhuy2810/rice-diseases-image-dataset", rice_dir)

    print("\n📂 Organising classes into dataset/train and dataset/val ...")
    total_train = 0
    total_val = 0

    # Tomato classes from PlantVillage
    tomato_classes = {
        "Tomato___Bacterial_spot": ["bacterial_spot", "bacterial"],
        "Tomato___Early_blight":   ["early_blight", "earlyblight"],
        "Tomato___Late_blight":    ["late_blight", "lateblight"],
    }
    for cls, kws in tomato_classes.items():
        src = find_folder_by_name(pv_dir, cls, kws)
        t, v = copy_and_split(src, cls)
        total_train += t
        total_val += v

    # Rice classes
    rice_classes = {
        "Rice___Brown_Spot": ["brown_spot", "brownspot", "brown"],
        "Rice___Leaf_Blast": ["leaf_blast", "leafblast", "blast"],
    }
    for cls, kws in rice_classes.items():
        src = find_folder_by_name(rice_dir, cls, kws)
        t, v = copy_and_split(src, cls)
        total_train += t
        total_val += v

    # Cleanup temp
    print("\n🗑️  Cleaning up temp files...")
    shutil.rmtree(TMP_DIR, ignore_errors=True)

    print("\n" + "=" * 60)
    print(f" ✅ Dataset Ready!")
    print(f"    Total Training Images  : {total_train}")
    print(f"    Total Validation Images: {total_val}")
    print(f"    Dataset Location       : {DATASET_DIR}")
    print("=" * 60)
    print("\n🚀 Now run:")
    print(f"   python train_model.py\n")


if __name__ == "__main__":
    main()
