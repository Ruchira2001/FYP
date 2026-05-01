"""
GoviConnect SL - Research Dataset Downloader
============================================
Downloads research datasets from Kaggle for the 5 supported disease classes:

  Class                     Source datasets
  ─────────────────────────────────────────────────────────────────────────────
  Rice___Brown_Spot         minhhuy2810/rice-diseases-image-dataset
                            vbookshelf/rice-leaf-diseases
  Rice___Leaf_Blast         minhhuy2810/rice-diseases-image-dataset
  Tomato___Bacterial_spot   abdallahalidev/plantvillage-dataset
                            vipoooool/new-plant-diseases-dataset
  Tomato___Early_blight     abdallahalidev/plantvillage-dataset
                            vipoooool/new-plant-diseases-dataset
  Tomato___Late_blight      abdallahalidev/plantvillage-dataset
                            vipoooool/new-plant-diseases-dataset

Usage
-----
  # Full re-download (clears dataset/ first):
  python download_datasets.py

  # Top-up: add more images to under-represented classes only:
  python download_datasets.py --append

Targets 2 000 training images per class.
"""

import argparse
import os
import sys
import shutil
import zipfile
import random

# ── Config ───────────────────────────────────────────────────────────────────
ML_DIR      = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(ML_DIR, "dataset")
TRAIN_DIR   = os.path.join(DATASET_DIR, "train")
VAL_DIR     = os.path.join(DATASET_DIR, "val")
# Short root-level temp path to avoid Windows 260-char path limit
TMP_DIR     = r"C:\kgl_tmp"
VAL_SPLIT   = 0.20

# Stop pulling images for a class once its train set reaches this size.
# Rice classes (Brown Spot=1950, Leaf Blast=1790) use a lower bar so we
# don't trigger a 12 GB rice download just to add a few hundred images.
# Tomato Early/Late blight (800 each) still need the full top-up to 2000.
TARGET_TRAIN_PER_CLASS = 2000
TARGET_TRAIN_RICE = 1750   # Rice classes are already at or above this — skip their sources

# ── Class definitions ─────────────────────────────────────────────────────────
# Keywords used to locate the source folder inside a downloaded archive.
CLASSES = {
    "Rice___Brown_Spot":       ["Brown_Spot",             "brownspot",    "brown"],
    "Rice___Leaf_Blast":       ["Leaf_Blast",              "leafblast",    "blast"],
    "Tomato___Bacterial_spot": ["Tomato___Bacterial_spot", "bacterial_spot", "bacterial"],
    "Tomato___Early_blight":   ["Tomato___Early_blight",  "early_blight", "earlyblight"],
    "Tomato___Late_blight":    ["Tomato___Late_blight",   "late_blight",  "lateblight"],
}

# Ordered list of Kaggle datasets.  Each archive is only downloaded when at
# least one of its classes still needs more images.
SOURCES = [
    # Primary sources
    {
        "slug": "abdallahalidev/plantvillage-dataset",
        "classes": ["Tomato___Bacterial_spot"],
        "note": "PlantVillage – ~2 000 Tomato Bacterial spot (Early/Late only have ~800 each here — use vipoooool instead)",
    },
    {
        "slug": "minhhuy2810/rice-diseases-image-dataset",
        "classes": ["Rice___Brown_Spot", "Rice___Leaf_Blast"],
        "note": "Rice Diseases – ~2 400 Brown Spot + ~2 200 Leaf Blast",
        "target": TARGET_TRAIN_RICE,
    },
    # Supplementary — vipoooool has 87k images with 2 000+ Tomato Early/Late blight each
    {
        "slug": "vipoooool/new-plant-diseases-dataset",
        "classes": ["Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight"],
        "note": "New Plant Diseases Dataset – 87k images; primary source for Tomato Early/Late blight top-up",
    },
    # Extra rice backup (only if rice classes still below TARGET_TRAIN_RICE)
    {
        "slug": "vbookshelf/rice-leaf-diseases",
        "classes": ["Rice___Brown_Spot"],
        "note": "Rice Leaf Diseases – extra Brown Spot images",
        "target": TARGET_TRAIN_RICE,
    },
]


# ── Kaggle auth ───────────────────────────────────────────────────────────────

def get_kaggle_api():
    try:
        from kaggle import KaggleApi
    except ImportError:
        print("Installing kaggle package...")
        os.system(f'"{sys.executable}" -m pip install kaggle -q')
        from kaggle import KaggleApi
    api = KaggleApi()
    api.authenticate()
    print("Kaggle authenticated.")
    return api


# ── Download helpers ──────────────────────────────────────────────────────────

