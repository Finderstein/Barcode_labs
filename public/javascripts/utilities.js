/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-parens */
/* eslint-disable no-magic-numbers */
const groupA = {
	0: '0001101',
	1: '0011001',
	2: '0010011',
	3: '0111101',
	4: '0100011',
	5: '0110001',
	6: '0101111',
	7: '0111011',
	8: '0110111',
	9: '0001011'
};
const groupC = {
	0: '1110010',
	1: '1100110',
	2: '1101100',
	3: '1000010',
	4: '1011100',
	5: '1001110',
	6: '1010000',
	7: '1000100',
	8: '1001000',
	9: '1110100'
};

const silence = '0000000';
const start_stop = '101';
const middle = '01010';

const getCheckSum = (barcodeStr) => {
	let oddSum = 0;
	let evenSum = 0;
	[...barcodeStr].forEach((char, i) => {
		if (i === 11) {
			return;
		}

		i % 2 === 0 ? (evenSum += parseInt(char)) : (oddSum += parseInt(char));
	});

	return (10 - ((oddSum * 3 + evenSum) % 10)) % 10;
};

const getBarcodeStrokesArr = (barcodeStr) => {
	let barcodeBinary = [
		{ tall: true, binary: silence },
		{ tall: true, binary: start_stop }
	];
	[...barcodeStr].forEach((char, i) => {
		if (i === 11) {
			barcodeBinary.push({ tall: true, binary: groupC[char] });
			return;
		}
		if (i === 0) {
			barcodeBinary.push({ tall: true, binary: groupA[char] });
			return;
		}
		if (i === 6) {
			barcodeBinary.push({ tall: true, binary: middle });
		}

		i < 6
			? barcodeBinary.push({ tall: false, binary: groupA[char] })
			: barcodeBinary.push({ tall: false, binary: groupC[char] });
	});

	barcodeBinary.push(
		{ tall: true, binary: start_stop },
		{ tall: true, binary: silence }
	);

	return barcodeBinary;
};

const drawBarcode = (barcodeBinary, barcodeStr, ctx) => {
	let counter = 0;
	ctx.translate(0.5, 0);
	barcodeBinary.forEach((number) => {
		const binary = number.binary;
		const additionalHeight = number.tall ? 10 : 0;
		[...binary].forEach((char) => {
			if (char === '1') {
				for (let i = 0; i < 2; i++) {
					ctx.beginPath();
					ctx.moveTo(counter * 2 + i, 0);
					ctx.lineTo(counter * 2 + i, 100 + additionalHeight);
					ctx.stroke();
				}
			}
			counter++;
		});
	});

	ctx.font = '20px serif';
	ctx.fillText(barcodeStr.slice(0, 1), 0, 120);
	ctx.fillText(barcodeStr.slice(1, 6), 42, 120);
	ctx.fillText(barcodeStr.slice(6, 11), 122, 120);
	ctx.fillText(barcodeStr.slice(11, 12), 207, 120);

	ctx.translate(-0.5, 0);
};

const clearOutput = (div, resStr, canvas, ctx, error) => {
	resStr.value = '';
	error.innerText = '';

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	div.style.display = 'none';
};

const getDataFromStr = async (barcodeStr) => {
	return fetch(`/api/barcode-data`)
		.then((json) => json.text())
		.then((json) => {
			const barcodeData = JSON.parse(json).barcodeData;

			const colorStr = barcodeStr.slice(3, 9);

			return {
				type: barcodeData.types[+barcodeStr.slice(0, 1)],
				country: barcodeData.countries[+barcodeStr.slice(1, 3)],
				color: [
					Math.round(+colorStr.slice(0, 2) * 2.55),
					Math.round(+colorStr.slice(2, 4) * 2.55),
					Math.round(+colorStr.slice(4, 6) * 2.55)
				],
				price: barcodeStr.slice(9, 11)
			};
		});
};
