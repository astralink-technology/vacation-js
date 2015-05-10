/**
 * Module dependencies
 */

_require = function(name) {
    return require(__dirname + name);
}

_ = require('underscore');

var express = require('express'),
    routes = require('./routes'),
    expressLayouts = require('express-ejs-layouts'),
    http = require('http'),
    path = require('path'),
    heroku = require("heroku-ping"),
    mongoose = require('mongoose');


//session management
var MongoStore = require('connect-mongo')(express);

//check if its in production or not
var webConfig = require('./config/webConfig');
var mainConfig = webConfig.mainConfig();
var live = mainConfig.production;

var app = module.exports = express();


//mongo db connect when app starts
var mongoDbConfig = webConfig.mongoDbConfig();
var conString = 'mongodb://' + mongoDbConfig.dbUser + ':' + mongoDbConfig.password +'@' + mongoDbConfig.host + '/' + mongoDbConfig.db;
var sessConString = 'mongodb://' + mongoDbConfig.sessDbUser + ':' + mongoDbConfig.sessPassword +'@' + mongoDbConfig.sessHost + '/' + mongoDbConfig.sessDb;
mongodb = mongoose.connect(conString);

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 9000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(expressLayouts)
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: 'sh1w31p@ssw0rd',
    store: new MongoStore({
        url: sessConString,
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days of session
        clear_interval: 3600 //clear expired session every hour
    })
}));
app.use(express.favicon(__dirname + '/public/img/favicon.ico', { maxAge: 2592000000 }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'data')));

app.use(app.router);


// development only
if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
    // TODO
}

/**
 * Routes
 */

// serve web pages
app.get('/', routes.index);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


// NO SQL JSON API
app.get ('/list', routes.list);


heroku.ping({
    interval: 900000,     // 15 minutes, default is 30 minutes
    silent: false,       // logging (default: false)
    apps: [{
        name: 'list-holiday-node', // heroku app name - required
        path: "/",     // default to root
        secure: false      // requires https (defaults: false)
    },{
        name: 'list-holiday-node'
    }]
});

/**
 * Start Server
 */
http.createServer(app).listen(app.get('port'), function () {
    var production = 'Production Mode';
    if (!live){
        production = 'Development Mode'
    }
    console.log(production + ' - Express server listening on port ' + app.get('port'));
});

process.on( 'SIGINT', function() {
    //shutting down
    console.log('shutting down');
    mongoose.connection.close();
    // some other closing procedures go here
    process.exit( );
})
