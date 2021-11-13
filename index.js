import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import mustache from 'mustache-express';
import BarcodeDataRouter from './routes/brcd_data.routes.js';
import BarcodeData from './models/brcd_data.model.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));
app.use(cors());
app.use(express.static('public'));

const __dirname = path.resolve();
const viewsDir = path.join(__dirname, 'views');
app.engine('mst', mustache(path.join(viewsDir, 'partials')));
app.set('views', viewsDir);
app.set('view engine', 'mst');

// simple route
app.get('/', async (req, res) => {
	const barcodeData = await BarcodeData.getBarcodeData();
	let typeCounter = 0;
	let countryCounter = 0;
	res.render('index', {
		barcodeData,
		typeIndex: function () {
			return typeCounter++;
		},
		countryIndex: function () {
			return countryCounter++;
		}
	});
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
