const selectclose = document.querySelector(".new_text button")
const selectplusrow = document.querySelector(".plusbutton")
const selectsubmit = document.querySelector("#submit")
const selectstep2 = document.querySelector(".step2")
let rows = 1;
let totalttc;
let totalht;
let totaltva;
let totalrow;
const tva = 0.20;

selectclose.addEventListener("click", (e) => {
    window.location.href = '/factures';
})

//add total
selectstep2.addEventListener("input", (e) => {
    const row = e.target.name.match(/\d+$/)[0];
    const quantite = document.querySelector(`[name="quantite${row}"]`).value;
    const prix = document.querySelector(`[name="prix${row}"]`).value;
    const total = document.querySelector(`[name="total${row}"]`);
    const alltotal = document.querySelectorAll(`[name^="total"]`);
    const selecttotalht = document.querySelector(`[name="total_ht"]`);
    const selecttotaltva = document.querySelector(`[name="total_tva"]`);
    const selecttotalttc = document.querySelector(`[name="total_ttc"]`);
    totalttc = 0;
    totalht = 0;
    totaltva = 0;

    totalrow = calculatetotal(quantite, prix)
    total.value = totalrow.toFixed(2);
    if (total.value) {
        //insert total ht
        alltotal.forEach(el => {
            totalht += parseFloat(el.value) || 0;
        })
        selecttotalht.textContent = totalht.toFixed(2);
        // insert total tva
        totaltva = parseFloat((totalht * tva).toFixed(2));
        selecttotaltva.textContent = totaltva.toFixed(2);
        // insert total ttc
        totalttc = parseFloat((totaltva + totalht).toFixed(2));
        selecttotalttc.textContent = totalttc.toFixed(2);
    }
})

function calculatetotal(quantite, prix) {
    const total = (parseFloat(quantite) * parseFloat(prix));
    return parseFloat(total.toFixed(2));
}
// add a row in products
selectplusrow.addEventListener("click", (e) => {
    ++rows;
    let newrow = `
    <div class="rows-container" id="row${rows}">
        <div class="detail-container">
            <label for="description${rows}"></label>
            <input type="text" name="description${rows}" required>
        </div>
        <div class="detail-container">
            <label for="quantite${rows}"></label>
            <input type="number" min="0" name="quantite${rows}" required>
        </div>
        <div class="detail-container">
            <label for="prix${rows}"></label>
            <input type="number" min="0" name="prix${rows}" required>
        </div>
        <div class="detail-container">
            <label for="total${rows}"></label>
            <input type="number" name="total${rows}" step="0.01">
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
    //insert total text into data
    data.total_ht = totalht;
    data.total_tva = totaltva;
    data.total_ttc = totalttc;
    console.log(data);
    fetch("/factures/new_factures", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then (res => {
            if (res.ok) {
                window.location.href = '/factures'
            }
            else {
                console.log('something went wrong!')
            }
        })
})