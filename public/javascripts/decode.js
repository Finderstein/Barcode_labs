/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-parens */
/* eslint-disable no-magic-numbers */

const decodeCanvas = document.getElementById('decode-barcode');
const decodeCtx = decodeCanvas.getContext('2d');

const decodeStr = document.getElementById('decode-str');
const decodeError = document.getElementById('decode-error');
const decodeResult = document.getElementById('decode-result');

const getKeyByValue = (object, value) => {
	return Object.keys(object).find((key) => object[key] === value);
};

const decodeFromString = () => {
	const barcodeBinary = document.getElementById('decode-binary').value;
	const binaryArr = barcodeBinary.split(' ');
	decodeUPCBarcode(binaryArr);
};

const decodeFromImage = async () => {
	const fileinput = document.getElementById('decode-file'); // input file
	const file = fileinput.files[0];
	const img = new Image();

	const reader = new FileReader();
	// Read in the image file as a data URL.
	reader.readAsDataURL(file);
	reader.onload = function (evt) {
		if (evt.target.readyState === FileReader.DONE) {
			img.src = evt.target.result;
			img.onload = () => {
				decodeCtx.clearRect(0, 0, decodeCanvas.width, decodeCanvas.height);
				decodeCtx.drawImage(img, 0, 0, decodeCanvas.width, decodeCanvas.height);

				let binaryStr = '';
				for (let i = 0; i < 110; i++) {
					const pixel = decodeCtx.getImageData(i * 2, 0, 1, 1);
					const data = pixel.data;
					binaryStr += data[3] / 255 !== 0 ? 1 : 0;
				}

				let formatedBinaryStr = '';
				let sliceStart = 0;
				for (let i = 0; i < 17; i++) {
					if (i === 1 || i === 15) {
						formatedBinaryStr +=
							binaryStr.slice(sliceStart, sliceStart + 3) + ' ';
						sliceStart += 3;
						continue;
					}

					if (i === 8) {
						formatedBinaryStr +=
							binaryStr.slice(sliceStart, sliceStart + 5) + ' ';
						sliceStart += 5;
						continue;
					}

					if (i === 16) {
						formatedBinaryStr += binaryStr.slice(sliceStart, sliceStart + 7);
						sliceStart += 7;
						continue;
					}

					formatedBinaryStr +=
						binaryStr.slice(sliceStart, sliceStart + 7) + ' ';
					sliceStart += 7;
				}

				const binaryArr = formatedBinaryStr.split(' ');
				decodeUPCBarcode(binaryArr);
			};
		}
	};
};

const getStrFromBinaryArr = (binaryArr) => {
	let firstGroup = true;

	const numberArr = binaryArr.map((elem) => {
		if (elem === silence || elem === start_stop) {
			return '';
		}
		if (elem === middle) {
			firstGroup = false;
			return '';
		}
		if (firstGroup) {
			return getKeyByValue(groupA, elem);
		} else {
			return getKeyByValue(groupC, elem);
		}
	});

	return numberArr.join('');
};

const decodeUPCBarcode = async (binaryArr) => {
	clearOutput(decodeResult, decodeStr, decodeCanvas, decodeCtx, decodeError);

	const barcodeStr = getStrFromBinaryArr(binaryArr);
	const productData = await getDataFromStr(barcodeStr);

	if (barcodeStr.length !== 12) {
		decodeError.innerText =
			'Must be encoded 12 numbers. Currently encoded ' + barcodeStr.length;
		return;
	}

	const barcodeStrokesArr = getBarcodeStrokesArr(barcodeStr);

	drawBarcode(barcodeStrokesArr, barcodeStr, decodeCtx);
	manageDecodeOutput(barcodeStr, productData);
};

const manageDecodeOutput = (barcodeStr, productData) => {
	decodeStr.value = barcodeStr;
	decodeStr.style.display = 'block';

	document.getElementById('decoded-type').value = productData.type;
	document.getElementById('decoded-country').value = productData.country;
	document.getElementById('decoded-price').value = productData.price;
	document.getElementById('decoded-color').value = rgbToHex.apply(
		null,
		productData.color
	);

	decodeResult.style.display = 'block';
};
