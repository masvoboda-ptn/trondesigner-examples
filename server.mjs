import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";

const app = express();

function requireEnv(name) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
}

const TD_URL = requireEnv("TD_URL");
const TD_API_KEY = requireEnv("TD_API_KEY");

const root = process.cwd();
const examplesDir = path.join(root, "examples");

app.get("/", (req, res) => {
    res.redirect("/examples/index.html");
});

app.get("/examples/:file", (req, res) => {
    const file = req.params.file;
    const filePath = path.join(examplesDir, file);

    // basic safety: prevent directory traversal
    if (!filePath.startsWith(examplesDir)) return res.status(400).send("Bad path");

    if (!fs.existsSync(filePath)) return res.status(404).send("Not found");

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== ".html") return res.status(415).send("Only .html served here");

    let html = fs.readFileSync(filePath, "utf8");

    // Replace your placeholders
    html = html
        .replaceAll("{TD_URL}", TD_URL)
        .replaceAll("{TD_API_KEY}", TD_API_KEY);

    res.type("html").send(html);
});

// Serve static JS/CSS/images normally (no templating)
app.use(express.static(root, { extensions: ["html"] }));

app.listen(process.env.PORT || 3000, () => {
    console.log(`http://localhost:${process.env.PORT || 3000}`);
});
