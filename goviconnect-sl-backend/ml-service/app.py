"""
GoviConnect SL - Crop Disease Detection ML Microservice
Uses ResNet50 trained on 5 target crop diseases
"""

import os
import io
import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.applications.resnet50 import preprocess_input
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# --------- Configuration ---------
MODEL_PATH = os.environ.get('MODEL_PATH', 'model/plant_disease_model.keras')
LABELS_PATH = os.environ.get('LABELS_PATH', 'labels.json')
IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 0.5

# --------- Load Model & Labels ---------
model = None
labels = None
treatments_db = None

def load_model():
    """Load the TensorFlow model on startup"""
    global model, labels, treatments_db
    
    try:
        import tensorflow as tf
        
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            logger.info(f"✅ Model loaded from {MODEL_PATH}")
        else:
            logger.warning(f"⚠️ Model file not found at {MODEL_PATH}. Using mock predictions.")
            logger.info("   To use real predictions, train and place your model at: model/plant_disease_model.h5")
            logger.info("   Run: python train_model.py")
    except ImportError:
        logger.warning("⚠️ TensorFlow not installed. Using mock predictions.")
        logger.info("   Install with: pip install tensorflow")
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
    
    # Load labels
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, 'r', encoding='utf-8') as f:
            labels = json.load(f)
        logger.info(f"✅ Loaded {len(labels.get('classes', []))} disease labels")
    else:
        logger.warning(f"⚠️ Labels file not found at {LABELS_PATH}. Using default labels.")
        labels = get_default_labels()
    
    # Load treatments database
    treatments_path = 'treatments.json'
    if os.path.exists(treatments_path):
        with open(treatments_path, 'r', encoding='utf-8') as f:
            treatments_db = json.load(f)
        logger.info(f"✅ Loaded treatments database")
    else:
        treatments_db = get_default_treatments()


def get_default_labels():
    """Top 5 Target PlantVillage-compatible labels for Sri Lankan crops"""
    return {
        "classes": [
            "Rice___Brown_Spot",
            "Rice___Leaf_Blast",
            "Tomato___Bacterial_spot",
            "Tomato___Early_blight",
            "Tomato___Late_blight"
        ]
    }


