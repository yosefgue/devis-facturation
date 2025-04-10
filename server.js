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
    res.render("clients", {pageClass: "clients"});
})

app.get("/devis", async (req, res) => {
    const devis = await getall('devis');
    res.render("devis", {pageClass: "devis", devis});
})
app.delete("/devis/:id", async (req, res) => {
    try {
        const getid = req.params.id;
        await deleteproduit('devis', getid);
        await deletex('devis', getid);
        res.status(200).send('success');
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }

})

app.delete("/factures/:id", async (req, res) => {
    try {
        const getid = req.params.id;
        await deleteproduit('facture', getid);
        await deletex('facture', getid);
        res.status(200).send('success');
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }

})

app.get("/factures", async (req, res) => {
    const facture = await getall('facture');
    res.render("factures", {pageClass: "factures", facture});
})

app.get("/devis/new_devis", (req, res) => {
    res.render("new_devis", {pageClass: "new_devis"});
})

app.get("/devis/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const getdevis = await getxbyid('devis', id)
        const getproduit = await getproduitbyid('devis', id)
        res.json({devis: getdevis, produit: getproduit});
    }
    catch (error) {
        console.error(error);
    }
})

app.get("/clients/new_clients", (req, res) => {
    res.render("new_clients", {pageClass: "new_clients"});
})

app.get("/factures/new_factures", (req, res) => {
    res.render("new_factures", {pageClass: "new_factures"});
})

app.get("/factures/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const getfacture = await getxbyid('facture', id)
        const getproduit = await getproduitbyid('facture', id)
        res.json({facture: getfacture, produit: getproduit});
        console.log(getfacture);
        console.log(getproduit);
    }
    catch (error) {
        console.error(error);
    }
})

app.post("/devis/new_devis", async (req, res) => {
    const {nom_client, date_devis, total_ht, total_tva, total_ttc, devis_description, ice} = req.body;
    let id_devis;

    try {
        id_devis = await insertdevis(nom_client, date_devis, total_ht, total_tva, total_ttc, devis_description, ice);
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

app.post("/factures/new_factures", async (req, res) => {
    const {facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc} = req.body;
    let id_facture;
    try {
        id_facture = await insertfacture(facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc);
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

async function insertdevis(nom_client, date_devis, total_ht, total_tva, total_ttc, devis_description, ice) {
    try {
        const result = await pool.query('insert into webapp_schema.devis (nom_client, date_devis, total_ht, total_tva, total_ttc, devis_description, ice) values ($1, $2, $3, $4, $5, $6, $7) returning *', [nom_client, date_devis, total_ht, total_tva, total_ttc, devis_description, ice]);
        console.log(result.rows[0]);
        return result.rows[0].id_devis
    }
    catch (err) {
        console.error("database error", err);
    }
}
//devis
async function insertproduct(description, quantite, prix, id_devis, total_ht) {
    try {
        const result = await pool.query('insert into webapp_schema.produit (description, quantite, prix, id_devis, total_ht) values ($1, $2, $3, $4, $5) returning *', [description, quantite, prix, id_devis, total_ht]);
        console.log(result.rows[0]);
    }
    catch (err) {
        console.error("database error", err);
    }
};

async function getall(table) {
    const validatetables = ['devis', 'facture', 'produit', 'client'];
    if(!validatetables.includes(table)) {
        throw new Error('Table not found');
    }
    try {
        const x = await pool.query(`SELECT * FROM webapp_schema.${table}`);
        return x.rows;
    }
    catch (err) {
        console.error("database error", err);
    }
}
//delete
async function deletex(table, id) {
    const validtables = ['devis', 'facture', 'produit', 'client'];
    if (!validtables.includes(table)) {
        throw new Error(`table "${table}" not found`);
    }
    try {
        const result = await pool.query(`delete from webapp_schema.${table} where id_${table} = $1`, [id])
        return result.rows[0];
    }
    catch (err) {
        console.error("database error", err);
    }
}

async function deleteproduit(table, id) {
    const validtables = ['devis', 'facture', 'produit', 'client'];
    if (!validtables.includes(table)) {
        throw new Error(`table not found`);
    }
    try {
        const result = await pool.query(`delete from webapp_schema.produit where id_${table} = $1`, [id])
        return result.rows[0];
    }
    catch (err) {
        console.error("database error", err);
    }
}

// facture
async function insertfacture(facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc) {
    try {
        const result = await pool.query('insert into webapp_schema.facture (facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *', [facture_description, nom_client, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc]);
        console.log(result.rows[0]);
        return result.rows[0].id_facture

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
}
async function getxbyid(table, id) {
    const validtables = ['devis', 'facture']
    if (!validtables.includes(table)) {
        throw new Error(`table "${table}" not found`);
    }
    try {
        const x = await pool.query(`SELECT * from webapp_schema.${table} WHERE id_${table} = $1`, [id])
        return x.rows[0];
    }
    catch (err) {
        console.error("database error", err);
    }
}
async function getproduitbyid(table, id) {
    const validatetable = ['devis', 'facture']
    if (!validatetable.includes(table)) {
        throw new Error(`table "${table}" not found`);
    }
    try {
        const produit = await pool.query(`SELECT * from webapp_schema.produit WHERE id_${table} = $1`, [id])
        return produit.rows;
    }
    catch (err) {
        console.error("database error", err);
    }
}

app.listen(3000);

