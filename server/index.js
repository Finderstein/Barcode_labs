import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BarcodeDataRouter from './brcd_data.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));
app.use(cors());

// simple route
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to my games finder.' });
});

// routes
app.use('/api/barcode-data', BarcodeDataRouter);

const reservePORT = 8080; // Removing warning from eslint
const PORT = process.env.PORT || reservePORT;
const databaseUrl = process.env.DB;

mongoose
	.connect(databaseUrl, { useNewUrlParser: true })
	.then(() => console.log(`Database connected!`))
	.then(() =>
		app.listen(PORT, () => {
			console.log(
				`Server is ready on port: ${PORT}.`,
				`http://localhost:${PORT}/`
			);
		})
	)
	.catch((err) => console.log(`Start error ${err}`));
