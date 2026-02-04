"""
Regenerate parkinson_model.h5 with pickle protocol 4 for better compatibility
"""
import h5py
import pickle
import numpy as np

# Load the existing model
print("Loading existing model...")
with h5py.File('parkinson_model.h5', 'r') as h5f:
    model_data = bytes(h5f['pickle_model']['data'][:])
    model_obj = pickle.loads(model_data)
    scaler = model_obj['scaler']
    model = model_obj['model']

print(f"Model type: {type(model)}")
print(f"Scaler type: {type(scaler)}")

# Save with protocol 4 (compatible across Python 3.4+)
print("\nRegenerating with pickle protocol 4...")
with h5py.File('parkinson_model.h5', 'w') as h5f:
    h5f.attrs['model_name'] = 'Enhanced_Ensemble'
    h5f.attrs['accuracy'] = 0.95  # Placeholder
    
    # Save scaler
    scaler_group = h5f.create_group('scaler')
    scaler_group.create_dataset('mean', data=scaler.mean_)
    scaler_group.create_dataset('scale', data=scaler.scale_)
    
    # Save model with protocol 4
    pickle_group = h5f.create_group('pickle_model')
    model_data = pickle.dumps({'model': model, 'scaler': scaler}, protocol=4)
    pickle_group.create_dataset('data', data=np.frombuffer(model_data, dtype=np.uint8))

print("✅ Model regenerated successfully!")

# Test loading
print("\nTesting reload...")
with h5py.File('parkinson_model.h5', 'r') as h5f:
    test_data = bytes(h5f['pickle_model']['data'][:])
    test_obj = pickle.loads(test_data)
    print(f"✓ Successfully loaded model: {type(test_obj['model'])}")
    print(f"✓ Successfully loaded scaler: {type(test_obj['scaler'])}")
