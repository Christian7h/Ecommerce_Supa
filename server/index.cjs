//src/index.cjs
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
  Options,
  WebpayPlus,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
  Environment,
} = require("transbank-sdk");

dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
}));
app.use(express.json());

// Configura la transacción con el entorno adecuado de integración
const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
);

app.post("/api/create-transaction", async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    // Crear un buyOrder más corto (máximo 26 caracteres)
    const buyOrder = orderId ? orderId.substring(0, 26) : Date.now().toString().substring(0, 26);
    const sessionId = Date.now().toString();
    const returnUrl = "http://localhost:5173/payment-success"; // Actualizada la URL de retorno

    console.log("Creating transaction with:", {
      buyOrder,
      sessionId,
      amount,
      returnUrl,
      orderId
    });    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
    console.log('Transbank response:', response);

    if (response.url && response.token) {
      res.json({ 
        url: response.url, 
        token: response.token,
        buyOrder,
        sessionId
      });
    } else {
      throw new Error('No redirection URL or token received from Webpay');
    }
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Error creating transaction", details: error.message });
  }
});

app.post("/api/confirm-transaction", async (req, res) => {
  try {
    const { token } = req.body;
    console.log("Confirming transaction with token:", token);
    
    if (!token) {
      throw new Error('Token is required');
    }
    
    const response = await tx.commit(token);
    console.log("Transaction confirmation response:", response);
    
    // Agregar información adicional a la respuesta
    const responseData = {
      ...response,
      success: response.response_code === 0,
      message: response.response_code === 0 ? "Transaction approved" : "Transaction rejected"
    };
    
    res.json(responseData);
  } catch (error) {
    console.error("Error confirming transaction:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Error confirming transaction", 
      details: error.message,
      success: false
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});