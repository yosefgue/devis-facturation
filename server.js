const express = require('express');
const path = require('path');
const app = express();
const pool = require("./db.js")
const pg = require("pg");
app.use(express.static('public'));
app.use(express.json())
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("home", {pageClass: "home"});
})

app.get("/clients", (req, res) => {
    res.render("clients", {pageClass: "clients", });
})

app.get("/devis", (req, res) => {
    res.render("devis", {pageClass: "devis"});
})

app.get("/factures", (req, res) => {
    res.render("factures", {pageClass: "factures"});
})

app.get("/devis/new_devis", (req, res) => {
    res.render("new_devis", {pageClass: "new_devis"});
})

app.post("/devis/new_devis", (req, res) => {
    const {nom_client, id_devis, date_devis} = req.body;
    pool.query('insert into webapp_schema.devis (nom_client, id_devis, date_devis) values ($1, $2, $3) returning *', [nom_client, id_devis, date_devis], (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(result);
        }
    });
})

app.get("/factures/new_factures", (req, res) => {
    res.render("new_factures", {pageClass: "new_factures"});
})

app.get("/clients/new_clients", (req, res) => {
    res.render("new_clients", {pageClass: "new_clients"});
})

app.listen(3000);

