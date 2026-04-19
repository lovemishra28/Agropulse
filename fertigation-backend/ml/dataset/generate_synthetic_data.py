import pandas as pd
import numpy as np
import random

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

num_samples = 1500

stages = ['Germination', 'Vegetative', 'Flowering', 'Fruiting']
lights = ['Low', 'Medium', 'High']

data = []
for _ in range(num_samples):
    stage = random.choice(stages)
    moisture = random.randint(20, 85)
    temp = random.randint(15, 40)
    humidity = random.randint(30, 90)
    light = random.choice(lights)
    nitrogen = random.randint(5, 50)
    phosphorus = random.randint(5, 30)
    potassium = random.randint(5, 35)
    
    # --- The underlying Biological Logic ---
    # We assign a point system based on how these factors usually drive fertilizer demand
    score = 0
    
    # 1. Growth Stage impact
    if stage in ['Vegetative', 'Fruiting']:
        score += 3
    elif stage == 'Flowering':
        score += 2
    else: 
        score += 0
        
    # 2. Moisture impact
    if 40 <= moisture <= 70:
        score += 1
    elif moisture < 30:
        score -= 1
        
    # 3. Light impact
    if light == 'High':
        score += 2
    elif light == 'Medium':
        score += 1
        
    # 4. Temperature impact
    if 20 <= temp <= 32:
        score += 1

    # 5. Soil NPK Impact (Current NPK in soil vs What it needs)
    if nitrogen < 15 or phosphorus < 10 or potassium < 10:
        score += 4
    elif nitrogen > 35 and phosphorus > 20 and potassium > 25:
        score -= 4
        
    # --- Mapping points to Fertilizer Needs ---
    if score <= 2:
        fert_need = 'Low'
    elif 3 <= score <= 5:
        fert_need = 'Medium'
    else:
        fert_need = 'High'
        
    # --- Introduce 10% random noise ---
    if random.random() < 0.10:
        fert_need = random.choice(['Low', 'Medium', 'High'])
        
    data.append([stage, moisture, temp, humidity, light, nitrogen, phosphorus, potassium, fert_need])

# Create DataFrame and save
df = pd.DataFrame(data, columns=['growth_stage', 'Soil_Moisture', 'Temperature', 'Humidity', 'Light', 'Nitrogen', 'Phosphorus', 'Potassium', 'Fertilizer_Need'])
df.to_csv("logical_fertigation_dataset.csv", index=False)
print(f"Successfully generated {num_samples} rows of logical data!")
print(df['Fertilizer_Need'].value_counts())