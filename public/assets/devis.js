const selectalldevis = document.querySelectorAll(".devis-unit")
const selectdelete = document.querySelectorAll(".deletex")
const selectcontentcontainer = document.querySelector(".content-container")

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
                        <a href="">Telecharger PDF</a>
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