def download_and_extract(api, slug, dest_dir):
    """Download a Kaggle dataset and extract it to dest_dir."""
    os.makedirs(dest_dir, exist_ok=True)
    print(f"\n  Downloading: {slug}")
    try:
        api.dataset_download_files(slug, path=dest_dir, quiet=False, force=True)
    except Exception as e:
        print(f"  ERROR downloading {slug}: {e}")
        return

    zips = [f for f in os.listdir(dest_dir) if f.endswith(".zip")]
    if not zips:
        print(f"  No zip found in {dest_dir}")
        return

    zip_path = os.path.join(dest_dir, zips[0])
    print(f"  Extracting {zips[0]} ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.infolist():
            target = os.path.join(dest_dir, member.filename)
            if member.is_dir():
                os.makedirs(target, exist_ok=True)
            else:
                os.makedirs(os.path.dirname(target), exist_ok=True)
                try:
                    with zf.open(member) as src, open(target, "wb") as dst:
                        shutil.copyfileobj(src, dst)
                except Exception:
                    pass   # skip files with problematic names
    os.remove(zip_path)
    print(f"  Extracted to {dest_dir}")


def find_folder_by_keywords(root, keywords):
    """Walk tree for a folder whose name contains any of the keywords."""
    for dirpath, dirnames, _ in os.walk(root):
        for d in dirnames:
            d_norm = d.lower().replace(" ", "_").replace("-", "_")
            for kw in keywords:
                if kw.lower().replace(" ", "_").replace("-", "_") in d_norm:
                    return os.path.join(dirpath, d)
    return None


# ── Dataset helpers ───────────────────────────────────────────────────────────

def current_train_count(class_name):
    cls_dir = os.path.join(TRAIN_DIR, class_name)
    if not os.path.isdir(cls_dir):
        return 0
    return sum(
        1 for f in os.listdir(cls_dir)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    )


def copy_and_split(source_folder, class_name, max_new=None):
    """
    Copy images from source_folder into dataset/train and dataset/val.
    max_new: if set, copy at most this many images total (train + val).
    Returns (n_train_added, n_val_added).
    """
    if source_folder is None or not os.path.isdir(source_folder):
        return 0, 0

    images = [
        f for f in os.listdir(source_folder)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    if not images:
        return 0, 0

    random.shuffle(images)
    if max_new is not None:
        images = images[:max_new]

    split_idx  = int(len(images) * (1 - VAL_SPLIT))
    train_imgs = images[:split_idx]
    val_imgs   = images[split_idx:]

    train_dst = os.path.join(TRAIN_DIR, class_name)
    val_dst   = os.path.join(VAL_DIR,   class_name)
    os.makedirs(train_dst, exist_ok=True)
    os.makedirs(val_dst,   exist_ok=True)

    # Use offset so new files don't overwrite existing ones
    existing_train = len(os.listdir(train_dst))
    existing_val   = len(os.listdir(val_dst))

    for i, fname in enumerate(train_imgs):
        shutil.copy2(
            os.path.join(source_folder, fname),
            os.path.join(train_dst, f"train_{existing_train + i}.jpg"),
        )
    for i, fname in enumerate(val_imgs):
        shutil.copy2(
            os.path.join(source_folder, fname),
            os.path.join(val_dst, f"val_{existing_val + i}.jpg"),
        )

    return len(train_imgs), len(val_imgs)


def print_dataset_summary():
    print("\n" + "=" * 68)
    print("  Dataset Summary")
    print("=" * 68)
    total_train = total_val = 0
    for cls in CLASSES:
        t = current_train_count(cls)
        v_dir = os.path.join(VAL_DIR, cls)
        v = (
            sum(1 for f in os.listdir(v_dir) if f.lower().endswith((".jpg", ".jpeg", ".png")))
            if os.path.isdir(v_dir) else 0
        )
        flag = "  <<< needs more" if t < 1500 else ""
        print(f"  {cls:<38} train={t:>5}  val={v:>4}{flag}")
        total_train += t
        total_val   += v
    print("─" * 68)
    print(f"  {'TOTAL':<38} train={total_train:>5}  val={total_val:>4}")
    print("=" * 68)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="GoviConnect SL dataset downloader")
    parser.add_argument(
        "--append", action="store_true",
        help="Add more images to existing dataset instead of starting fresh",
    )
    args = parser.parse_args()

    print("=" * 68)
    print("  GoviConnect SL — Dataset Downloader")
    print("=" * 68)

    if not args.append:
        print("\nClearing old dataset/ ...")
        if os.path.exists(DATASET_DIR):
            shutil.rmtree(DATASET_DIR)
    else:
        print("\n--append mode: keeping existing images, topping up short classes.")

    print_dataset_summary()

    api = get_kaggle_api()

    for source in SOURCES:
        slug           = source["slug"]
        note           = source.get("note", "")
        needed_classes = source["classes"]
        target         = source.get("target", TARGET_TRAIN_PER_CLASS)

        # Only download if at least one target class is still short
        classes_to_fill = [
            cls for cls in needed_classes
            if current_train_count(cls) < target
        ]
        if not classes_to_fill:
            print(f"\nSkipping {slug} — all target classes already at {target}+ train images.")
            continue

        print(f"\n{'─'*68}")
        print(f"  Source : {slug}")
        if note:
            print(f"  Note   : {note}")
        print(f"  Filling: {', '.join(classes_to_fill)}")

        slug_key = slug.split("/")[-1]
        tmp_dest = os.path.join(TMP_DIR, slug_key)
        download_and_extract(api, slug, tmp_dest)

        for cls in classes_to_fill:
            have    = current_train_count(cls)
            need    = max(0, target - have)
            if need == 0:
                continue

            # Budget: how many total images to copy (train + val = max_new)
            max_new = int(need / (1 - VAL_SPLIT)) + 10

            src = find_folder_by_keywords(tmp_dest, CLASSES[cls])
            if src is None:
                print(f"    {cls}: folder not found in archive, skipping.")
                continue

            t, v    = copy_and_split(src, cls, max_new=max_new)
            after   = current_train_count(cls)
            status  = "OK" if after >= target else f"still need {target - after}"
            print(f"    {cls}: +{t} train  +{v} val  (total train={after})  [{status}]")

        print(f"\n  Cleaning up {tmp_dest} ...")
        shutil.rmtree(tmp_dest, ignore_errors=True)

    # Remove temp root if empty
    shutil.rmtree(TMP_DIR, ignore_errors=True)

    print_dataset_summary()
    print("\nNow run:")
    print("  python train_model.py\n")


if __name__ == "__main__":
    main()

