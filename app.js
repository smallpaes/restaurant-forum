const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const db = require('./models')
const flash = require('connect-flash')
const cors = require('cors')
const session = require('express-session')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }
const passport = require('./config/passport')

const app = express()
const port = process.env.PORT || 3000

// cors 的預設為全開放
app.use(cors())

// set up handlebars
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')
// set up bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// set up session
app.use(session({ secret: 'randomSecret', resave: false, saveUninitialized: false }))
// set up flash
app.use(flash())
// set up passport
app.use(passport.initialize())
app.use(passport.session())
// set up method-override
app.use(methodOverride('_method'))
// Server static file
app.use('/upload', express.static('upload'))
app.use(express.static('public'))

// set up response local variables 
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})

require('./routes/index')(app)