import os
import io
import logging
import sys
from typing import Dict, Tuple, Any

import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
try:
    import cv2  
    _CV2_OK = True
except Exception:
    _CV2_OK = False
try:
    from skimage.feature import graycomatrix, graycoprops
    _SKIMAGE_OK = True
except Exception:
    _SKIMAGE_OK = False
import pickle
import joblib

try:
    import keras
    from keras.models import load_model  
except Exception:
    try:
        from tensorflow.keras.models import load_model  
    except Exception as e:
        raise RuntimeError("Neither standalone Keras nor tensorflow.keras is available. Install with 'pip install keras tensorflow'.") from e

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
logging.basicConfig(level=logging.INFO)


def _discover_models() -> Dict[str, str]:
    name_to_path: Dict[str, str] = {}
    for fname in os.listdir(BASE_DIR):
        low = fname.lower()
        if low.endswith(".h5"):
            name = os.path.splitext(fname)[0].lower()
            name_to_path[name] = os.path.join(BASE_DIR, fname)

    aliases = {
        "alzheimer": "alzimer",
        "brain_tumor": "brain_tumor_cnn_model",
    }
    for alias, target in aliases.items():
        if target in name_to_path:
            name_to_path[alias] = name_to_path[target]
    return name_to_path


MODEL_PATHS: Dict[str, str] = _discover_models()
MODELS: Dict[str, Any] = {}
SKIPPED: Dict[str, str] = {}

CLASS_LABELS = {
    "alzheimer": ["Mild Demented", "Moderate Demented", "Non Demented", "Very Mild Demented"],
    "alzimer": ["Mild Demented", "Moderate Demented", "Non Demented", "Very Mild Demented"],
    "brain_tumor": ["No Tumor", "Tumor Detected"],
    "brain_tumor_cnn_model": ["No Tumor", "Tumor Detected"],
    "parkinson": ["No Parkinson's", "Parkinson's"],
    "parkinsons": ["No Parkinson's", "Parkinson's"],
    "parkinson_model": ["No Parkinson's", "Parkinson's"],
}


def _load_models() -> None:
    for name, path in MODEL_PATHS.items():
        if name in MODELS:
            continue
        try:
            mdl = load_model(path)
            MODELS[name] = {"type": "keras", "model": mdl}
            logging.info(f"Loaded Keras model: {name} -> {path}")
        except Exception as e:
            SKIPPED[name] = f"Failed to load: {e}"
            logging.warning(f"Skipping {name}: {e}")

    # Load Parkinson PKL if present (outside MODEL_PATHS which only tracks .h5)
    pk_path = os.path.join(BASE_DIR, "parkinson_model.pkl")
    if os.path.isfile(pk_path) and "parkinson" not in MODELS:
        try:
            try:
                pk_obj = joblib.load(pk_path)
            except Exception:
                with open(pk_path, "rb") as f:
                    pk_obj = pickle.load(f)
            if isinstance(pk_obj, dict) and 'model' in pk_obj and 'scaler' in pk_obj:
                MODELS["parkinson"] = {"type": "sklearn", "model": pk_obj['model'], "scaler": pk_obj['scaler']}
                MODELS["parkinsons"] = MODELS["parkinson"]
                MODEL_PATHS["parkinson"] = pk_path
                MODEL_PATHS["parkinsons"] = pk_path
                logging.info("Loaded Parkinson PKL model")
            else:
                SKIPPED["parkinson"] = "PKL missing expected keys (model, scaler)"
        except Exception as e:
            SKIPPED["parkinson"] = f"Failed to load PKL: {e}"


def _get_target_size_and_channels(model) -> Tuple[Tuple[int, int], int, bool]:
    input_shape = getattr(model, "input_shape", None)
    if not input_shape:
        input_shape = model.inputs[0].shape
    if hasattr(input_shape, "as_list"):
        input_shape = tuple(input_shape.as_list())

    channels_first = False
    if len(input_shape) == 4:
        if input_shape[-1] in (1, 3):
            h, w, c = input_shape[1], input_shape[2], input_shape[3]
        elif input_shape[1] in (1, 3):
            c, h, w = input_shape[1], input_shape[2], input_shape[3]
            channels_first = True
        else:
            h, w = input_shape[1], input_shape[2]
            c = input_shape[3] if len(input_shape) > 3 else 3
    else:
        h, w, c = 224, 224, 3

    h = int(h or 224)
    w = int(w or 224)
    c = int(c or 3)
    return (h, w), c, channels_first


