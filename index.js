const express = require('express');
const app = express();
const morgan = require('morgan');
const catchAsync = require('./utils/catchAsync')
const AppError = require('./utils/ExpressError')




// run on every single request
app.use(morgan('tiny'))

// app.use((req, res, next) => {
//     console.log('this is my first middleware')
//     next();
//     console.log('this is my firswet middleware')
// })

// app.use((req, res, next) => {
//     console.log('this is my second middleware')
//     next();
// })
app.use('/dogs', (req, res, next) => {
    console.log('I LOVE DOGS');
    next();


})

const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'chi') {
        next();
    }
    //res.send('WORONG PASSWORD')
    throw new AppError('Passwaord sdfsddrequire', 401)
}

// app.use((req, res, next) => {
//     const { password } = req.query;
//     
//         next();
//     } {
//         res.send('sorry you need a password')
//     }

// })

app.get('/', (req, res) => {
    console.log(`REQUESTTIME : ${req.requestTime}`)
    res.send('home page')
})
// app.use((req, res, next) => {
//     req.requestTime = Date.now();
//     console.log(req.method, req.path);
//     next();
// })

app.get('/dogs', (req, res) => {
    console.log(`REQUESTTIME : ${req.requestTime}`)
    res.send('wangwang')
})

app.get('/error', (req, res) => {
    chinken.fsd();
})

app.get('/secret', verifyPassword, (req, res) => {
    res.send('My secret is is sometimes I weat headhpasd asfasdsfasd')
})

app.get('/admin', (req, res) => {
    throw new AppError('YOUR ARE NOT ADMIN', 403)
})

app.use((req, res) => {
    res.status(404).send('NORFOUND')
})

// app.use((err, req, res, next) => {
//     console.log('************************')
//     console.log('***************ERROR****************')
//     console.log('*********************')
//     console.log(err);
//     next(err);
// })

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    const { message = 'wrong' } = err;
    res.status(status).send(message)
})



app.listen(3000, () => {
    console.log('LISTENING TO PORT 3000')
})