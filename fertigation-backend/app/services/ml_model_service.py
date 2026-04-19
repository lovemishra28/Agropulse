import joblib
import numpy as np
import pandas as pd

# Load trained model
model = joblib.load("ml/models/fertigation_model.pkl")
scaler = joblib.load("ml/models/scaler.pkl")
model_columns = joblib.load("ml/models/model_columns.pkl")


def predict_fertilizer(sensor_data, growth_stage):

    # Process light_intensity float to categorical string
    light_val = sensor_data.get("light_intensity", 0)
    if isinstance(light_val, (int, float)):
        if light_val < 150:
            light_str = "Low"
        elif light_val < 300:
            light_str = "Medium"
        else:
            light_str = "High"
    else:
        light_str = light_val

    # Prepare initial raw dataframe
    df = pd.DataFrame([{
        "soil_moisture": sensor_data.get("soil_moisture", 50),
        "temperature": sensor_data.get("temperature", 25),
        "humidity": sensor_data.get("humidity", 50),
        "nitrogen": sensor_data.get("nitrogen", 20),
        "phosphorus": sensor_data.get("phosphorus", 15),
        "potassium": sensor_data.get("potassium", 20),
        "growth_stage": growth_stage,
        "light_intensity": light_str, 
    }])

    # Add engineered features
    df['temp_humidity_interaction'] = df['temperature'] * df['humidity']
    df['moisture_temp_ratio'] = df['soil_moisture'] / (df['temperature'] + 1)
    df['total_npk'] = df['nitrogen'] + df['phosphorus'] + df['potassium']
    
    # Scale num columns
    num_cols = ['soil_moisture', 'temperature', 'humidity', 'nitrogen', 'phosphorus', 'potassium', 'temp_humidity_interaction', 'moisture_temp_ratio', 'total_npk']
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
    "prediction": label_map[int(prediction)],
    "confidence": round(float(confidence) * 100, 2)
    }