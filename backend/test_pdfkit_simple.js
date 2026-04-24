const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
const buffers = [];
doc.on('data', buffers.push.bind(buffers));
doc.on('error', (err) => {
    console.error('PDF Generation Error:', err);
    process.exit(1);
});
doc.on('end', async () => {
    try {
        const pdfData = Buffer.concat(buffers);
        await fs.promises.writeFile('test.pdf', pdfData);
        console.log('PDF Length:', pdfData.length);
        console.log('Successfully wrote test.pdf');
    } catch (err) {
        console.error('Error writing test.pdf:', err);
        process.exit(1);
    }
});

doc.text('Hello World');
doc.end();
