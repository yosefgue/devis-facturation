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

app.get("/devis", async (req, res) => {
    const devis = await getdevis();
    const produit = await getproduit();
    res.render("devis", {pageClass: "devis", devis, produit});
})

app.get("/factures", (req, res) => {
    res.render("factures", {pageClass: "factures"});
})

app.get("/devis/new_devis", (req, res) => {
    res.render("new_devis", {pageClass: "new_devis"});
})

app.post("/devis/new_devis", async (req, res) => {
    const {nom_client, id_devis, date_devis, total_ht, total_tva, total_ttc} = req.body;

    try {
        await insertdevis(nom_client, id_devis, date_devis, total_ht, total_tva, total_ttc);
        console.log("rows inserted successfully.");
    }
    catch(err) {
        console.error("rows not inserted", err);
    }
    // insert products into database
    const productcount = Object.keys(req.body).filter(key => key.startsWith("description")).length;
    const promiselist = [];
    for (let i = 1; i <= productcount; i++) {
        const description = req.body[`description${i}`];
        const prix = req.body[`prix${i}`];
        const quantite = req.body[`quantite${i}`]
        const total_ht = req.body[`total${i}`];
        promiselist.push(insertproduct(description, quantite, prix, id_devis, total_ht));
    }
    try {
        await Promise.all(promiselist);
        res.send('success');
        console.log("res sent");

    }
    catch(err) {
        console.error(err);
    }
});

async function insertdevis(nom_client, id_devis, date_devis, total_ht, total_tva, total_ttc) {
    try {
        const result = await pool.query('insert into webapp_schema.devis (nom_client, id_devis, date_devis, total_ht, total_tva, total_ttc) values ($1, $2, $3, $4, $5, $6) returning *', [nom_client, id_devis, date_devis, total_ht, total_tva, total_ttc]);
        console.log(result.rows[0]);
    }
    catch (err) {
        console.error("database error", err);
    }
}

async function insertproduct(description, quantite, prix, id_devis, total_ht) {
    try {
        const result = await pool.query('insert into webapp_schema.produit (description, quantite, prix, id_devis, total_ht) values ($1, $2, $3, $4, $5) returning *', [description, quantite, prix, id_devis, total_ht]);
        console.log(result.rows[0]);
    }
    catch (err) {
        console.error("database error", err);
    }
};

async function getdevis() {
    try {
        const devis = await pool.query('SELECT * FROM webapp_schema.devis');
        return devis.rows;
    }
    catch (err) {
        console.error("database error", err);
    }
}

async function getproduit() {
    try {
        const produit = await pool.query('SELECT * FROM webapp_schema.produit');
        return produit.rows;
    }
    catch (err) {
        console.error("database error", err);
    }
}

app.get("/factures/new_factures", (req, res) => {
    res.render("new_factures", {pageClass: "new_factures"});
})

app.post("/factures/new_factures", async (req, res) => {
    const {id_facture, facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc} = req.body;
    try {
        await insertfacture(id_facture, facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc);
        console.log("rows inserted successfully.");
    }
    catch(err) {
        console.error("rows not inserted", err);
    }

    // insert products into database
    const productcount = Object.keys(req.body).filter(key => key.startsWith("description")).length;
    const promiselist = [];
    for (let i = 1; i <= productcount; i++) {
        const description = req.body[`description${i}`];
        const prix = req.body[`prix${i}`];
        const quantite = req.body[`quantite${i}`]
        const total_ht = req.body[`total${i}`];
        promiselist.push(insertproduct_facture(description, quantite, prix, id_facture, total_ht));
    }
    try {
        await Promise.all(promiselist);
        res.send('success');
        console.log("res sent");

    }
    catch(err) {
        console.error(err);
    }
});
async function insertfacture(id_facture, facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc) {
    try {
        const result = await pool.query('insert into webapp_schema.facture (id_facture, facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *', [id_facture, facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc]);
        console.log(result.rows[0]);
    }
    catch (err) {
        console.error("database error", err);
    }
}
async function insertproduct_facture(description, quantite, prix, id_facture, total_ht) {
    try {
        const result = await pool.query('insert into webapp_schema.produit (description, quantite, prix, id_facture, total_ht) values ($1, $2, $3, $4, $5) returning *', [description, quantite, prix, id_facture, total_ht]);
        console.log(result.rows[0]);
    }
    catch (err) {
        console.error("database error", err);
    }
};


app.get("/clients/new_clients", (req, res) => {
    res.render("new_clients", {pageClass: "new_clients"});
})

app.listen(3000);

