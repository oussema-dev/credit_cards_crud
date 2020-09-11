require('dotenv').config();
const express = require('express'),
	app = express(),
	methodOverride = require('method-override'),
	mongoose = require('mongoose'),
	session = require('express-session'),
	flash = require('connect-flash');

mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true,
	useUnifiedTopology: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(flash());
app.use(
	session({
		secret: 'Secret',
		resave: false,
		saveUninitialized: false
	})
);
app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

const cardSchema = new mongoose.Schema({
	type: String,
	user: String,
	number: String,
	cvv2: String,
	expiry: Date
});
const Card = mongoose.model('Card', cardSchema);

app.get('/cards', async (req, res) => {
	const cards = await Card.find({});
	res.render('index', { cards });
});

app.get('/cards/new', (req, res) => {
	res.render('new');
});

app.post('/cards', async (req, res) => {
	await Card.create(req.body.card);
	req.flash('success', 'Credit Card Created Successfully !');
	res.redirect('/cards');
});

app.get('/cards/:id', async (req, res) => {
	try {
		const card = await Card.findById(req.params.id);
		switch (card.type) {
			case 'Visa':
				res.locals.imgUrl = 'https://imgur.com/wKdGHeY.png';
				return res.render('visa', { card });
			case 'Master Card':
				res.locals.imgUrl = 'https://imgur.com/THvKDKD.png';
				return res.render('master', { card });
			case 'BestBank':
				res.locals.imgUrl = 'https://imgur.com/LZeW6hy.png';
				return res.render('best', { card });
		}
	} catch (err) {
		req.flash('error', 'Credit Card Not Found');
		res.redirect('/cards');
	}
});

app.get('/cards/:id/edit', async (req, res) => {
	try {
		const card = await Card.findById(req.params.id);
		if (card) res.render('edit', { card });
		else {
			req.flash('error', 'Credit Card Not Found');
			res.redirect('/cards');
		}
	} catch (err) {
		req.flash('error', 'Credit Card Not Found');
		res.redirect('/cards');
	}
});

app.put('/cards/:id', async (req, res) => {
	try {
		await Card.findByIdAndUpdate(req.params.id, req.body.card);
		res.redirect('/cards/' + req.params.id);
	} catch (err) {
		req.flash('error', 'Credit Card Not Found');
		res.redirect('/cards');
	}
});

app.delete('/cards/:id', async (req, res) => {
	try {
		const deletedCard = await Card.findByIdAndRemove(req.params.id);
		if (deletedCard) {
			req.flash('success', 'Credit Card Removed Successfully !');
			res.redirect('/cards');
		} else {
			req.flash('error', 'Credit Card Not Found');
			res.redirect('/cards');
		}
	} catch (error) {
		req.flash('error', 'Credit Card Not Found');
		res.redirect('/cards');
	}
});

app.get('*', (req, res) => {
	res.redirect('/cards');
});

app.listen(process.env.PORT, () => {
	console.log(`Server started on port ${process.env.PORT}`);
});
