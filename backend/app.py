from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
from tensorflow.keras.models import load_model
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Load the model and scaler
model = load_model('lstm_model.h5', compile=False)
model.compile(optimizer='adam', loss='mse')
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# Load P03 dataset
df_p03 = pd.read_csv('P03.csv')
df_p03['timestamp'] = pd.to_datetime(df_p03['timestamp'], utc=True)
df_p03 = df_p03.sort_values('timestamp').reset_index(drop=True)

# Convert mmol/L to mg/dL if needed
if df_p03['bg'].median() < 30:
    df_p03['bg'] = df_p03['bg'] * 18.0

# Fill NaN values
df_p03['insulin'] = df_p03['insulin'].fillna(0)
df_p03['carbs'] = df_p03['carbs'].fillna(0)
df_p03['hr'] = df_p03['hr'].ffill().fillna(65)
df_p03['steps'] = df_p03['steps'].fillna(0)

LOOK_BACK = 36  # 3 hours history

# Metabolic Model Class
class MetabolicModel:
    def __init__(self, insulin_brand="Humalog"):
        self.brands = {
            "Fiasp": 45,
            "Humalog": 60,
            "Novolog": 60,
            "Actrapid": 120
        }
        self.tau = self.brands.get(insulin_brand, 60)

    def calculate_iob(self, insulin_series, time_interval=5):
        duration_steps = int((3.5 * self.tau) / time_interval)
        t = np.linspace(0, 3.5 * self.tau, duration_steps)
        kernel = (t / self.tau) * np.exp(-t / self.tau)
        
        if np.sum(kernel) > 0:
            kernel = kernel / np.sum(kernel)
        
        insulin_filled = insulin_series.fillna(0).values
        iob = np.convolve(insulin_filled, kernel, mode='full')
        
        return iob[:len(insulin_series)]


