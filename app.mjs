import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import './config.mjs';
import "./db.mjs"

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'documentation')));
app.set("view engine", "hbs");

app.get("/", (req,res)=>{
	res.send("Index Page")
})

app.get("/login", (req,res)=>{
	res.send("log in page")
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});