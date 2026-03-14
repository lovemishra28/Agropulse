import joblib
import numpy as np
import pandas as pd

# Load trained model
model = joblib.load("ml/models/fertigation_model.pkl")
scaler = joblib.load("ml/models/scaler.pkl")
model_columns = joblib.load("ml/models/model_columns.pkl")


def predict_fertilizer(sensor_data, growth_stage):

    # Prepare initial raw dataframe
    df = pd.DataFrame([{
        "soil_moisture": sensor_data["soil_moisture"],
        "temperature": sensor_data["temperature"],
        "humidity": sensor_data["humidity"],
        "growth_stage": growth_stage,
        "light_intensity": sensor_data["light_intensity"], # Ensure light is expected string in actual inputs from routes
    }])

    # Add engineered features
    df['temp_humidity_interaction'] = df['temperature'] * df['humidity']
    df['moisture_temp_ratio'] = df['soil_moisture'] / (df['temperature'] + 1)
    
    # Scale num columns
    num_cols = ['soil_moisture', 'temperature', 'humidity', 'temp_humidity_interaction', 'moisture_temp_ratio']
    df[num_cols] = scaler.transform(df[num_cols])
    
    # One hot encoding
    df = pd.get_dummies(df, columns=['growth_stage', 'light_intensity'])
    
    # Realign columns with training cols
    df = df.reindex(columns=model_columns, fill_value=0)

    prediction = model.predict(df)[0]
    probabilities = model.predict_proba(df)[0]

    confidence = max(probabilities)

    label_map = {
        0: "LOW",
        1: "MEDIUM",
        2: "HIGH"
    }

    return {
    "prediction": label_map[prediction],
    "confidence": round(confidence * 100, 2)
    }