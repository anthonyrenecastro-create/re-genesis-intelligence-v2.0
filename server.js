import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Proxy endpoint for all AI engines
app.post('/api/proxy/:engine', async (req, res) => {
    const { engine } = req.params;
    const { endpoint, body, apiKey } = req.body;

    console.log(`[Proxy] ${engine} request to ${endpoint}`);

    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[Proxy] ${engine} error:`, response.status, data);
            return res.status(response.status).json({
                error: true,
                status: response.status,
                message: data.error?.message || data.detail || JSON.stringify(data),
                data
            });
        }

        console.log(`[Proxy] ${engine} success`);
        res.json(data);
    } catch (error) {
        console.error(`[Proxy] ${engine} fetch error:`, error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            details: error.toString()
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Re-Genesis Intelligence Proxy Server running on http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for all origins`);
    console.log(`📡 Ready to proxy AI engine requests`);
});