def _preprocess_image(file_storage, model) -> np.ndarray:
    target_size, channels, channels_first = _get_target_size_and_channels(model)
    raw = file_storage.read()
    file_storage.stream.seek(0)
    img = Image.open(io.BytesIO(raw))
    img = img.convert("L" if channels == 1 else "RGB")
    img = img.resize((target_size[1], target_size[0]))

    arr = np.asarray(img, dtype=np.float32)
    if channels == 1 and arr.ndim == 2:
        arr = np.expand_dims(arr, axis=-1)
    arr = arr / 255.0
    arr = np.expand_dims(arr, axis=0)
    if channels_first:
        arr = np.transpose(arr, (0, 3, 1, 2))
    return arr


# Parkinson feature extraction (must match training pipeline order as closely as possible)
def _extract_parkinson_features(gray: np.ndarray) -> np.ndarray:
    # Ensure grayscale uint8
    if gray.dtype != np.uint8:
        gray = gray.astype(np.uint8)
    feats: list[float] = []
    # Basic intensity stats
    feats.extend([
        float(gray.mean()), float(gray.std()), float(np.median(gray)),
        float(gray.min()), float(gray.max()),
        float(np.percentile(gray, 10)), float(np.percentile(gray, 25)),
        float(np.percentile(gray, 75)), float(np.percentile(gray, 90)),
        float(gray.var()),
    ])
    # Histogram (16 bins normalized)
    hist, _ = np.histogram(gray.flatten(), bins=16, range=(0, 256))
    hist = hist.astype(np.float32)
    hist /= (hist.sum() + 1e-7)
    feats.extend(hist.tolist())
    # GLCM texture (if skimage available)
    if _SKIMAGE_OK:
        try:
            glcm = graycomatrix(gray, [1], [0], 256, symmetric=True, normed=True)
            for prop in ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation', 'ASM']:
                feats.append(float(graycoprops(glcm, prop)[0, 0]))
        except Exception:
            feats.extend([0.0] * 6)
    else:
        feats.extend([0.0] * 6)
    # Edge & Sobel stats (if cv2 available)
    if _CV2_OK:
        try:
            edges = cv2.Canny(gray, 50, 150)
            feats.extend([
                float(edges.mean()), float(edges.std()),
                float((edges > 0).mean()), float(edges.max()),
            ])
            sx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            sy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            feats.extend([
                float(np.abs(sx).mean()), float(np.abs(sy).mean()),
                float(sx.std()), float(sy.std()),
            ])
        except Exception:
            feats.extend([0.0] * 8)
    else:
        feats.extend([0.0] * 8)
    return np.array(feats, dtype=np.float32).reshape(1, -1)


def _predict_parkinson(file_storage, model_info: Dict[str, Any]) -> Dict[str, Any]:
    # Read image as grayscale
    raw = file_storage.read()
    file_storage.stream.seek(0)
    img = Image.open(io.BytesIO(raw)).convert("L").resize((128, 128))
    gray = np.array(img)
    X = _extract_parkinson_features(gray)
    scaler = model_info.get("scaler")
    clf = model_info.get("model")
    if scaler is not None:
        Xs = scaler.transform(X)
    else:
        Xs = X
    prob1: float
    if hasattr(clf, 'predict_proba'):
        probs = clf.predict_proba(Xs)[0]
        prob1 = float(probs[-1])  # assume last index is Parkinson class
    else:
        pred = clf.predict(Xs)[0]
        # convert hard label to pseudo-probability
        prob1 = 0.9 if int(pred) == 1 else 0.1
    class_idx = 1 if prob1 >= 0.8 else 0
    labels = CLASS_LABELS.get("parkinson", ["Healthy", "Parkinson"])
    class_name = labels[class_idx]
    confidence = max(prob1, 1.0 - prob1)
    return {"class": class_name, "confidence": float(confidence)}


