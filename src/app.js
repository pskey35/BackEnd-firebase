const express = require("express")
const multer = require("multer")
const app = express()
const cors = require('cors')
const firebase = require("firebase/compat/app")
require("firebase/compat/storage")
const corsOptions = {
    origin: ['https://galy.vercel.app',"http://localhost:3000","http://127.0.0.1:3000"], // Cambia '*' al dominio específico de tu cliente en producción
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionSuccessStatus:200,
  };
  app.use(cors(corsOptions));

  
const firebaseConfig = {
  apiKey: "AIzaSyBWBceEpyHQeYSrEjA_l2_03HkCmVSN5Aw",
  authDomain: "node-4030d.firebaseapp.com",
  projectId: "node-4030d",
  storageBucket: "node-4030d.appspot.com",
  messagingSenderId: "913085778328",
  appId: "1:913085778328:web:57a839709295f29b6a43ed",
  measurementId: "G-CSQDYCMTB8"
};

firebase.initializeApp(firebaseConfig)

//esto de aqui solo configure que se guarde en memoria temporalmente
const storage = multer.memoryStorage()
const upload = multer({storage:storage})
                              //le puse archivo porque asi se envia con ese nombre en el formData del frontend
app.post("/file",upload.single("archivo"),async (req,res)=>{
try{
  console.log(req.file)
  const {originalName,buffer} = req.file
  const storageRef = firebase.storage().ref("carpetaK/carpeta2/file")
  await  storageRef.put(buffer)
  const url = await storageRef.getDownloadURL()
  console.log(req.file)
  console.log("---------")
  console.log({exito:url})
  return res.json({url:url})

}catch(e){
  console.log("hubo un error")
  console.log(e)
 return res.status(500).json({error:e})
}
})


module.exports = app