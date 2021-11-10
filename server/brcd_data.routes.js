import express from 'express';
import { getBarcodeData, postBarcodeData } from './brcd_data.controller.js';

const router = new express.Router();

router.get('/', getBarcodeData);
router.post('/', postBarcodeData);

export default router;
