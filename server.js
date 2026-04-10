const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS with wildcard (required by grading script)
app.use(cors(
    {
        origin: '*', // Access-Control-Allow-Origin: * allows all origins to access the resources. In production, you should specify the allowed origins for better security.
        methods: ['GET'],
        allowedHeaders: ['Content-Type'] // Specify the allowed headers for CORS requests.
    }
));

// Health check (optional but helpful)
app.get('/', (req, res) => {
  res.json({ message: 'Gender Classifier API is live 🚀, enjoy!!!' });
});

app.get('/api/classify', async (req, res) => {
    const name = req.query.name;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ 
            status: error,
            message: 'Name query parameter is required' });
    }


  // Trim whitespace
  const trimmedName = name.trim();

    if (typeof trimmedName !== 'string') {
    return res.status(422).json({
      status: 'error',
      message: 'name must be a string'
    });
  }

    try {
    // Call Genderize API from the endpoint https://api.genderize.io?name=<name>
    
    const response = await axios.get(`https://api.genderize.io`, {
      params: { name: trimmedName },
      timeout: 3000 // prevent hanging
    });

    const apiData = response.data;

    // Edge case: No prediction (gender null or count 0)
    if (apiData.gender === null || apiData.count === 0) {
      return res.status(200).json({ // or 422? Task says error structure
        status: 'error',
        message: 'No prediction available for the provided name'
      });
    }
       // Processing rules
       // change the count from the API to sample_size in our response, and determine is_confident based on the given criteria.
    const sample_size = apiData.count; // rename count
    const is_confident = (apiData.probability >= 0.7) && (sample_size >= 100); 
    // a boolean value either true or false

    const processed_at = new Date().toISOString(); // UTC ISO 8601

    // Success response
    return res.status(200).json({
      status: 'success',
      data: {
        name: trimmedName.toLowerCase(), // match example (lowercase)
        gender: apiData.gender,
        probability: apiData.probability,
        sample_size: sample_size,
        is_confident: is_confident,
        processed_at: processed_at
      }
    });
}
catch (error) {
    console.error('Error calling Genderize:', error.message);

    // 500 for upstream/server issues
    return res.status(502).json({
      status: 'error',
      message: 'Failed to fetch prediction from external service'
    });
  }

});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(` Test endpoint: http://localhost:${PORT}/api/classify?name=john`);
});