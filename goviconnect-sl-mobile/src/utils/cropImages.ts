const CROP_IMAGE_MAP: Record<string, string> = {
    tea: 'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?auto=format&fit=crop&w=800&q=80',
    paddy: 'https://images.unsplash.com/photo-1536058847990-b28a5b7f5f0d?auto=format&fit=crop&w=800&q=80',
    rice: 'https://images.unsplash.com/photo-1536058847990-b28a5b7f5f0d?auto=format&fit=crop&w=800&q=80',
    tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    chili: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
    chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
    potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    carrot: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=800&q=80',
    cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
    beans: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=80',
    mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    banana: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80',
    coconut: 'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=800&q=80',
    cinnamon: 'https://images.unsplash.com/photo-1600697394936-c7a27cf484d3?auto=format&fit=crop&w=800&q=80',
    pepper: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    'black pepper': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    ginger: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80',
    turmeric: 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?auto=format&fit=crop&w=800&q=80',
};

const normalizeCropKey = (value?: string) => (value || '').trim().toLowerCase();

export const getCropImage = (cropId?: string, cropName?: string): string | undefined => {
    const cropIdKey = normalizeCropKey(cropId);
    const cropNameKey = normalizeCropKey(cropName);
    return CROP_IMAGE_MAP[cropIdKey] || CROP_IMAGE_MAP[cropNameKey];
};
