import mongoose from 'mongoose';

const BarcodeDataSchema = new mongoose.Schema({
	types: [{ type: String }],
	countries: [{ type: String }]
});

const BarcodeDataModel = mongoose.model('BarcodeData', BarcodeDataSchema);

class BarcodeData {
	constructor(types, countries) {
		this.types = types;
		this.countries = countries;
	}

	static async getBarcodeData() {
		return await BarcodeDataModel.findOne();
	}
	static async rewrite(barcodeData) {
		await BarcodeDataModel.remove({});
		return await new BarcodeDataModel(barcodeData).save();
	}
}

export default BarcodeData;
