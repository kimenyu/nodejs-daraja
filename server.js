import express from 'express'
const router = express.Router();
import axios from 'axios';
const port = process.env.PORT || 3000

const app = express();
app.use(express.json());
app.use(router);


const consumerSecret = process.env.SAFARICOM_CONSUMER_SECRET;
const consumerKey = process.env.SAFARICOM_CONSUMER_KEY;



// Function to generate a timestamp (format: YYYYMMDDHHmmss)
const generateTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Function to generate an access token
const generateAccessToken = async (consumerKey, consumerSecret) => {
    try {
      const response = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate', {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      });
      return response.data.access_token;
    } catch (error) {
      throw error;
    }
  };

// Endpoint to initiate a Lipa Na M-Pesa Online Payment
router.post('/lipa', async (req, res) => {
    try {
      // Generate an access token for authentication
      const accessToken = await generateAccessToken(consumerKey, consumerSecret);
  
      // Create the payment request
      const paymentRequest = {
        BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
        Password: process.env.PASSWORD, // Generate this using Daraja documentation
        Timestamp: generateTimestamp(), // Format: YYYYMMDDHHmmss
        TransactionType: 'CustomerPayBillOnline',
        Amount: req.body.amount,
        PartyA: req.body.phone, // Customer's phone number
        PartyB: process.env.BUSINESS_SHORT_CODE,
        PhoneNumber: req.body.phone,
        CallBackURL: 'YOUR_CALLBACK_URL',
        AccountReference: 'test',
        TransactionDesc: 'Payment for Apartment',
      };
  
      // Make the payment request
      const paymentResponse = await initiatePayment(accessToken, paymentRequest);
  
      // Handle the payment response as needed
      console.log(paymentResponse);
  
      res.status(200).json({ message: 'Payment initiated successfully', data: paymentResponse });
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(500).json({ message: 'Payment initiation failed' });
    }
  });
  
  // Function to initiate the Lipa Na M-Pesa payment
  const initiatePayment = async (accessToken, paymentRequest) => {
    try {
      const response = await axios.post(
        'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        paymentRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
    };

    router.post('/payment-callback', (req, res) => {
        // Handle payment callback logic here
        // Verify the payment and update your application's records
        // Respond with a success message
        res.status(200).send('Payment received and processed.');
      });

app.get('/home', (req, res) => {
    res.send("Hello. This is mpesa darja testing")
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  } );