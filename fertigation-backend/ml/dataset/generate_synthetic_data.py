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
    
    # --- The underlying Biological Logic ---
    # We assign a point system based on how these factors usually drive fertilizer demand
    score = 0
    
    # 1. Growth Stage impact
    if stage in ['Vegetative', 'Fruiting']:
        # High nutrient demand stages
        score += 3
    elif stage == 'Flowering':
        score += 2
    else: # Germination
        # Seeds have their own energy initially, low fertilizer needed
        score += 0
        
    # 2. Moisture impact
    if 40 <= moisture <= 70:
        # Good moisture enables nutrient transport
        score += 1
    elif moisture < 30:
        # Too dry, applying heavy fertilizer might burn roots
        score -= 1
        
    # 3. Light impact (more light = more photosynthesis = more nutrient demand)
    if light == 'High':
        score += 2
    elif light == 'Medium':
        score += 1
        
    # 4. Temperature impact
    if 20 <= temp <= 32:
        # Optimal metabolism
        score += 1
        
    # --- Mapping points to Fertilizer Needs ---
    if score <= 2:
        fert_need = 'Low'
    elif 3 <= score <= 5:
        fert_need = 'Medium'
    else:
        fert_need = 'High'
        
    # --- Introduce 10% random noise ---
    # This prevents the model from getting 100% accuracy and makes it realistic 
    # (as if sensors failed or human error occurred)
    if random.random() < 0.10:
        fert_need = random.choice(['Low', 'Medium', 'High'])
        
    data.append([stage, moisture, temp, humidity, light, fert_need])

# Create DataFrame and save
df = pd.DataFrame(data, columns=['growth_stage', 'Soil_Moisture', 'Temperature', 'Humidity', 'Light', 'Fertilizer_Need'])
df.to_csv("logical_fertigation_dataset.csv", index=False)
print(f"Successfully generated {num_samples} rows of logical data!")
print(df['Fertilizer_Need'].value_counts())