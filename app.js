const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('./handlers/multer');
const imageController = require('./controllers/image');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();


// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


//EJS
app.set('view engine', 'ejs');


// Express Session Middlware
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

//Connect flash
app.use(flash());

//Global variables
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

//Route
app.get('/', imageController.getIndexPage);


//Upload image - POST
app.post('/upload', multer.upload.single('imageFile'), imageController.uploadImage);

//Delete image
app.get('/delete/'+ process.env.CLOUDINARY_FOLDER_NAME +'/:id', imageController.deleteImage);


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server is running on port "+PORT);
});