# SCENARIO 1: Post-Meal Prediction
def predict_post_meal_glucose(current_bg_readings, insulin_doses, carb_intakes,
                               hr_data, steps_data, timestamps,
                               hours_forward=3,
                               use_dampening=True,
                               use_smoothing=True,
                               constrain_rate=True):
    metabolic_model = MetabolicModel(insulin_brand="Humalog")
    insulin_series = pd.Series(insulin_doses)
    iob_values = metabolic_model.calculate_iob(insulin_series)

    day_seconds = 24 * 60 * 60
    seconds = [pd.Timestamp(t).timestamp() for t in timestamps]
    day_sin = [np.sin(s * (2 * np.pi / day_seconds)) for s in seconds]
    day_cos = [np.cos(s * (2 * np.pi / day_seconds)) for s in seconds]

    features_array = np.column_stack([
        current_bg_readings,
        iob_values,
        carb_intakes,
        hr_data,
        steps_data,
        day_sin,
        day_cos
    ])

    features_scaled = scaler.transform(features_array)

    if len(features_scaled) < LOOK_BACK:
        raise ValueError(f"Need at least {LOOK_BACK} data points ({LOOK_BACK * 5} minutes)")

    input_window = features_scaled[-LOOK_BACK:]
    lstm_input = input_window.reshape(1, LOOK_BACK, -1)

    predictions = []
    raw_predictions = []
    num_steps = (hours_forward * 60) // 5

    last_timestamp = pd.Timestamp(timestamps[-1])
    last_real_bg = current_bg_readings[-1]

    current_window = input_window.copy()

    for step in range(num_steps):
        pred_scaled = model.predict(current_window.reshape(1, LOOK_BACK, -1), verbose=0).item()

        dummy_pred = np.zeros((1, scaler.n_features_in_))
        dummy_pred[0, 0] = pred_scaled
        pred_bg = scaler.inverse_transform(dummy_pred)[0, 0]

        if use_dampening and step < 6:
            trust_factor = 0.3 + (step / 6) * 0.7
            pred_bg = last_real_bg * (1 - trust_factor) + pred_bg * trust_factor

        if constrain_rate and len(raw_predictions) > 0:
            last_pred_bg = raw_predictions[-1]
            max_change = 3.0
            change = pred_bg - last_pred_bg
            if abs(change) > max_change:
                pred_bg = last_pred_bg + max_change * np.sign(change)

        raw_predictions.append(pred_bg)

        pred_timestamp = last_timestamp + pd.Timedelta(minutes=(step + 1) * 5)
        predictions.append((pred_timestamp, pred_bg))

        new_seconds = pd.Timestamp(pred_timestamp).timestamp()
        new_day_sin = np.sin(new_seconds * (2 * np.pi / day_seconds))
        new_day_cos = np.cos(new_seconds * (2 * np.pi / day_seconds))

        last_iob = current_window[-1, 1] * 0.95

        new_features = np.array([[pred_scaled, last_iob, 0, hr_data[-1], 0, new_day_sin, new_day_cos]])

        current_window = np.vstack([current_window[1:], new_features])

    if use_smoothing:
        smoothed_predictions = []
        window_size = 5
        for i in range(len(predictions)):
            start_idx = max(0, i - window_size // 2)
            end_idx = min(len(raw_predictions), i + window_size // 2 + 1)
            window_values = raw_predictions[start_idx:end_idx]
            smoothed_bg = np.mean(window_values)
            smoothed_predictions.append((predictions[i][0], smoothed_bg))
        predictions = smoothed_predictions

    return predictions


# SCENARIO 2: Pre-Meal Insulin Calculation
def calculate_insulin_recommendation(current_bg_readings, recent_insulin, recent_carbs,
                                     hr_data, steps_data, timestamps,
                                     planned_carbs, target_bg=120,
                                     insulin_sensitivity=50, carb_ratio=10):
    current_bg = current_bg_readings[-1]

    metabolic_model = MetabolicModel(insulin_brand="Humalog")
    insulin_series = pd.Series(recent_insulin)
    iob_values = metabolic_model.calculate_iob(insulin_series)
    current_iob = iob_values[-1] if len(iob_values) > 0 else 0

    correction_dose = max(0, (current_bg - target_bg) / insulin_sensitivity)
    carb_coverage_dose = planned_carbs / carb_ratio
    iob_adjustment = current_iob * 0.5
    recommended_insulin = max(0, correction_dose + carb_coverage_dose - iob_adjustment)

    modified_insulin = recent_insulin.copy()
    modified_carbs = recent_carbs.copy()
    modified_insulin[-1] += recommended_insulin
    modified_carbs[-1] += planned_carbs

    predictions = predict_post_meal_glucose(
        current_bg_readings=current_bg_readings,
        insulin_doses=modified_insulin,
        carb_intakes=modified_carbs,
        hr_data=hr_data,
        steps_data=steps_data,
        timestamps=timestamps,
        hours_forward=3
    )

    return {
        'current_bg': round(current_bg, 1),
        'current_iob': round(current_iob, 2),
        'correction_dose': round(correction_dose, 1),
        'carb_coverage_dose': round(carb_coverage_dose, 1),
        'iob_adjustment': round(iob_adjustment, 2),
        'recommended_insulin': round(recommended_insulin, 1),
        'predictions': predictions
    }


@app.route('/api/scenario1', methods=['POST'])
def scenario1():
    """
    SCENARIO 1: Post-meal prediction using P03 dataset
    Finds matching entry based on current BG, recent insulin, and recent carbs
    """
    try:
        data = request.get_json()
        target_bg = data.get('current_bg', 120)
        target_insulin = data.get('recent_insulin', 0)
        target_carbs = data.get('recent_carbs', 0)
        time_of_day = data.get('time_of_day', '12:00')
        
        # Manual rule-based checks
        hour = int(time_of_day.split(':')[0])
        is_nighttime = hour >= 22 or hour <= 6  # 10 PM to 6 AM
        
        # Rule 1: Nighttime hypoglycemia risk
        if is_nighttime and 90 <= target_bg <= 120 and target_insulin > 0 and target_carbs < 20:
            return jsonify({
                'success': True,
                'current_bg': target_bg,
                'recent_insulin': target_insulin,
                'recent_carbs': target_carbs,
                'predictions': {
                    'times': [],
                    'values': [],
                    'one_hour': 75,
                    'two_hours': 68,
                    'three_hours': 65
                },
                'alert': {
                    'type': 'warning',
                    'message': 'Predicted hypoglycemia (low blood sugar)!',
                    'details': f'Nighttime risk: BG {target_bg} mg/dL with {target_insulin:.1f}U insulin and only {target_carbs}g carbs. Predicted to drop to ~65 mg/dL.'
                }
            })
        
        # Rule 2: High carbs with insufficient insulin
        if target_carbs > 60 and target_insulin < 1:
            estimated_spike = target_bg + (target_carbs * 3)  # Rough estimate: 3 mg/dL per gram of carb
            one_hour = min(estimated_spike, 350)
            two_hours = min(estimated_spike * 0.95, 340)
            three_hours = min(estimated_spike * 0.9, 330)
            return jsonify({
                'success': True,
                'current_bg': target_bg,
                'recent_insulin': target_insulin,
                'recent_carbs': target_carbs,
                'predictions': {
                    'times': [],
                    'values': [],
                    'one_hour': one_hour,
                    'two_hours': two_hours,
                    'three_hours': three_hours
                },
                'alert': {
                    'type': 'warning',
                    'message': 'Predicted hyperglycemia (high blood sugar)!',
                    'details': f'High carb load ({target_carbs}g) with minimal insulin coverage. BG expected to spike to ~{int(one_hour)} mg/dL.'
                }
            })
        
        # Find best matching window in P03 dataset
        best_match_idx = None
        min_score = float('inf')
        
        # Search through valid windows (need LOOK_BACK history + some future data)
        for i in range(LOOK_BACK, len(df_p03) - LOOK_BACK - 36):
            window = df_p03.iloc[i - LOOK_BACK:i]
            
            # Calculate match score based on current BG, recent insulin, and recent carbs
            current_bg = window.iloc[-1]['bg']
            recent_insulin_sum = window['insulin'].sum()
            recent_carbs_sum = window['carbs'].sum()
            
            # Weighted scoring (BG is most important)
            bg_diff = abs(current_bg - target_bg)
            insulin_diff = abs(recent_insulin_sum - target_insulin)
            carbs_diff = abs(recent_carbs_sum - target_carbs)
            
            score = (bg_diff * 3) + insulin_diff + (carbs_diff * 0.5)
            
            if score < min_score:
                min_score = score
                best_match_idx = i
        
        if best_match_idx is None:
            raise ValueError("Could not find matching window in dataset")
        
        # Log the selected index for debugging
        print(f"\n=== SCENARIO 1 ===")
        print(f"Target: BG={target_bg}, Insulin={target_insulin}, Carbs={target_carbs}")
        print(f"Selected index: {best_match_idx} (using rows {best_match_idx - LOOK_BACK} to {best_match_idx})")
        print(f"Match score: {min_score:.2f}")
        print(f"Actual values at index: BG={df_p03.iloc[best_match_idx]['bg']:.1f}, "
              f"Insulin sum={df_p03.iloc[best_match_idx - LOOK_BACK:best_match_idx]['insulin'].sum():.1f}, "
              f"Carbs sum={df_p03.iloc[best_match_idx - LOOK_BACK:best_match_idx]['carbs'].sum():.1f}")
        print(f"==================\n")
        
        # Use the matched window
        start_idx = best_match_idx - LOOK_BACK
        end_idx = best_match_idx
        
        recent_history = df_p03.iloc[start_idx:end_idx]

        user_bg = recent_history['bg'].tolist()
        user_insulin = recent_history['insulin'].tolist()
        user_carbs = recent_history['carbs'].tolist()
        user_hr = recent_history['hr'].tolist()
        user_steps = recent_history['steps'].tolist()
        user_timestamps = recent_history['timestamp'].tolist()

        predictions = predict_post_meal_glucose(
            current_bg_readings=user_bg,
            insulin_doses=user_insulin,
            carb_intakes=user_carbs,
            hr_data=user_hr,
            steps_data=user_steps,
            timestamps=user_timestamps,
            hours_forward=3
        )

        # Format predictions for response
        pred_values = [p[1] for p in predictions]
        pred_times = [p[0].isoformat() for p in predictions]

        # Safety analysis
        min_pred = min(pred_values)
        max_pred = max(pred_values)

        if min_pred < 70:
            alert = {
                'type': 'warning',
                'message': 'Predicted hypoglycemia (low blood sugar)!',
                'details': f'Minimum predicted: {min_pred:.1f} mg/dL'
            }
        elif max_pred > 180:
            alert = {
                'type': 'warning',
                'message': 'Predicted hyperglycemia (high blood sugar)!',
                'details': f'Maximum predicted: {max_pred:.1f} mg/dL'
            }
        else:
            alert = {
                'type': 'success',
                'message': 'Glucose levels predicted to stay in target range',
                'details': 'Safe for sleep or physical activity'
            }

        return jsonify({
            'success': True,
            'current_bg': user_bg[-1],
            'recent_insulin': sum(user_insulin),
            'recent_carbs': sum(user_carbs),
            'predictions': {
                'times': pred_times,
                'values': pred_values,
                'one_hour': pred_values[11],
                'two_hours': pred_values[23],
                'three_hours': pred_values[35]
            },
            'alert': alert
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/scenario2', methods=['POST'])
def scenario2():
    """
    SCENARIO 2: Pre-meal insulin calculation using P03 dataset
    Pure demo mode: Finds matching BG window in P03 dataset
    """
    try:
        data = request.get_json()
        planned_carbs = data.get('planned_carbs', 60)
        current_bg = data.get('current_bg', 120)
        
        # Find a window in P03 where the last BG value is closest to user's input
        best_match_idx = None
        min_difference = float('inf')
        
        # Search through P03 dataset for matching BG window
        for i in range(LOOK_BACK, len(df_p03) - LOOK_BACK):
            window_last_bg = df_p03.iloc[i]['bg']
            difference = abs(window_last_bg - current_bg)
            
            if difference < min_difference:
                min_difference = difference
                best_match_idx = i
        
        if best_match_idx is None:
            raise ValueError("Could not find matching BG window in dataset")
        
        print(f"\n=== SCENARIO 2 ===")
        print(f"Target BG: {current_bg}, Planned carbs: {planned_carbs}")
        print(f"Selected index: {best_match_idx}, Matched BG: {df_p03.iloc[best_match_idx]['bg']:.1f}")
        print(f"BG difference: {min_difference:.1f} mg/dL")
        print(f"==================\n")
        
        # Use the matched window
        start_idx = best_match_idx - LOOK_BACK + 1
        end_idx = best_match_idx + 1
        
        recent_history = df_p03.iloc[start_idx:end_idx]

        user_bg = recent_history['bg'].tolist()
        user_insulin = recent_history['insulin'].tolist()
        user_carbs = recent_history['carbs'].tolist()
        user_hr = recent_history['hr'].tolist()
        user_steps = recent_history['steps'].tolist()
        user_timestamps = recent_history['timestamp'].tolist()

        result = calculate_insulin_recommendation(
            current_bg_readings=user_bg,
            recent_insulin=user_insulin,
            recent_carbs=user_carbs,
            hr_data=user_hr,
            steps_data=user_steps,
            timestamps=user_timestamps,
            planned_carbs=planned_carbs,
            target_bg=120,
            insulin_sensitivity=50,
            carb_ratio=10
        )

        # Format predictions
        predictions = result['predictions']
        pred_values = [p[1] for p in predictions]
        pred_times = [p[0].isoformat() for p in predictions]

        # Safety analysis
        peak_bg = max(pred_values)
        min_bg = min(pred_values)

        if peak_bg > 180:
            alert = {
                'type': 'warning',
                'message': 'Peak glucose may exceed target',
                'details': 'Consider increasing insulin by 0.5-1.0 units'
            }
        elif min_bg < 70:
            alert = {
                'type': 'warning',
                'message': 'Risk of hypoglycemia',
                'details': 'Consider reducing insulin by 0.5-1.0 units'
            }
        else:
            alert = {
                'type': 'success',
                'message': 'Predicted glucose response within target range',
                'details': None
            }

        return jsonify({
            'success': True,
            'current_bg': result['current_bg'],
            'current_iob': result['current_iob'],
            'correction_dose': result['correction_dose'],
            'carb_coverage_dose': result['carb_coverage_dose'],
            'iob_adjustment': result['iob_adjustment'],
            'recommended_insulin': result['recommended_insulin'],
            'planned_carbs': planned_carbs,
            'predictions': {
                'times': pred_times,
                'values': pred_values,
                'one_hour': pred_values[11],
                'two_hours': pred_values[23],
                'three_hours': pred_values[35],
                'peak': peak_bg
            },
            'alert': alert
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
