const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("home", {pageClass: "active_home"});
})

app.get("/clients", (req, res) => {
    res.render("clients", {pageClass: "active_clients"});
})

app.get("/devis", (req, res) => {
    res.render("devis", {pageClass: "active_devis"});
})

app.get("/factures", (req, res) => {
    res.render("factures", {pageClass: "active_factures"});
})


app.listen(3000);