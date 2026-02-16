import xgboost as xgb
import pandas as pd
import numpy as np
import datetime
import os

class PowerBytePredictor:
    def __init__(self, model_path="powerbyte_xgboost.json"):
        self.model = None
        self.model_path = model_path
        self.load_model()

    def load_model(self):
        """Loads the XGBoost model from the file."""
        try:
            if not os.path.exists(self.model_path):
                print(f"Error: Model file not found at {self.model_path}")
                return

            self.model = xgb.XGBRegressor()
            self.model.load_model(self.model_path)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None

    def _get_mock_historical_features(self):
        """
        Mocks fetching historical data for lag features.
        In a real scenario, this would query a database.
        """
        # Generating plausible random values based on typical sensor ranges
        return {
            "lag_1h": np.random.uniform(0.5, 2.5),
            "lag_24h": np.random.uniform(0.5, 2.5),
            "lag_7d": np.random.uniform(0.5, 2.5),
            "rolling_mean_4h": np.random.uniform(0.5, 2.5)
        }

    def preprocess_and_predict(self, live_data):
        """
        Preprocesses live data and returns a prediction.
        
        Args:
            live_data (dict): Dictionary containing 'voltage', 'intensity', 'reactive_power'.
            
        Returns:
            dict: { "predicted_power": float, "anomaly_score": float, "status": str }
        """
        if not self.model:
            return {"error": "Model not loaded"}

        try:
            # 1. Extract Live Features
            global_intensity = live_data.get('intensity', 0.0)
            voltage = live_data.get('voltage', 0.0)
            global_reactive_power = live_data.get('reactive_power', 0.0)
            
            # 2. Calculate Time Features
            now = datetime.datetime.now()
            hour = now.hour
            dayofweek = now.weekday()  # 0=Monday, 6=Sunday
            month = now.month
            
            # 3. Get (Mock) Historical Features
            historical_features = self._get_mock_historical_features()
            
            # 4. Construct DataFrame with EXACT columns expected by the model
            input_data = {
                'Global_intensity': [global_intensity],
                'Voltage': [voltage],
                'Global_reactive_power': [global_reactive_power],
                'hour': [hour],
                'dayofweek': [dayofweek],
                'month': [month],
                'lag_1h': [historical_features['lag_1h']],
                'lag_24h': [historical_features['lag_24h']],
                'lag_7d': [historical_features['lag_7d']],
                'rolling_mean_4h': [historical_features['rolling_mean_4h']]
            }
            
            df = pd.DataFrame(input_data)
            
            # 5. Predict
            prediction = self.model.predict(df)[0]
            
            # 6. Basic Anomaly Logic (Threshold-based for demo)
            # If prediction is significantly higher than input intensity (simplified logic)
            # You might want a more sophisticated anomaly detection here.
            anomaly_score = abs(prediction - global_intensity) / (global_intensity + 0.1)
            status = "Normal"
            if anomaly_score > 0.5: # Arbitrary threshold for demo
                status = "Warning"
            if anomaly_score > 1.0:
                status = "Critical"

            return {
                "predicted_power": float(prediction),
                "anomaly_score": float(anomaly_score),
                "status": status,
                "input_features": input_data # useful for debugging
            }

        except Exception as e:
            print(f"Error during prediction: {e}")
            return {"error": str(e)}

# Singleton instance for easy import
predictor = PowerBytePredictor()
