if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const { render } = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const userRoutesRoutes = require('./routes/user')
const campgroundsRoutes = require('./routes/campground')
const reviewsRoutes = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo');


// ('mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useUnifiedTopology: true,
    useFindAndModify: false })

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('Database connected')
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

app.use(mongoSanitize({
    replaceWith: '_'
  }));

const secret = process.env.SECRET || 'thisshouldbebettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});


store.on("error",function(e){
    console.log("SESSION STORE ERROR")
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 60 * 60 * 24 * 7 * 1000,
        maxAge: 60 * 60 * 24 * 7 * 1000
    }
}

app.use(session(sessionConfig))


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dblxvc6nd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'sdfsdfsdf@addAbortSignal', username: '123' })
    const newUser = await User.register(user, 'chicken')
    res.send(newUser)
})

app.use('/', userRoutesRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found', 404));
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    if (!err.message) err.message = 'OH NO SOMETHING WENT WRONG'
    res.status(status).render('error', { err })
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}`)
})