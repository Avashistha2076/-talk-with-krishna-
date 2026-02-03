// CORS कॉन्फ़िगरेशन
const corsOptions = {
    origin: '*',  // सभी डोमेन से रिक्वेस्ट की अनुमति दें
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
};

// मिडलवेयर
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
// ... existing code ... 