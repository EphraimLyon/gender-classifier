const express = require('express');
const axios = require('axios');
const cors = require('cors');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// Enable CORS with wildcard
app.use(cors({
  origin: '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));
 
// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Gender Classifier API is live 🚀, enjoy!!!' });
});
 
app.get('/api/classify', async (req, res) => {
  const name = req.query.name;
 
  // FIX 1: Properly catch missing OR empty name param
  if (name === undefined || name === null) {
    return res.status(400).json({
      status: 'error',                          // FIX 2: was `status: error` (missing quotes — crashed the server)
      message: 'Name query parameter is required'
    });
  }
 
  // FIX 3: Trim BEFORE validation, then check for empty string
  const trimmedName = name.trim();
 
  if (trimmedName === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Name query parameter is required'
    });
  }
 
  try {
    const response = await axios.get('https://api.genderize.io', {
      params: { name: trimmedName },
      timeout: 5000
    });
 
    const apiData = response.data;
 
    // Edge case: No prediction available
    if (apiData.gender === null || apiData.count === 0) {
      return res.status(200).json({
        status: 'error',
        message: 'No prediction available for the provided name'
      });
    }
 
    const sample_size = apiData.count;
    const is_confident = apiData.probability >= 0.7 && sample_size >= 100;
    const processed_at = new Date().toISOString();
 
    // FIX 4: Do NOT lowercase the name — return it as the API returned it (matches test expectations)
    return res.status(200).json({
      status: 'success',
      data: {
        name: apiData.name,          // Use name from genderize response (preserves original casing)
        gender: apiData.gender,
        probability: apiData.probability,
        sample_size: sample_size,
        is_confident: is_confident,
        processed_at: processed_at
      }
    });
 
  } catch (error) {
    console.error('Error calling Genderize:', error.message);
 
    return res.status(502).json({
      status: 'error',
      message: 'Failed to fetch prediction from external service'
    });
  }
});
 
// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Test endpoint: http://localhost:${PORT}/api/classify?name=john`);
});