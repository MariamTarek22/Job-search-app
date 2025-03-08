  // send argument like new Error("messgaaeee",{cause:404})
import  fs  from 'fs';
import path from 'path';
export const globalErrorResHandler= (error, req, res, next) => {
   
  //if came here with error ask is it coming from a fileUpload if from a fileUpload
  // then rollback with the file to delte it from uploads in server
  if(req.file){
    const absFullPath = path.resolve(req.file.path)
    //delete the file from server
    fs.unlinkSync(absFullPath);
  }else if (req.files){
    req.files.forEach(file => {
      const absFullPath = path.resolve(file.path)
      //delete the file from server
      fs.unlinkSync(absFullPath);
    })
  }

    return res.status(error.cause || 500 ).json({
      success: false,
      message: error.message,
      stack: error.stack, // el error da come from which file and which line
    });
  }