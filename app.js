const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const db = require('./models')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

const app = express()
const port = process.env.PORT || 3000

// set up handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
// set up bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
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

// set up response local variables 
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})

app.listen(port, () => {
  // 跟資料庫同步
  db.sequelize.sync()
  console.log(`App is listening on port ${port}`)
})

require('./routes/index')(app, passport)