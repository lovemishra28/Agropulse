def generate_alerts(sensor_data):

    alerts = []

    if sensor_data["soil_moisture"] < 30:
        alerts.append("⚠ Soil moisture critically low")

    if sensor_data["temperature"] > 35:
        alerts.append("⚠ Temperature too high")

    if sensor_data["humidity"] < 30:
        alerts.append("⚠ Low humidity detected")

    return alerts