const selectalldevis = document.querySelectorAll(".devis-unit")
const selectdelete = document.querySelectorAll(".deletex")
const selectcontentcontainer = document.querySelector(".content-container")
const selectedit = document.querySelectorAll(".editx")
let totalht;
let totaltva;
let totalttc;

selectcontentcontainer.addEventListener("click", (e) => {
    if(document.querySelector(".main-info")) {
        const selectcontentinfo = document.querySelector(".product-info")

        selectcontentinfo.addEventListener("input", (e) => {
            const id = e.target.dataset.id;
            const prixInput = document.querySelector(`input[name="prix"][data-id="${id}"]`);
            const quantiteInput = document.querySelector(`input[name="quantite"][data-id="${id}"]`);
            const totalInput = document.querySelector(`input[name="total_ht"][data-id="${id}"]`);

            const prix = parseFloat(prixInput.value) || 0;
            const quantite = parseFloat(quantiteInput.value) || 0;

            totalInput.value = (prix * quantite).toFixed(2);

            const selecttotalht = document.querySelector("#produit_total_ht");
            const selecttotaltva = document.querySelector("#produit_total_tva");
            const selecttotalttc = document.querySelector("#produit_total_ttc");
            const totalloop = document.querySelectorAll(`input[name="total_ht"][data-id]`);
            totalht = 0
            totalloop.forEach(el => {
                totalht += parseFloat(el.value);
            })
            totaltva = totalht * 0.2;
            totalttc = totaltva + totalht;
            selecttotalht.textContent = totalht.toFixed(2);
            selecttotaltva.textContent = totaltva.toFixed(2);
            selecttotalttc.textContent = totalttc.toFixed(2);
        })
    }
    if (e.target.matches("#submitedit")) {
        const id_devis = e.target.dataset.id_devis
        const form = e.target.form;
        const selectdataset = form.querySelectorAll("[data-id]")
        const formattedform = new FormData(form);
        const data = {};
        const totalloop = document.querySelectorAll(`input[name="total_ht"][data-id]`);
        totalht = 0
        totalloop.forEach(el => {
            totalht += parseFloat(el.value);
        })
        totaltva = totalht * 0.2;
        totalttc = totaltva + totalht;

        for (const [key, value] of formattedform) {
            if (key === "description" || key === "quantite" || key === "prix" || key === "total_ht") {
                continue;
            }
            data[key] = value
        }
        data["id_devis"] = id_devis
        data["total_ht"] = totalht
        data["total_tva"] = totaltva
        data["total_ttc"] = totalttc;
        selectdataset.forEach(el => {
            const id = el.dataset.id;
            console.log(id)
            const name = el.name;
            const value = el.value;
            if (!data[id]) {
                data[id] = {};
            }
            data[id][name] = value;
        })
        console.log(data)
        fetch("/devis/edit", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.ok) {
                    location.reload()
                }
            })
    }
    if (e.target.matches("#devisdownload")) {
        const selection = e.target
        const getid = selection.dataset.id_download
        console.log(getid)
        e.preventDefault();
        fetch(`devis/download-pdf/${getid}`)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `devis-${getid}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
            })
    }
})

selectedit.forEach(el => {
    el.addEventListener("click", (e) => {
        const maininfo = document.querySelector(".main-info");
        if (maininfo) {
            maininfo.remove()
            return;
        }
        const currentelement = e.currentTarget;
        const getid = currentelement.dataset.id;
        const parent = currentelement.parentElement.parentElement;
        fetch(`/devis/${getid}`)
            .then(res => res.json())
            .then(data => {
                const date = new Date(data.devis.date_devis);
                const formatdate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const formatted_id = `D-${String(data.devis.id_devis).padStart(4,'0')}`;
                const productrows = data.produit.map(prod => {
                    return `
                <div class="product-details">
                    <input type="text" name="description" maxlength="100" value="${prod.description}" required data-id="${prod.id_produit}">
                    <input type="number" min="0" name="quantite" required value="${prod.quantite}" data-id="${prod.id_produit}">
                    <input type="number" min="0" name="prix" required value="${prod.prix}" data-id="${prod.id_produit}">
                    <input type="number" name="total_ht" step="0.01" value="${prod.total_ht}" data-id="${prod.id_produit}">
                </div>
                `
                }).join('');
                const popup = `
                <div class="main-info">
                    <div class="title-header">
                        <h4>Devis N° ${formatted_id}</h4>
                    </div>
                    <form action="">
                        <div class="first-header">
                            <input type="text" name="nom_client" maxlength="30" value="${data.devis.nom_client}" required>
                            <input type="text" name="ice" maxlength="15" inputmode="numeric" oninput="this.value = this.value.replace(/\\D/g, '')" value="${data.devis.ice}" required>
                            <input type="text" min="0" name="devis_description" value="${data.devis.devis_description}">
                            <input type="date" name="date_devis" required value="${formatdate}">
                        </div>
                        <div class="info-container">
                            <div class="product-info">
                                <div class="product-headers">
                                    <h5>Description</h5>
                                    <h5>Quantite</h5>
                                    <h5>Prix Unitaire</h5>
                                    <h5>total_ht</h5>
                                </div>
                                ${productrows}
                            </div>
                            <div class="totalall">
                                <div>
                                    <h5>Total ht</h5>
                                    <h5 id="produit_total_ht">${data.devis.total_ht}</h5>
                                </div>
                                <div>
                                    <h5>Total tva</h5>
                                    <h5 id="produit_total_tva">${data.devis.total_tva}</h5>
                                </div>
                                <div id="totalttc">
                                    <h5>Total ttc</h5>
                                    <h5 id="produit_total_ttc">${data.devis.total_ttc}</h5>
                                </div>
                            </div>
                            <button type="button" id="submitedit" data-id_devis="${data.devis.id_devis}">Modifier</button>
                        </div>
                    </form>
                </div>
                `;
                parent.insertAdjacentHTML("afterend", popup)
                }
            )
    })
})

if (selectcontentcontainer.children.length === 0) {
    const content =
        `
        <div class="empty-div">
            <img src="/images/invoice-receipt.svg" alt="">
            <h2>Aucun devis disponible.</h2>
            <h2>Les devis créés apparaîtront ici.</h2>
        </div>
        `;
    selectcontentcontainer.insertAdjacentHTML('afterbegin', content);
    selectcontentcontainer.classList.add("centerempty");
}

selectdelete.forEach(el => {
    el.addEventListener("click", (e) => {
        const getid = e.currentTarget.dataset.id
        fetch(`/devis/${getid}`, {method: "DELETE"})
            .then(res => {
                if (res.ok) {
                    location.reload()
                }
                else {
                    console.error("something wrong")
                }
            })
    })
})

selectalldevis.forEach(el => {
    el.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" || e.target.tagName === "IMG") {
            return;
        }
        const maininfo = document.querySelector(".main-info");
        if (maininfo) {
            maininfo.remove()
        }
        else {
            const currentelement = e.currentTarget;
            const getid = currentelement.dataset.id;
            fetch(`/devis/${getid}`)
                .then(res => res.json())
                .then(data => {
                    const date_devis = new Date(data.devis.date_devis);
                    const formatdate = date_devis.toLocaleDateString('en-GB');
                    const formatted_id = `D-${String(data.devis.id_devis).padStart(4,'0')}`;
                    console.log(data)
                    const productrows = data.produit.map(prod => {
                        return `
                    <div class="product-details">
                        <h5>${prod.description}</h5>
                        <h5>${prod.quantite}</h5>
                        <h5>${prod.prix}</h5>
                        <h5>${prod.total_ht}</h5>
                    </div>
                    `
                    }).join('');
                    const showdevis = `
                    <div class="main-info">
                        <div class="title-header">
                            <h4>Devis N° ${formatted_id}</h4>
                            <a data-id_download="${data.devis.id_devis}" id="devisdownload">Telecharger PDF</a>
                        </div>
                        <div class="first-header">
                            <h4>${data.devis.nom_client}</h4>
                            <h4>${data.devis.devis_description}</h4>
                            <h4>${formatdate}</h4>
                        </div>
                        <div class="info-container">
                            <div class="product-info">
                                <div class="product-headers">
                                    <h5>Description</h5>
                                    <h5>Quantite</h5>
                                    <h5>Prix Unitaire</h5>
                                    <h5>total_ht</h5>
                                </div>
                                ${productrows}
                            </div>
                            <div class="totalall">
                                <div>
                                    <h5>Total ht</h5>
                                    <h5>${data.devis.total_ht}</h5>
                                </div>
                                <div>
                                    <h5>Total tva</h5>
                                    <h5>${data.devis.total_tva}</h5>
                                </div>
                                <div id="totalttc">
                                    <h5>Total ttc</h5>
                                    <h5>${data.devis.total_ttc}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    currentelement.insertAdjacentHTML('afterend', showdevis);
                    }
                )
        }
    })
})