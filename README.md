# GlycoAI

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
