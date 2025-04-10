const selectallfacture = document.querySelectorAll(".devis-unit")
const selectdelete = document.querySelectorAll(".deletex")
const selectcontentcontainer = document.querySelector(".content-container")

if (selectcontentcontainer.children.length === 0) {
    const content =
        `
        <div class="empty-div">
            <img src="/images/invoice-receipt.svg" alt="">
            <h2>Aucune factures disponible.</h2>
            <h2>Les factures créés apparaîtront ici.</h2>
        </div>
        `;
    selectcontentcontainer.insertAdjacentHTML('afterbegin', content);
    selectcontentcontainer.classList.add("centerempty");
}

selectdelete.forEach(el => {
    el.addEventListener("click", (e) => {
        const getid = e.currentTarget.dataset.id
        fetch(`/factures/${getid}`, {method: "DELETE"})
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





selectallfacture.forEach(el => {
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
            fetch(`/factures/${getid}`)
                .then(res => res.json())
                .then(data => {
                    const date_facture = new Date(data.facture.date_facture);
                    const formatdate = date_facture.toLocaleDateString('en-GB');
                    const formatted_id = `F-${String(data.facture.id_facture).padStart(4,'0')}`;
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
                        const showfacture = `
                <div class="main-info">
                    <div class="title-header">
                        <h4>Facture N° ${formatted_id}</h4>
                        <a href="">Telecharger PDF</a>
                    </div>
                    <div class="first-header">
                        <h4>${data.facture.nom_client}</h4>
                        <h4>${data.facture.facture_description}</h4>
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
                                <h5>${data.facture.total_ht}</h5>
                            </div>
                            <div>
                                <h5>Total tva</h5>
                                <h5>${data.facture.total_tva}</h5>
                            </div>
                            <div id="totalttc">
                                <h5>Total ttc</h5>
                                <h5>${data.facture.total_ttc}</h5>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                        currentelement.insertAdjacentHTML('afterend', showfacture);
                    }
                )
        }

    })
})