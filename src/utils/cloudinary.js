import {v2 as cloudinary} from 'cloudinary';

import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_cLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRT_KEY 
});

const uploadoncloudinary = async(localFilePath)=>{
    try{
 if(!localFilePath) return null;
  const response= await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto"
 })
 console.log("file is uploaded",response.url);
 return response;
    } catch(error){
        fs.unlink(localFilePath)
        return null;

    }

}

export {uploadoncloudinary } 

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });