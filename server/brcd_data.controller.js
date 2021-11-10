import BarcodeData from './brcd_data.model.js';
import { StatusCodes } from 'http-status-codes';

export function getBarcodeData(req, res) {
	try {
		const barcodeData = BarcodeData.getBarcodeData();
		res.status(StatusCodes.OK).json({
			barcodeData
		});
	} catch (err) {
		res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: 'Internal server error' });
	}
}

export function postBarcodeData(req, res) {
	const { types, countries } = req.body;

	try {
		BarcodeData.rewrite(new BarcodeData(types, countries));
		res
			.status(StatusCodes.OK)
			.json({ message: 'Successfully saved barcode data to database' });
	} catch (err) {
		res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: 'Internal server error' });
	}
}
