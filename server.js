let express = require('express');
let app = express();
let port = process.env.PORT || 8080;
let bodyParser = require('body-parser');
let morgan = require('morgan');
let mongoose = require('mongoose');

let jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let User = require('./app/models/user'); // get our mongoose modelvar port

let apiRoutes = express.Router(); // get an instance of the router for api routes

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/node-api-secured-jwt', {
  useMongoClient: true,
});

app.set('secretKey', 'node-api-secured-jwt-secret'); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// route to show a random message (GET http://localhost:8080/)
api.get('/', function (req, res) {
  res.json({ message: 'Welcome to NodeJS secured API with jwt' });
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', (req, res) => {

  // find the user
  User.findOne({
    name: req.body.name
  }, (err, user) => {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token with only our given payload
        // we don't want to pass in the entire user since that has the password
        const payload = {
          admin: user.admin
        };
        let token = jwt.sign(payload, app.get('secretKey'), {
          expiresIn: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Token successfully generated',
          token: token
        });
      }
    }
  });
});

// route middleware to verify a token
apiRoutes.use((req, res, next) => {

  // check header or url parameters or post parameters for token
  let token = req.headers.authorization;

  // decode token
  if (token) {
    // remove 'Basic' or 'Bearer', just get token only
    token = token.substr(token.indexOf(' ')+1);    

    // verifies secret and checks exp
    jwt.verify(token, app.get('secretKey'), (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

// test route to create a single user
apiRoutes.get('/signUp', function (req, res) {
  // create a sample user
  var newUser = new User({
    name: 'felippeDev',
    password: 'password123',
    admin: true
  });

  // save the sample user
  newUser.save(function (err) {
    if (err) throw err;

    console.log('User created successfully.');
    res.json({ success: true, message: 'User created successfully.' });
  });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {
  User.find({}, function (err, users) {
    res.json(users);
  });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

app.listen(port);
console.log('Server listening on port' + port);