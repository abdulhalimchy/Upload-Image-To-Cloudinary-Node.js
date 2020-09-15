const Image = require('../models/Image');
const path = require('path');
const cloudinary = require('cloudinary');
require('../handlers/cloudinary'); // config cloudinary

//-------------------GET INDEX PAGE------------------
exports.getIndexPage = async (req, res) => {
    Image.find()
        .then(imgs => {

            //Sorting by date
            imgs.sort((a, b) => {
                return b.date-a.date;
            });

            res.render('index', { imgs })
        })
        .catch(err => console.log("Error:\n"+ err));
}


//--------------------UPLOAD IMAGE-------------------
exports.uploadImage = (req, res) => {

    if (req.file != undefined && checkFileType(req.file)) {
        //File is an image file, go ahead to upload

        //Checking file size limit
        if (fileSize(req.file.size)) {
            cloudinary.v2.uploader.upload(req.file.path, { folder: process.env.CLOUDINARY_FOLDER_NAME })
                .then(result => {

                    //upload done, now save image info to database 
                    const newImage = Image({
                        url: result.secure_url,
                        imgId: result.public_id
                    });

                    newImage.save()
                        .then(img => {
                            req.flash('success_msg', 'Image uploaded succesfully');
                            res.redirect('/');
                        })
                        .catch(err=>{
                            req.flash('error_msg', 'Failed to upload, try again.');
                            res.redirect('/');
                        });

                })
                .catch(err => {
                    req.flash('error_msg', 'Failed to upload, try again.');
                    res.redirect('/');
                });
        }else{
            req.flash('error_msg', 'File size should be less than or equal to 2MB');
            res.redirect('/');
        }

    } else {
        req.flash('error_msg', 'Please select an image file (jpeg, jpg, png or gif)');
        res.redirect('/');
    }
}


//---------------------------------DELETE IMAGE--------------
exports.deleteImage = (req, res) => {
    const public_id = process.env.CLOUDINARY_FOLDER_NAME+ '/' +req.params.id;

    Image.deleteOne({ imgId: public_id})
        .then(img => {
            cloudinary.v2.uploader.destroy(public_id)
                .then(result => {
                    req.flash('success_msg', 'Image deleted succesfully');
                    res.redirect('/');
                })
                .catch(error => {

                });

        })
        .catch(err=>{
            req.flash('error_msg', 'Failed to delete');
            res.redirect('/');
        });
}


//Check File type
function checkFileType(file) {
    //Allowed extensions
    const fileTypes = /jpeg|jpg|png|gif/;

    //Check ext
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    // Check mime
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extName) {
        return true;
    } else {
        return false;
    }
}

//Check File Size Limit
function fileSize(size) {
    if (size > 2097152) {
        return false; //file size is greater than 2MB
    } else {
        return true;
    }
}
