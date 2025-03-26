const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));
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

app.get("/factures/new_factures", (req, res) => {
    res.render("new_factures", {pageClass: "new_factures"});
})

app.get("/clients/new_clients", (req, res) => {
    res.render("new_clients", {pageClass: "new_clients"});
})

app.listen(3000);