def get_default_treatments():
    """Default treatment database for detected diseases"""
    return {
        "Tomato___Early_blight": {
            "diseaseName": "Early Blight",
            "diseaseNameSi": "මුල් දාහය",
            "treatments": [
                "Apply copper-based fungicide every 7-10 days",
                "Remove and destroy infected lower leaves",
                "Improve air circulation between plants",
                "Apply mulch to prevent soil splash"
            ],
            "treatmentsSi": [
                "සෑම දින 7-10 කට වරක් තඹ පදනම් දිලීර නාශකය යොදන්න",
                "ආසාදිත පහළ කොළ ඉවත් කර විනාශ කරන්න",
                "ශාක අතර වායු සංසරණය වැඩි දියුණු කරන්න",
                "පස ඉසිීම වැළැක්වීමට වසු යොදන්න"
            ],
            "preventionTips": [
                "Use disease-resistant varieties",
                "Rotate crops every 2-3 years",
                "Water at the base, avoid wetting leaves",
                "Maintain proper plant spacing"
            ],
            "preventionTipsSi": [
                "රෝග ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න",
                "සෑම වසර 2-3 කට බෝග මාරු කරන්න",
                "පාදයේ ජලය දෙන්න, කොළ තෙමීම වළකින්න",
                "නිසි ශාක පරතරය පවත්වාගන්න"
            ]
        },
        "Tomato___Late_blight": {
            "diseaseName": "Late Blight",
            "diseaseNameSi": "පසු දාහය",
            "treatments": [
                "Apply mancozeb or chlorothalonil fungicide",
                "Remove and burn all infected plant parts",
                "Ensure good drainage around plants",
                "Apply systemic fungicide in severe cases"
            ],
            "treatmentsSi": [
                "මැන්කොසෙබ් හෝ ක්ලෝරෝතලෝනිල් දිලීර නාශකය යොදන්න",
                "ආසාදිත ශාක කොටස් සියල්ල ඉවත් කර පුළුස්සා දමන්න",
                "ශාක වටා හොඳ ජලාපවහනය සහතික කරන්න",
                "දරුණු අවස්ථාවලදී පද්ධතිගත දිලීර නාශකය යොදන්න"
            ],
            "preventionTips": [
                "Use resistant varieties",
                "Avoid overhead irrigation",
                "Space plants adequately for air flow",
                "Monitor weather for disease-favorable conditions"
            ],
            "preventionTipsSi": [
                "ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න",
                "ඉහළින් වාරිමාර්ග වළකින්න",
                "වායු ගලනය සඳහා ශාක ප්‍රමාණවත් ලෙස පරතර කරන්න",
                "රෝගයට හිතකර තත්ත්වයන් සඳහා කාලගුණය නිරීක්ෂණය කරන්න"
            ]
        },
        "Tomato___Bacterial_spot": {
            "diseaseName": "Bacterial Spot",
            "diseaseNameSi": "බැක්ටීරියා ලප",
            "treatments": [
                "Apply copper hydroxide spray",
                "Remove infected plants immediately",
                "Avoid working with wet plants",
                "Sanitize gardening tools"
            ],
            "treatmentsSi": [
                "තඹ හයිඩ්‍රොක්සයිඩ් ඉසීම යොදන්න",
                "ආසාදිත ශාක වහාම ඉවත් කරන්න",
                "තෙත් ශාක සමඟ වැඩ කිරීම වළකින්න",
                "ගොවිතැන් මෙවලම් විෂබීජහරණය කරන්න"
            ],
            "preventionTips": [
                "Use certified disease-free seeds",
                "Practice crop rotation with non-solanaceous crops",
                "Avoid overhead watering"
            ],
            "preventionTipsSi": [
                "සහතික කළ රෝග රහිත බීජ භාවිතා කරන්න",
                "සොලනේසියස් නොවන බෝග සමඟ බෝග මාරුව පුහුණු කරන්න",
                "ඉහළින් ජලය දීම වළකින්න"
            ]
        },
        "Rice___Leaf_Blast": {
            "diseaseName": "Rice Leaf Blast",
            "diseaseNameSi": "වී පත්‍ර පිපිරීම",
            "treatments": [
                "Apply tricyclazole 75% WP",
                "Use isoprothiolane for systemic control",
                "Drain and re-flood paddy fields",
                "Reduce nitrogen fertilizer dosage"
            ],
            "treatmentsSi": [
                "ට්‍රයිසයික්ලසෝල් 75% WP යොදන්න",
                "පද්ධතිගත පාලනය සඳහා අයිසොප්‍රොතයොලේන් භාවිතා කරන්න",
                "කුඹුරු ජලය බැස හැර නැවත ජලය පුරවන්න",
                "නයිට්‍රජන් පොහොර මාත්‍රාව අඩු කරන්න"
            ],
            "preventionTips": [
                "Use blast-resistant rice varieties (Bg 94-1, Bg 352)",
                "Maintain balanced NPK fertilization",
                "Avoid excessive nitrogen application",
                "Ensure proper spacing between plants"
            ],
            "preventionTipsSi": [
                "පිපිරීම් ප්‍රතිරෝධී වී ප්‍රභේද භාවිතා කරන්න (Bg 94-1, Bg 352)",
                "සමතුලිත NPK පොහොර යෙදීම පවත්වාගන්න",
                "අධික නයිට්‍රජන් යෙදීම වළකින්න",
                "ශාක අතර නිසි පරතරය සහතික කරන්න"
            ]
        },
        "Rice___Brown_Spot": {
            "diseaseName": "Rice Brown Spot",
            "diseaseNameSi": "වී දුඹුරු ලප",
            "treatments": [
                "Apply mancozeb 75% WP spray",
                "Seed treatment with carbendazim",
                "Improve soil fertility with organic matter"
            ],
            "treatmentsSi": [
                "මැන්කොසෙබ් 75% WP ඉසීම යොදන්න",
                "කාබෙන්ඩසිම් සමඟ බීජ ප්‍රතිකාර",
                "කාබනික ද්‍රව්‍ය සමඟ පස සාරවත් බව වැඩි දියුණු කරන්න"
            ],
            "preventionTips": [
                "Use certified healthy seeds",
                "Maintain balanced fertilization",
                "Improve soil drainage"
            ],
            "preventionTipsSi": [
                "සහතික කළ සෞඛ්‍ය සම්පන්න බීජ භාවිතා කරන්න",
                "සමතුලිත පොහොර යෙදීම පවත්වාගන්න",
                "පස් ජලාපවහනය වැඩි දියුණු කරන්න"
            ]
        },
        "Tea___Blister_Blight": {
            "diseaseName": "Blister Blight",
            "diseaseNameSi": "බිබිලි දාහය",
            "treatments": [
                "Apply copper oxychloride fungicide",
                "Use hexaconazole for systemic control",
                "Maintain proper shade management",
                "Regular plucking rounds to remove infected shoots"
            ],
            "treatmentsSi": [
                "කොපර් ඔක්සික්ලෝරයිඩ් දිලීර නාශකය යොදන්න",
                "පද්ධතිගත පාලනය සඳහා හෙක්සකොනසෝල් භාවිතා කරන්න",
                "නිසි සෙවන කළමනාකරණය පවත්වාගන්න",
                "ආසාදිත දළු ඉවත් කිරීමට නිතිපතා අතු කඩන්න"
            ],
            "preventionTips": [
                "Maintain proper shade (40-60%)",
                "Avoid over-pruning during wet weather",
                "Regular surveillance during monsoon season",
                "Ensure good drainage in tea fields"
            ],
            "preventionTipsSi": [
                "නිසි සෙවන (40-60%) පවත්වාගන්න",
                "තෙත් කාලගුණයේදී අධික කප්පාදු කිරීම වළකින්න",
                "මෝසම් කාලයේ නිතිපතා නිරීක්ෂණය",
                "තේ වතුවල හොඳ ජලාපවහනය සහතික කරන්න"
            ]
        },
        "Chili___Anthracnose": {
            "diseaseName": "Anthracnose",
            "diseaseNameSi": "ඇන්ත්‍රැක්නෝස්",
            "treatments": [
                "Apply mancozeb or propineb fungicide",
                "Remove and destroy infected fruits",
                "Spray carbendazim 50% WP for severe infections"
            ],
            "treatmentsSi": [
                "මැන්කොසෙබ් හෝ ප්‍රොපිනෙබ් දිලීර නාශකය යොදන්න",
                "ආසාදිත ඵල ඉවත් කර විනාශ කරන්න",
                "දරුණු ආසාදනවලට කාබෙන්ඩසිම් 50% WP ඉසින්න"
            ],
            "preventionTips": [
                "Use disease-free seeds",
                "Avoid overhead irrigation",
                "Apply mulch to prevent soil splash",
                "Practice 2-3 year crop rotation"
            ],
            "preventionTipsSi": [
                "රෝග රහිත බීජ භාවිතා කරන්න",
                "ඉහළින් වාරිමාර්ග වළකින්න",
                "පස ඉසීම වැළැක්වීමට වසු යොදන්න",
                "වසර 2-3 බෝග මාරුව පුහුණු කරන්න"
            ]
        },
        "Chili___Leaf_Curl": {
            "diseaseName": "Chili Leaf Curl",
            "diseaseNameSi": "මිරිස් පත්‍ර රෝලිම",
            "treatments": [
                "Apply imidacloprid for whitefly vector control",
                "Remove severely affected plants",
                "Use neem oil spray as organic alternative"
            ],
            "treatmentsSi": [
                "සුදු මැස්සා පාලනය සඳහා ඉමිඩැක්ලොප්‍රිඩ් යොදන්න",
                "දැඩි ලෙස බලපෑමට ලක් වූ ශාක ඉවත් කරන්න",
                "කාබනික විකල්පයක් ලෙස කොහොඹ තෙල් ඉසීම භාවිතා කරන්න"
            ],
            "preventionTips": [
                "Use virus-resistant varieties",
                "Control whitefly populations with yellow sticky traps",
                "Maintain field hygiene"
            ],
            "preventionTipsSi": [
                "වෛරස ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න",
                "කහ ඇලෙන උගුල් වලින් සුදු මැස්සා පාලනය කරන්න",
                "ක්ෂේත්‍ර සනීපාරක්ෂාව පවත්වාගන්න"
            ]
        }
    }

    # Add healthy plant responses
    healthy_crops = ["Tomato___healthy", "Pepper___healthy", "Potato___healthy", 
                     "Rice___healthy", "Tea___healthy", "Chili___healthy"]
    
    for crop in healthy_crops:
        crop_name = crop.split("___")[0]
        treatments_db[crop] = {
            "diseaseName": f"Healthy {crop_name}",
            "diseaseNameSi": f"සෞඛ්‍ය සම්පන්න {crop_name}",
            "treatments": [f"Your {crop_name.lower()} plant looks healthy! Keep up the good work."],
            "treatmentsSi": [f"ඔබේ {crop_name.lower()} ශාකය සෞඛ්‍ය සම්පන්නයි! හොඳ වැඩ කරගෙන යන්න."],
            "preventionTips": [
                "Continue regular monitoring",
                "Maintain current care routine",
                "Watch for any changes in leaf color or shape"
            ],
            "preventionTipsSi": [
                "නිතිපතා නිරීක්ෂණය දිගටම කරගෙන යන්න",
                "වර්තමාන සත්කාර දිනචරියාව පවත්වාගන්න",
                "කොළ වර්ණයේ හෝ හැඩයේ වෙනස්කම් සඳහා නිරීක්ෂණය කරන්න"
            ]
        }
    
    return treatments_db


