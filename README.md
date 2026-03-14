# AgroPulse - Smart Fertigation Dashboard

## Overview
AgroPulse is a comprehensive, full-stack application designed to monitor and manage agricultural fertigation (the integration of irrigation and fertilization). By leveraging IoT sensor data, machine learning-driven recommendations, and real-time control mechanisms, AgroPulse helps optimize crop growth, reduce resource waste, and maximize crop yields.

## Features
- **Real-Time Sensor Monitoring:** Track crucial environmental and soil metrics including Temperature, Humidity, Soil Moisture, and NPK levels.
- **AI/ML-Driven Recommendations:** Get dynamic fertigation recommendations based on historical data and predictive modeling.
- **Crop Growth Stage Tracking:** Automatically track and adjust settings based on the current growth stage of your crops.
- **Interactive Dashboard & Charts:** Visualize real-time and historical sensor data through an intuitive React frontend.
- **Alert System:** Receive immediate alerts for sub-optimal environmental conditions to prevent crop damage.
- **Data Export & Analytics:** Export historical data for external analysis and reporting.
- **System Simulator:** Generate and test scenarios using the built-in simulator without needing physical sensors.

## Project Structure

The repository is separated into two main components: a Python backend and a React frontend.

```
AgroPulse WebDashboard/
├── fertigation-backend/    # FastAPI Python Backend
│   ├── app/                # Main application code (Models, Routes, Services)
│   ├── ml/                 # Machine learning models, training scripts, and datasets
│   ├── test_gaps.py        # Testing scripts
│   └── requirements.txt    # Python dependencies
└── fertigation-frontend/   # React + Vite Frontend
    ├── public/             # Static assets
    ├── src/                # React components, pages, and services
    ├── package.json        # Node.js dependencies
    └── vite.config.js      # Vite configuration
```

## Tech Stack

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** CSS / Internal component styles
- **Charts/Visualization:** Custom implemented charts (e.g., Chart.js / Recharts integration under the hood)

### Backend
- **Framework:** FastAPI / Python
- **Database:** SQLite/PostgreSQL (configured in `database.py`)
- **Machine Learning:** Scikit-learn, Pandas (Handling datasets and training in `ml/`)

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.8+ recommended)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd fertigation-backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will typically be available at `http://127.0.0.1:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd fertigation-frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The web dashboard will be accessible at the local URL provided by Vite (e.g., `http://localhost:5173`).

## Machine Learning Pipeline
The backend includes a dedicated `ml/` directory for training and validating the recommendation engine models. It includes scripts to generate synthetic dataset samples (`generate_synthetic_data.py`), evaluate logs (`validate_dataset.py`), and train finalized models (`train_model.py`) to improve recommendation accuracy.

## License
This project is licensed under the MIT License.