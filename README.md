# Gender Name Classifier API

Stage 0 Backend Task - API Integration & Data Processing

##Endpoint
**GET** `/api/classify?name={name}`

## Example

GET /api/classify?name=john
```
Response:

{
    "status":"success",
    "data": {
        "name": "john",
        "gender":"male",
        "probability":0.99,
        "sample_size":1234,
        "is_confident": true,
        "processed_at": "2026-04-10T12:17:00Z"
    }

}
```