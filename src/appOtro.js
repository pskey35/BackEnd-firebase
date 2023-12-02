
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');
const { buildSchema } = require('graphql');
const fs = require('fs');
const multer = require("multer")
const app = express();
const port = 4000;
const admin = require("firebase-admin")
const serviceAccount = require('./servicioFirebase.json');
const cors = require("cors")
app.use(cors())
//import HttpsProxyAgent from 'https-proxy-agent';
/*const HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
const agent = new HttpsProxyAgent('http://192.168.43.1:8080');*/
app.use(express.json())
const schema = buildSchema(`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    hello: String
  }

  type Mutation {
    uploadFile(file: Upload!): File
  }
`);

const root = {
  Upload: GraphQLUpload,
  uploadFile: async ({ file }) => {
    const { createReadStream, filename, mimetype, encoding } = await file;

    // Puedes realizar acciones con el archivo, como guardar en el sistema de archivos
    const stream = createReadStream();
    const path = `./uploads/${filename}`;
    
    await new Promise((resolve, reject) =>
      stream.pipe(fs.createWriteStream(path))
        .on('finish', resolve)
        .on('error', reject)
    );

    return { filename, mimetype, encoding };
  },
};
/*
firebase config es solo del lado del front
const firebaseConfig = {
    apiKey: "AIzaSyBWBceEpyHQeYSrEjA_l2_03HkCmVSN5Aw",
    authDomain: "node-4030d.firebaseapp.com",
    projectId: "node-4030d",
    storageBucket: "node-4030d.appspot.com",
    messagingSenderId: "913085778328",
    appId: "1:913085778328:web:57a839709295f29b6a43ed",
    measurementId: "G-CSQDYCMTB8"
  };
*/
  //esto inicializa firebase sdk
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "node-4030d.appspot.com"
  });


app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));





// Configuración de multer para manejar archivos
const storage = multer.memoryStorage(); // Almacenar en memoria para acceder a los datos en req.file.buffer
const upload = multer({ storage: storage });

app.post('/imagen', upload.single('archivo'), async (req, res) => {
    /*console.log(req.file); // Acceder al archivo en req.file
    const bucket = admin.storage().bucket()
    const fileName = "prueba2"
    const file = bucket.file("prueba2")

    await file.createWriteStream().end(req.file.buffer)
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
    console.log(url)
    res.json({ message: 'Archivo recibido con éxito' });*/
    const bucket = admin.storage().bucket();
    const fileName = "prueba2"; // Nombre del archivo en Firebase Storage
    const file = bucket.file(fileName);

    const fileStream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    });

    fileStream.on('error', (err) => {
        console.error('Error al escribir el archivo:', err);
        res.status(500).json({ error: 'Error al escribir el archivo en Firebase Storage' });
    });

    fileStream.on('finish', async () => {
        // El archivo se escribió con éxito, ahora obtenemos la URL firmada
        const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
        console.log('URL del archivo:', url);
        res.json({ message: 'Archivo recibido con éxito', url });
    });

    fileStream.end(req.file.buffer); // Finaliza el flujo con los datos del archivo
});


module.exports = app