# GlycoAI Backend

Flask API for LSTM-based glucose prediction and insulin recommendation.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Make sure you have these files in the `/backend` folder:**
   - `lstm_model.h5` (your trained model)
   - `scaler.pkl` (your fitted scaler)
   - `P03.csv` (your patient data)

3. **Run the Flask server:**
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### Scenario 1: Post-Meal Prediction
**GET** `/api/scenario1`

Predicts glucose levels for the next 3 hours based on recent history (using P03 dataset).

**Response:**
```json
{
  "success": true,
  "current_bg": 150.5,
  "recent_insulin": 5.2,
  "recent_carbs": 45.0,
  "predictions": {
    "times": ["2024-01-...", ...],
    "values": [155.2, 158.3, ...],
    "one_hour": 160.5,
    "two_hours": 165.2,
    "three_hours": 155.8
  },
  "alert": {
    "type": "success",
    "message": "Glucose levels predicted to stay in target range",
    "details": "Safe for sleep or physical activity"
  }
}
```

### Scenario 2: Pre-Meal Insulin Calculation
**POST** `/api/scenario2`

Calculates insulin recommendation for a planned meal using pure demo mode.
Finds a matching BG window in P03 dataset closest to the user's current BG.

**Request Body:**
```json
{
  "current_bg": 120,
  "planned_carbs": 60
}
```

**Response:**
```json
{
  "success": true,
  "current_bg": 120.5,
  "current_iob": 2.3,
  "correction_dose": 0.5,
  "carb_coverage_dose": 6.0,
  "iob_adjustment": 1.15,
  "recommended_insulin": 5.4,
  "planned_carbs": 60,
  "predictions": {
    "times": ["2024-01-...", ...],
    "values": [125.2, 135.3, ...],
    "one_hour": 140.5,
    "two_hours": 135.2,
    "three_hours": 125.8,
    "peak": 145.3
  },
  "alert": {
    "type": "success",
    "message": "Predicted glucose response within target range",
    "details": null
  }
}
```

## Integration with Frontend

The frontend (Next.js) calls these endpoints:
- **AI Insights page** automatically calls Scenario 1 on page load
- **Dose Calculator page** calls Scenario 2 when user inputs BG and carbs, displays:
  - Recommended insulin dose with breakdown
  - 3-hour glucose predictions
  - Peak glucose prediction
  - Safety alerts

## Pure Demo Mode

**Scenario 2** uses pure demo mode:
- User provides their current BG and planned carbs
- Backend searches P03 dataset for a time window where BG matches user's input
- Uses that matched window's complete history (insulin, carbs, HR, steps) for prediction
- This allows realistic ML predictions without requiring user's historical data

## Notes

- All predictions use the P03 dataset for demo purposes
- The model uses 3 hours (36 time steps) of historical data
- Time intervals are 5 minutes each
- Target glucose range: 70-180 mg/dL
- Scenario 2 finds the closest matching BG in P03 (demo mode)