def _predict_with_model(model, batch: np.ndarray, model_name: str, threshold: float | None = None) -> Dict[str, Any]:
    """Return only predicted class and confidence."""
    preds = np.array(model.predict(batch))
    labels = CLASS_LABELS.get(model_name, [])

    # Multi-class probs shape (1, N)
    if preds.ndim == 2 and preds.shape[0] == 1 and preds.shape[1] > 1:
        probs = preds[0]
        top_idx = int(np.argmax(probs))
        class_name = labels[top_idx] if top_idx < len(labels) else f"Class {top_idx}"
        confidence = float(probs[top_idx])
        return {"class": class_name, "confidence": confidence}

    # Binary sigmoid (1,1)
    if preds.ndim == 2 and preds.shape[1] == 1:
        prob = float(preds[0][0])
        thr = threshold if threshold is not None else 0.5
        class_idx = 1 if prob >= thr else 0
        class_name = labels[class_idx] if class_idx < len(labels) else f"Class {class_idx}"
        confidence = prob if prob >= thr else 1.0 - prob
        return {"class": class_name, "confidence": float(confidence)}

    # Fallback: treat as probabilities vector
    flat = preds.flatten()
    if flat.size > 1:
        top_idx = int(np.argmax(flat))
        class_name = labels[top_idx] if top_idx < len(labels) else f"Class {top_idx}"
        return {"class": class_name, "confidence": float(np.max(flat))}

    # Single scalar probability
    prob = float(flat[0]) if flat.size == 1 else 0.0
    thr = threshold if threshold is not None else 0.5
    class_idx = 1 if prob >= thr else 0
    class_name = labels[class_idx] if class_idx < len(labels) else f"Class {class_idx}"
    confidence = prob if prob >= thr else 1.0 - prob
    return {"class": class_name, "confidence": float(confidence)}


@app.route("/models", methods=["GET"])
def list_models():
    return jsonify({
        "models": sorted(MODELS.keys()),
        "skipped": SKIPPED,
    })


@app.route("/predict/<model_name>", methods=["POST"])
def predict(model_name: str):
    model_name = model_name.lower()
    if model_name not in MODEL_PATHS and model_name not in MODELS:
        return jsonify({
            "error": f"Model '{model_name}' not found.",
            "available": sorted(MODEL_PATHS.keys()),
        }), 404

    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded. Use field name 'image'."}), 400

    file_storage = request.files["image"]
    model_info = MODELS.get(model_name)
    if model_info is None:
        _load_models()
        model_info = MODELS.get(model_name)
        if model_info is None:
            return jsonify({"error": f"Failed to load model '{model_name}'"}), 500

    thr_param = request.args.get("threshold", None)
    threshold = None
    if thr_param is not None:
        try:
            threshold = float(thr_param)
        except ValueError:
            threshold = None

    if model_info.get("type") == "sklearn":
        out = _predict_parkinson(file_storage, model_info)
        return jsonify({"model": model_name, "class": out["class"], "confidence": out["confidence"]})

    model = model_info.get("model")
    batch = _preprocess_image(file_storage, model)
    if threshold is None and model_name in ("brain_tumor", "brain_tumor_cnn_model"):
        threshold = 0.8
    out = _predict_with_model(model, batch, model_name, threshold)
    return jsonify({"model": model_name, "class": out["class"], "confidence": out["confidence"]})


@app.route("/predict/alzheimer", methods=["POST"])
def predict_alzheimer():
    return predict("alzheimer")


@app.route("/predict/brain_tumor", methods=["POST"])
def predict_brain_tumor():
    return predict("brain_tumor")


@app.route("/predict/parkinson", methods=["POST"])
def predict_parkinson():
    return predict("parkinson")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": sorted(MODELS.keys()), "skipped": SKIPPED})


_load_models()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)


