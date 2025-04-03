const selectclose = document.querySelector(".new_text button")
const selectplusrow = document.querySelector(".plusbutton")
const selectrowscontainer = document.querySelector(".rows-container")
const selectsidebar = document.querySelector(".sidebar")
const selectsubmit = document.querySelector("#submit")
const selectstep2 = document.querySelector(".step2")
let rows = 1;

selectclose.addEventListener("click", (e) => {
    window.location.href = '/devis';
})

//add total
selectstep2.addEventListener("input", (e) => {
    const row = e.target.name.match(/\d+$/)[0];
    const quantite = document.querySelector(`[name="quantite${row}"]`).value;
    const prix = document.querySelector(`[name="prix${row}"]`).value;
    const tva = document.querySelector(`[name="tva${row}"]`).value;
    const total = document.querySelector(`[name="total${row}"]`);
    const alltotal = document.querySelectorAll(`[name^="total"]`);
    const allquantite = document.querySelectorAll(`[name^="quantite"]`);
    const allprix = document.querySelectorAll(`[name^="prix"]`);
    const selecttotalht = document.querySelector(`[name="totalht"]`);
    const selecttva = document.querySelector(`[name="tvatotal"]`);
    const selectttch5 = document.querySelector(`[name="totalttc"]`)
    let totalvalue = 0 ;
    let totalht = 0;
    let prixlist = [];
    let quantitelist = [];
    total.value = calculatetotal(quantite, tva, prix);
    if (total.value) {
        //insert total ttc
        alltotal.forEach(el => {
            totalvalue += parseFloat(el.value) || 0;
        })
        selectttch5.textContent = totalvalue.toFixed(2);
        // insert tva total
        allquantite.forEach(el => {
            quantitelist.push(parseFloat(el.value))
        })
        allprix.forEach(el => {
            prixlist.push(parseFloat(el.value))
        })
        for (let i = 0; i <= quantitelist.length; i++) {
            totalht += quantitelist[i] * prixlist[i] || 0;
        }
        selecttotalht.textContent = totalht.toFixed(2);
        selecttva.textContent = (totalvalue - totalht).toFixed(2);
    }
})


function calculatetotal(quantite, tva, prix) {
    const total = (parseFloat(quantite) * parseFloat(prix)) * (1 + (parseFloat(tva) / 100));
    const totalformat = total.toFixed(2);
    return totalformat;
}
// add a row in products
selectplusrow.addEventListener("click", (e) => {
    ++rows;
    let newrow = `
    <div class="rows-container" id="row${rows}">
        <div class="detail-container">
            <label for="description${rows}">Description</label>
            <input type="text" name="description${rows}" required>
        </div>
        <div class="detail-container">
            <label for="quantite${rows}">Quantité</label>
            <input type="number" min="0" name="quantite${rows}" required>
        </div>
        <div class="detail-container">
            <label for="prix${rows}">Prix</label>
            <input type="number" min="0" name="prix${rows}" required>
        </div>
        <div class="detail-container">
            <label for="tva${rows}">TVA</label>
            <input type="number" min="0" max="99" name="tva${rows}" required>
        </div>
        <div class="detail-container">
            <label for="total${rows}">Total</label>
            <input type="number" name="total${rows}" disabled>
        </div>
        <button type="button" class="closebutton row${rows}">
            <img src="/images/close_black.svg" alt="close">
        </button>
    </div>
    `
    selectplusrow.insertAdjacentHTML("beforebegin", newrow);
    //remove a row
    const selectclosebutton = document.querySelector(`.closebutton.row${rows}`)
    selectclosebutton.addEventListener("click", (e) => {
        const selectnewrow = document.querySelector("#row" + rows);
        selectnewrow.remove();
        --rows;
    })
})

selectsubmit.addEventListener("click", (e) => {
    const form = e.target.form;
    const formData = new FormData(form);
    const data = {};
    //check required inputs
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    //put data in native js object
    formData.forEach((value, key) => {
        data[key] = value;
    });
    console.log(data)
    fetch("/devis/new_devis", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then (res => {
            if (res.ok) {
                window.location.href = '/devis'
            }
            else {
                console.log('something went wrong!')
            }
        })
})