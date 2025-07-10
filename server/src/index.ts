import express, {Express} from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import config from 'config'
import admin from 'firebase-admin'
import path from 'path'
import router_db from "./routes/db_router"

dotenv.config()

const app:Express = express()
const PORT = process.env.PORT || 4000;
const firebasePath = path.resolve(config.get('firebase.credentialsPath'))

admin.initializeApp({
      credential: admin.credential.cert(firebasePath),
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

app.use('/api/admin', router_db)

app.listen(PORT, async ()=>{
  try{
    
    console.log("Server was started on port ", PORT);
  }catch(err){
    console.log("Server was stoped with error: ", err);
  }
})
