const API_URL = 'http://localhost:8000/api';

/**
 * Sends live sensor data to the backend for power usage prediction.
 * @param {Object} sensorData - { voltage, intensity, reactive_power, device_id }
 * @returns {Promise<Object>} - { predicted_power, anomaly_score, status }
 */
export const predictPowerUsage = async (sensorData) => {
    try {
        console.log("Sending prediction request:", sensorData);
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sensorData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Prediction API Error:", errorData);
            throw new Error(errorData.detail || 'Prediction request failed');
        }

        const data = await response.json();
        console.log("Prediction received:", data);
        return data;
    } catch (error) {
        console.error('Error fetching prediction:', error);
        throw error;
    }
}

export const getSensorData = async () => {
    try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        return await response.json();
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        throw error;
    }
};

export const getModelInfo = async () => {
    try {
        const response = await fetch(`${API_URL}/model-info`);
        if (!response.ok) throw new Error('Failed to fetch model info');
        return await response.json();
    } catch (error) {
        console.error("Error fetching model info:", error);
        throw error;
    }
};
