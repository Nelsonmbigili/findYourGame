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
	res.send(`
  <div style="display:flex; justify-content:center; align-items:center; height:100vh;">
    <img src="landing-page.png" alt="Website Logo">
  </div>
`);

})

app.get("/login", (req,res)=>{
	res.send(`
  <div style="display:flex; justify-content:center; align-items:center; height:100vh;">
    <img src="Sign-In-page.png" alt="Website Logo">
  </div>
`);

})




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});