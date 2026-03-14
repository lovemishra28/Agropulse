import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler

# Load dataset
data = pd.read_csv("../dataset/logical_fertigation_dataset.csv")

print("Dataset shape:", data.shape)

# Normalize column names
data.columns = data.columns.str.lower()

# Rename columns
data = data.rename(columns={
    "soil_moisture": "soil_moisture",
    "light": "light_intensity",
    "fertilizer_need": "fertilizer_need"
})

# Feature Engineering: Combine features to help the model find patterns
data['temp_humidity_interaction'] = data['temperature'] * data['humidity']
data['moisture_temp_ratio'] = data['soil_moisture'] / (data['temperature'] + 1) # +1 to avoid div by zero

# Scale Numerical Features (Important for certain models and interaction features)
scaler = StandardScaler()
num_cols = ['soil_moisture', 'temperature', 'humidity', 'temp_humidity_interaction', 'moisture_temp_ratio']
data[num_cols] = scaler.fit_transform(data[num_cols])

# One-hot encode categorical features
data = pd.get_dummies(data, columns=["growth_stage", "light_intensity"])

# Encode target variable
data["fertilizer_need"] = data["fertilizer_need"].map({
    "Low": 0,
    "Medium": 1,
    "High": 2
})

print("\nColumns after encoding:")
print(data.columns)

# Features and target
X = data.drop("fertilizer_need", axis=1)
y = data["fertilizer_need"]

# Train/test split with stratification
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Hyperparameter tuning using GridSearchCV with GradientBoosting
param_grid = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.01, 0.1, 0.2],
    'max_depth': [3, 5, 7],
    'min_samples_split': [2, 5]
}

gb = GradientBoostingClassifier(random_state=42)

grid_search = GridSearchCV(
    estimator=gb,
    param_grid=param_grid,
    cv=5,
    n_jobs=-1,
    verbose=1,
    scoring='accuracy'
)

print("\nStarting Grid Search for best hyperparameters...")
grid_search.fit(X_train, y_train)

# Best model
model = grid_search.best_estimator_

print(f"\nBest parameters found: {grid_search.best_params_}")

# Predictions
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nModel Accuracy:", accuracy)
print("\nClassification Report:")
print(classification_report(y_test, predictions))

# Save model
joblib.dump(model, "../models/fertigation_model.pkl")
joblib.dump(scaler, "../models/scaler.pkl")
joblib.dump(list(X.columns), "../models/model_columns.pkl")

print("\nModel saved successfully.")
