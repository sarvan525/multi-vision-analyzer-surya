const express = require('express');
const app = express();
const chalk = require('chalk');
const formidable = require('formidable');
const path = require('path');
//const creds = require('./creds.json');
const heroku_creds = JSON.parse(process.env.creds);


const google = require('./google');
const ibm = require('./ibm');
const microsoft = require('./microsoft');
const amazon = require('./amazon');

app.use(express.static('public'));

app.post('/test', (req, res) => {
	console.log(chalk.green('About to Test!'));
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;

	form.parse(req, (err, fields, files) => {
		if(!files.testImage) {
			res.send({result:0});
			return;
		}
		let theFile = files.testImage.path;

		/*
		now we go through N services
		*/
		let services = [];
		services.push(google.doProcess(theFile, heroku_creds.google)); 
		services.push(ibm.doProcess(theFile, heroku_creds.ibm));
		services.push(microsoft.doProcess(theFile, heroku_creds.microsoft));
		//services.push(amazon.doProcess(theFile, heroku_creds.amazon));

		Promise.all(services).then((results) => {
			/*
			each array result is LABEL:data
			*/
			let iResult = {};
			results.forEach((result) => {
				let label = Object.keys(result)[0];
				iResult[label] = result[label];
			});

			res.send({result:iResult});
		}).catch((err) => {
			console.log('Failures', err);	
		});



	});

});

app.listen(process.env.PORT || 5000, '0.0.0.0', function() {
  console.log("listening on port 5000 for local and heroku:"+process.env.PORT);
});