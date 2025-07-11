import numpy as np
import librosa
import scipy.signal
from scipy.stats import pearsonr
import json
import sys
import tempfile
import os

def analyze_audio_file(file_path):
    """
    Comprehensive audio analysis using librosa and scipy.

    Args:
        file_path (str): The path to the audio file.

    Returns:
        dict: A dictionary containing the voice characteristics and quality metrics,
              or an error message if the analysis fails.
    """
    try:
        y, sr = load_audio(file_path)

        if y is None or sr is None:
            return {"error": "Failed to load audio file"}

        analysis_results = perform_voice_analysis(y, sr)

        return analysis_results

    except Exception as e:
        error_message = f"Audio analysis failed: {str(e)}"
        return {"error": error_message}

def load_audio(file_path):
    """
    Loads audio file using librosa.

    Args:
        file_path (str): The path to the audio file.

    Returns:
        tuple: A tuple containing the audio data (y) and the sample rate (sr),
               or (None, None) if the loading fails.
    """
    try:
        y, sr = librosa.load(file_path, sr=None)
        return y, sr
    except Exception as e:
        print(json.dumps({"error": f"Error loading audio: {str(e)}"}))
        return None, None

def perform_voice_analysis(y, sr):
    """
    Performs voice analysis and returns voice characteristics.

    Args:
        y (np.ndarray): The audio data.
        sr (int): The sample rate.

    Returns:
        dict: A dictionary containing the voice characteristics and quality metrics,
              or an error message if the analysis fails.
    """
    # Basic audio properties
    duration = len(y) / sr

    # Pitch analysis using fundamental frequency estimation
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7')
    )

    # Remove NaN values and get valid pitch values
    valid_f0 = f0[~np.isnan(f0)]

    if len(valid_f0) == 0:
        return {"error": "No valid pitch detected in audio"}

    # Fundamental frequency statistics
    fundamental_freq = np.median(valid_f0)
    pitch_std = np.std(valid_f0)

    # Jitter calculation (pitch period variability)
    jitter = calculate_jitter(valid_f0) if len(valid_f0) > 10 else 0

    # Shimmer calculation (amplitude variability)
    shimmer = calculate_shimmer(y, sr)

    # Spectral analysis
    stft = librosa.stft(y)
    magnitude = np.abs(stft)

    # Spectral centroid (brightness)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]

    # Spectral rolloff
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]

    # Zero crossing rate (voice quality indicator)
    zcr = librosa.feature.zero_crossing_rate(y)[0]

    # Formant analysis
    formants = estimate_formants(y, sr)
    if "error" in formants:
        return formants

    # Voice quality metrics
    clarity_score = calculate_clarity_score(
        jitter, shimmer, spectral_centroid, zcr
    )

    # Spectral data for visualization
    spectral_data = np.nan_to_num(np.mean(magnitude, axis=1)[:512]).tolist()

    # Pitch contour for visualization
    pitch_contour = np.nan_to_num(valid_f0[:100]).tolist() if len(valid_f0) >= 100 else np.nan_to_num(valid_f0).tolist()

    # Generate recommendations
    recommendations = generate_recommendations(
        fundamental_freq, jitter, shimmer, clarity_score
    )

    return {
        "fundamentalFreq": float(fundamental_freq),
        "jitter": float(jitter),
        "shimmer": float(shimmer),
        "clarityScore": int(clarity_score),
        "formants": formants,
        "spectralData": spectral_data,
        "pitchContour": pitch_contour,
        "recommendations": recommendations,
        "duration": float(duration),
        "voicedPercentage": float(len(valid_f0) / len(f0) * 100)
    }

def calculate_jitter(f0):
    """Calculates jitter (frequency variability)."""
    if len(f0) < 2:
        return 0.0

    differences = np.diff(f0)
    jitter = np.mean(np.abs(differences))
    return float(jitter)

def calculate_shimmer(y, sr):
    """Calculates shimmer (amplitude variability)."""
    rms = librosa.feature.rms(y=y)[0]
    if len(rms) < 2:
        return 0.0

    differences = np.diff(rms)
    shimmer = np.mean(np.abs(differences))
    return float(shimmer)

def estimate_formants(y, sr, n_formants=3):
    """Estimates formant frequencies using linear predictive coding (LPC)."""
    # Add a small amount of white noise to the signal
    noise = np.random.normal(0, 0.001, y.shape[0])
    y = y + noise

    # Estimate the order of the LPC model
    order = int(sr * 0.005)
    if order > y.shape[0]:
        return []

    # Use LPC to estimate the formant frequencies
    lpc = librosa.lpc(y, order=order)

    # Get the roots of the LPC polynomial
    roots = np.roots(lpc)
    # Filter out roots with infinite or NaN components
    valid_roots = roots[~np.isnan(roots.real) & ~np.isnan(roots.imag) & ~np.isinf(roots.real) & ~np.isinf(roots.imag)]
    valid_roots = valid_roots[np.imag(valid_roots) >= 0]

    # Calculate angles and frequencies
    angles = np.arctan2(np.imag(valid_roots), np.real(valid_roots))
    angles = np.nan_to_num(angles)
    formants = sorted((angles * (sr / (2 * np.pi))), reverse=True)

    # Convert frequencies to Hz
    formants_hz = [f for f in formants if 50 < f < 5000]

    # Return the first n_formants
    return [{"freq": round(np.nan_to_num(f), 2), "amplitude": 1.0} for f in formants_hz[:n_formants]]

def calculate_clarity_score(jitter, shimmer, spectral_centroid, zcr):
    """Calculates a clarity score based on jitter, shimmer, spectral centroid, and ZCR."""
    # Normalize and weight the features
    jitter_score = 1 - (jitter / 2.0)  # Scale jitter to 0-1, invert (lower jitter = higher score)
    shimmer_score = 1 - (shimmer / 4.0)  # Scale shimmer to 0-1, invert (lower shimmer = higher score)
    centroid_score = spectral_centroid.mean() / 3000.0  # Normalize spectral centroid (example value)
    zcr_score = 1 - (zcr.mean() / 0.5) # Normalize ZCR (example value)

    # Combine the scores with weights
    clarity = (
        0.3 * jitter_score +
        0.3 * shimmer_score +
        0.2 * centroid_score +
        0.2 * zcr_score
    )

    # Scale to 0-100
    clarity_percentage = max(0, min(100, clarity * 100))
    return int(clarity_percentage)

def generate_recommendations(fundamental_freq, jitter, shimmer, clarity_score):
    """Generates voice improvement recommendations based on analysis results."""
    recommendations = []

    if fundamental_freq < 120:
        recommendations.append("Consider increasing your pitch slightly for better audibility.")
    elif fundamental_freq > 250:
        recommendations.append("Consider lowering your pitch slightly for a more relaxed tone.")

    if jitter > 1.0:
        recommendations.append("Practice smooth vocal transitions to reduce jitter.")

    if shimmer > 3.0:
        recommendations.append("Focus on maintaining consistent volume throughout your speech.")

    if clarity_score < 60:
        recommendations.append("Work on articulation and pronunciation for improved clarity.")

    return recommendations

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python audio-analysis.py <audio_file_path>"}))
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(json.dumps({"error": "Audio file not found"}))
        sys.exit(1)

    result = analyze_audio_file(file_path)
    print(json.dumps(result))
