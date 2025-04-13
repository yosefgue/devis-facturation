const express = require('express');
const app = express();
const pool = require("./db.js")
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
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

app.get("/devis/download-pdf/:id", async (req, res) => {
    const id = req.params.id
    const devis = await getxbyid('devis', id)
    const produit = await getproduitbyid('devis', id)
    const date = new Date(devis.date_devis);
    const formatdate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const productrows = produit.map(el => {
        return `
        <div class="product-details">
            <h4>${el.description}</h4>
            <h4>${el.quantite}</h4>
            <h4>${el.prix}</h4>
            <h4>${el.total_ht}</h4>
        </div>
        `
    }).join('');
    const csscontent = fs.readFileSync(path.resolve(__dirname, 'public/assets/pdfstyle.css'), 'utf8');
    const logoimg = fs.readFileSync(path.resolve(__dirname, 'public/images/company_logo.svg'), 'utf8')
    const html = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <title>Devis</title>
            <style>
            ${csscontent}
            </style>
        </head>
        <body>
            <div class="main-container">
                <div class="header">
                    ${logoimg}
                    <div>
                        <h4>Devis N° ${devis.id_devis}</h4>
                        <h4>Date:  ${formatdate}</h4>
                    </div>
                </div>
                <div class="company-info">
                    <h4>TIC Escort</h4>
                    <h4>47, Av. Lalla Yacout. Etage 5 </h4>
                    <h4>Casablanca</h4>
                    <h4>Maroc</h4>
                </div>
                <div class="client-info">
                    <div>
                        <h4>Client:</h4>
                        <h4>${devis.nom_client}</h4>
                    </div>
                    <div>
                        <h4>ICE:</h4>
                        <h4>${devis.ice}</h4>
                    </div>
                </div>
                <div class="description">
                    <h4>Description:</h4>
                    <h4>${devis.devis_description}</h4>
                </div>
                <div class="product-main">
                    <div class="product-info">
                        <div class="product-headers">
                            <h4>Description</h4>
                            <h4>Quantite</h4>
                            <h4>Prix Unitaire</h4>
                            <h4>Total HT</h4>
                        </div>
                        ${productrows}
                    </div>
                    <div class="total">
                        <div>
                            <h4>Total ht</h4>
                            <h4>${devis.total_ht}</h4>
                        </div>
                        <div>
                            <h4>Total tva</h4>
                            <h4>${devis.total_tva}</h4>
                        </div>
                        <div id="totalttc">
                            <h4>Total ttc</h4>
                            <h4>${devis.total_ttc}</h4>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <h4>E-mail contact@ticescort.com;</h4>
                    <h4>Tél +212 633942013</h4>
                </div>
            </div>
        </body>
    </html>
    `;
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="devis-${id}.pdf"`,
        });
        res.end(pdf);
    }
    catch (e) {
        console.error(e);
    }
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

app.post("/devis/edit", async (req, res) => {
    const {nom_client, devis_description, ice, date_devis, total_ht, total_tva, total_ttc, id_devis, ...objectsleft} = req.body;
    try {
        await modifydevis(nom_client, devis_description, ice, date_devis, total_ht, total_tva, total_ttc, id_devis)
        res.status(200).send('success');
    }
    catch (error) {
        console.error(error);
    }
    for (const key in objectsleft) {
        const value = objectsleft[key];
        try {
            await modifyproduit(value.description, value.quantite, value.prix, value.total_ht, key)
        }
        catch (error) {
            console.error(error);
        }
    }
})

app.post("/factures/edit", async (req, res) => {
    const {nom_client, facture_description, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc, id_facture, ...objectsleft} = req.body;
    try {
        await modifyfacture(nom_client, facture_description, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc, id_facture)
        res.status(200).send('success');
    }
    catch (error) {
        console.error(error);
    }
    for (const key in objectsleft) {
        const value = objectsleft[key];
        try {
            await modifyproduit(value.description, value.quantite, value.prix, value.total_ht, key)
        }
        catch (error) {
            console.error(error);
        }
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
async function modifydevis(nom_client, devis_description, ice, date_devis, total_ht, total_tva, total_ttc, id_devis) {
    try {
        const result = await pool.query('update webapp_schema.devis set nom_client = $1, devis_description = $2, ice = $3, date_devis = $4, total_ht = $5, total_tva = $6, total_ttc= $7 where id_devis = $8', [nom_client, devis_description, ice, date_devis, total_ht, total_tva, total_ttc, id_devis])
    }
    catch(err) {
        console.error("database error", err);
    }
}

async function modifyfacture(nom_client, facture_description, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc, id_facture) {
    try {
        const result = await pool.query('update webapp_schema.facture set nom_client = $1, facture_description = $2, ice = $3, date_facture = $4, date_echeance = $5 , total_ht = $6, total_tva = $7, total_ttc= $8 where id_facture = $9', [nom_client, facture_description, ice, date_facture, date_echeance, total_ht, total_tva, total_ttc, id_facture])
    }
    catch(err) {
        console.error("database error", err);
    }
}
async function modifyproduit(description, quantite, prix, total_ht, row) {
    try {
        const result = await pool.query(`update webapp_schema.produit set description = $1, quantite = $2, prix = $3, total_ht = $4 where id_produit = $5`, [description, quantite, prix, total_ht, row])
    }
    catch (err) {
        console.error(err);
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

