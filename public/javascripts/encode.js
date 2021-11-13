/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-parens */
/* eslint-disable no-magic-numbers */

const encodeCanvas = document.getElementById('encode-barcode');
const encodeCtx = encodeCanvas.getContext('2d');
encodeCtx.imageSmoothingEnabled = false;
//encodeCtx.scale(2, 1);

const encodeBinary = document.getElementById('encode-binary');
const encodeError = document.getElementById('encode-error');
const encodeResult = document.getElementById('encode-result');

const hexToRgb = (hex) =>
	hex
		.replace(
			/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
			(m, r, g, b) => '#' + r + r + g + g + b + b
		)
		.substring(1)
		.match(/.{2}/g)
		.map((x) => parseInt(x, 16));

const encodeFromString = () => {
	const barcodeStr = document.getElementById('encode-str').value;
	encodeUPCBarcode(barcodeStr);
};

const encodeFromInputs = () => {
	const price = document.getElementById('price').value;
	if (price === '' || +price < 1 || +price > 100) {
		encodeError.innerText = 'Invalid price';
		return;
	}

	const rgbArr = hexToRgb(document.getElementById('color').value);
	const colorInSixNumbers = rgbArr
		.map((number) => {
			let dividedNumber = Math.round(+number / 2.55);
			if (dividedNumber === 100) {
				dividedNumber--;
			}

			return ('' + dividedNumber).padStart(2, '0');
		})
		.join('');

	const barcodeStr =
		document.getElementById('type').value +
		document.getElementById('country').value.padStart(2, '0') +
		colorInSixNumbers +
		price.padStart(2, '0');

	encodeUPCBarcode(barcodeStr);
};

const encodeUPCBarcode = (barcodeStr) => {
	clearOutput(encodeResult, encodeBinary, encodeCanvas, encodeCtx, encodeError);

	if (barcodeStr.length > 12 || barcodeStr.length < 11) {
		encodeError.innerText = 'Length must be 11 or 12';
		return;
	}

	const checkSum = getCheckSum(barcodeStr);
	if (barcodeStr.length === 11) {
		barcodeStr += checkSum;
	} else if (+barcodeStr[11] !== checkSum) {
		encodeError.innerText = 'CheckSum value (last number) is not valid';
		return;
	}

	const barcodeStrokesArr = getBarcodeStrokesArr(barcodeStr);

	drawBarcode(barcodeStrokesArr, barcodeStr, encodeCtx);
	manageEncodeOutput(barcodeStrokesArr);
};

const manageEncodeOutput = (barcodeStrokesArr) => {
	encodeBinary.value = barcodeStrokesArr.map((item) => item.binary).join(' ');
	encodeResult.style.display = 'block';
};

const downloadBarcode = () => {
	const link = document.createElement('a');
	link.download = 'upc.png';
	link.href = encodeCanvas.toDataURL();
	link.click();
	link.delete;
};