def preprocess_image(image_bytes):
    """Preprocess image for model prediction"""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = image.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(image)
    img_array = np.expand_dims(img_array, axis=0)
    return preprocess_input(img_array)


def get_mock_prediction(image_bytes):
    """Fallback mock prediction when model is not available"""
    import random
    
    mock_diseases = [
        ("Tomato___Early_blight", 0.87),
        ("Tomato___Late_blight", 0.82),
        ("Tomato___Bacterial_spot", 0.90),
        ("Rice___Leaf_Blast", 0.91),
        ("Rice___Brown_Spot", 0.85),
    ]
    
    disease, confidence = random.choice(mock_diseases)
    return disease, confidence


# --------- API Routes ---------

@app.route('/', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'GoviConnect ML - Crop Disease Detection',
        'model_loaded': model is not None,
        'version': '1.0.0'
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Predict disease from crop image"""
    try:
        # Check if image was provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Read image bytes
        image_bytes = file.read()
        
        if model is not None:
            # Real model prediction
            img_array = preprocess_image(image_bytes)
            predictions = model.predict(img_array, verbose=0)
            
            # Get top prediction
            predicted_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_idx])
            
            class_names = labels.get('classes', [])
            if predicted_idx < len(class_names):
                predicted_class = class_names[predicted_idx]
            else:
                predicted_class = f"Unknown_class_{predicted_idx}"
        else:
            # Mock prediction fallback
            predicted_class, confidence = get_mock_prediction(image_bytes)
        
        # Determine if healthy
        is_healthy = 'healthy' in predicted_class.lower()
        
        # Format disease name
        parts = predicted_class.split('___')
        crop_name = parts[0] if len(parts) > 0 else 'Unknown'
        disease_raw = parts[1] if len(parts) > 1 else 'Unknown'
        disease_name = disease_raw.replace('_', ' ')
        
        # Get treatment info
        treatment_info = treatments_db.get(predicted_class, {})
        
        result = {
            'success': True,
            'prediction': {
                'class': predicted_class,
                'diseaseName': treatment_info.get('diseaseName', disease_name),
                'diseaseNameSi': treatment_info.get('diseaseNameSi', disease_name),
                'crop': crop_name,
                'confidence': round(confidence, 4),
                'isHealthy': is_healthy,
                'treatments': treatment_info.get('treatments', [f'Consult an expert about {disease_name}']),
                'treatmentsSi': treatment_info.get('treatmentsSi', [f'{disease_name} සඳහා විශේෂඥයෙකුගෙන් උපදෙස් ලබා ගන්න']),
                'preventionTips': treatment_info.get('preventionTips', ['Monitor regularly', 'Maintain good field hygiene']),
                'preventionTipsSi': treatment_info.get('preventionTipsSi', ['නිතිපතා නිරීක්ෂණය කරන්න', 'හොඳ ක්ෂේත්‍ර සනීපාරක්ෂාව පවත්වාගන්න']),
            }
        }
        
        logger.info(f"Prediction: {predicted_class} ({confidence:.2%})")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/predict/base64', methods=['POST'])
def predict_base64():
    """Predict disease from base64 encoded image"""
    try:
        import base64
        
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        if model is not None:
            img_array = preprocess_image(image_bytes)
            predictions = model.predict(img_array, verbose=0)
            predicted_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_idx])
            class_names = labels.get('classes', [])
            predicted_class = class_names[predicted_idx] if predicted_idx < len(class_names) else f"Unknown_{predicted_idx}"
        else:
            predicted_class, confidence = get_mock_prediction(image_bytes)
        
        is_healthy = 'healthy' in predicted_class.lower()
        parts = predicted_class.split('___')
        crop_name = parts[0] if len(parts) > 0 else 'Unknown'
        disease_raw = parts[1] if len(parts) > 1 else 'Unknown'
        disease_name = disease_raw.replace('_', ' ')
        
        treatment_info = treatments_db.get(predicted_class, {})
        
        result = {
            'success': True,
            'prediction': {
                'class': predicted_class,
                'diseaseName': treatment_info.get('diseaseName', disease_name),
                'diseaseNameSi': treatment_info.get('diseaseNameSi', disease_name),
                'crop': crop_name,
                'confidence': round(confidence, 4),
                'isHealthy': is_healthy,
                'treatments': treatment_info.get('treatments', []),
                'treatmentsSi': treatment_info.get('treatmentsSi', []),
                'preventionTips': treatment_info.get('preventionTips', []),
                'preventionTipsSi': treatment_info.get('preventionTipsSi', []),
            }
        }
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Base64 prediction error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# --------- Start Server ---------
if __name__ == '__main__':
    load_model()
    
    port = int(os.environ.get('ML_PORT', 5001))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    logger.info(f"\n🧠 GoviConnect ML Service")
    logger.info(f"   Port: {port}")
    logger.info(f"   Model loaded: {model is not None}")
    logger.info(f"   Labels: {len(labels.get('classes', []))} classes\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
