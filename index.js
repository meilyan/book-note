import express from "express";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const API_URL = "https://openlibrary.org/search.json"

const db = new pg.Client({
    user: "zcogjsdk",
    host: "satao.db.elephantsql.com",
    database: "zcogjsdk",
    password: "IyYCsZMTnV_C_WFlmXU-qubbxRKmfyeE",
    port: 5432
})
db.connect();

let books = [];

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

app.get("/", async(req, res) => {
    const result = await db.query("SELECT * FROM books");
    books = result.rows;
    console.log(books)
    res.render("index.ejs", {
        book: books
    })
});

app.get("/admin", async (req, res) => {
    res.render("admin/index.ejs");
});

app.get("/admin/post", async(req, res) => {
    res.render("admin/new.ejs")
});

app.post("/admin/search", async(req, res) => {
    const searchId = req.body.search;
    const searchResult = await axios.get(`${API_URL}?q=${searchId}`)
    res.render("admin/new.ejs", {
        id: searchResult.data.docs[0].edition_key[0],
        title: searchResult.data.docs[0].title,
        lang: searchResult.data.docs[0].language[0],
        author: searchResult.data.docs[0].author_name[0],
        publisher: searchResult.data.docs[0].publisher[0],
        publish: searchResult.data.docs[0].publish_date[0],
        img: searchResult.data.docs[0].cover_i
    });
});

app.post("/admin/submit", async(req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const lang = req.body.lang;
    const author = req.body.author;
    const publisher = req.body.publisher;
    const publish = req.body.publish;
    const img = "https://covers.openlibrary.org/b/id/" + req.body.img + "-L.jpg";
    console.log(img)

    await db.query("INSERT INTO books (book_key, title, language, author_name, publisher, publish, img) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [id, title, lang, author, publisher, publish, img])
    res.redirect("/admin")
});

app.post("/admin/delete", async(req, res) => {});

app.listen(port, (
    console.log(`Server running on http://localhost:${port}`)
))