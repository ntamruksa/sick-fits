require('dotenv').config({ path: 'variables.env' })
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const createServer = require('./createServer')
const db = require('./db')

const server = createServer()

// TODO use express middleware to handle cookies
// TODO Use express middle to populate current user
server.express.use(function(req, res, next) {
  console.log('Injecting CORS headers')
  res.header('Access-Control-Allow-Origin', 'http://localhost:7777')
  res.header('Access-Control-Allow-Methods', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin,Referer,X-Requested-With,Content-Type,User-agent,Accept'
  )
  res.header('Access-Control-Expose-Headers', 'Content-Range,X-Total-Count')
  res.header('Access-Control-Allow-Credentials', true)
  next()
})
server.express.use(cookieParser());

// decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next();
});

server.start(
  {
    cors: {
      credential: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`server is now running on port http://localhost:${deets.port}`)
  }
)
