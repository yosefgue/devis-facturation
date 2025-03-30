const selectclose = document.querySelector(".new_text button")
const selectplusrow = document.querySelector(".plusbutton")
const selectrowscontainer = document.querySelector(".rows-container")
const selectsidebar = document.querySelector(".sidebar")
const selectsubmit = document.querySelector("#submit")
let rows = 1;

selectclose.addEventListener("click", (e) => {
    window.history.back();
})

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
        <button type="button" id="closebutton">
            <img src="/images/close_black.svg" alt="close">
        </button>
    </div>
    `
    selectrowscontainer.insertAdjacentHTML("afterend", newrow);
    //remove a row
    const selectclosebutton = document.querySelector("#closebutton")
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
})