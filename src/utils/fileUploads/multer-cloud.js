//using multer with cloud i only save the upload in BE until i sent      it to cloud then i delete it from my uploads in BE

import multer, { diskStorage } from "multer";

export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/webp"],
  files: ["application/pdf"],
};  

export const cloudUpload = (allowedTypes) => {
  try {
    //cloud now is responsible for creating folder that it will save to and its destination
    const storage = diskStorage({ }); // lw wl object fady btro7 3la el temp folder fl OS

    //filefilter layer (validation before upload)
    // this is not actually do correct validation cause t not secure and can pass a harmful scripts and cause hackingggggg
    //what is more secure if using file-type package that use magicnumber and buffer to get the real extention of the uploaded file (read article in dev site)
    const fileFilter = (req, file, cb) => {
      //file {} => field name , encoding , orignal name , mimetype
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid format !!!!", false));
      }
      return cb(null, true);
    };
    return multer({ storage, fileFilter }); // return object instance from multer class
  } catch (error) {
    console.log(error.message);
  }
};
