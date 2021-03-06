const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
var serveIndex = require('serve-index');

// Init the app

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname, '/dist/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/static', express.static('views'), serveIndex('views', {
    template: function (locals, callback) {
        callback(null, JSON.stringify(locals.fileList));
    }
}));

app.use(express.static(path.join(__dirname, 'blog/_site')));

app.set('port', process.env.PORT || 8080);

// Routes
app.get('/', (request, response) => {
    response.render('index');
});

app.get('/alliance', (request, response) => {
    response.render('alliance');
});

app.get('/content', (request, response) => {
    response.sendFile(path.resolve('views/content/' + request.query.fileName));
});

app.get('/blog', (request, response) => {
    response.sendFile(path.join(__dirname, 'blog/_site/index.html'));
});

app.post('/sendEmail', (request, response) => {
    try {
        var transport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: "dk@bankexfoundation.org",
                pass: "ssrkcrdgcpnsmjam"
            }
        });

        transport.sendMail({
            from: 'noreply@bankexfoundantion.org',
            to: 'info@bankexfoundation.org',
            subject: "Info BANKEX Foundation",
            html: request.body.message,
        }, function (err, data) {
            if (err) {
                response.status(500);
                response.send(JSON.stringify(err.stack));
            }

            response.send(data);
        });
    } catch (e) {
        response.status(500);
        response.send(e)
    }
});

app.get('/*', (request, response, next) => {
    let errStatus = 404;

    // respond with html page
    if (request.accepts('html')) {
        response.render('404', {url: request.url});
        return;
    } else {
        response.status(errStatus).end();
    }
});

// error handlers
if (app.get('env') === 'development') {
    // development error handler(Not needed for now)
    app.use((err, request, response, next) => {
        response.status(err.status || 500);
        response.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;
