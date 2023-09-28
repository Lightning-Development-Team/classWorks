let radioAndMultipleList = document.querySelectorAll("[radio],[multiple]")
console.log(radioAndMultipleList);
for (let parentElement of radioAndMultipleList) {
    let attributeNames = parentElement.getAttributeNames()
    let options = parentElement.querySelectorAll("[option]")
    for (let i in options) {
        options[i].onclick = function () {
            if (attributeNames.includes("multiple")) {
                let select = parentElement.getAttribute("select") ?? []
                if (typeof select === "string") {
                    select = select.split(",")
                }
                if (select.includes(i)) {
                    select.splice(select.indexOf(i), 1)
                    parentElement.querySelectorAll("[option] .dot")[i].classList.remove("active")
                } else {
                    select.push(i)
                    parentElement.querySelectorAll("[option] .dot")[i].classList.add("active")
                }
                parentElement.setAttribute("select", select.join())
            } else if (attributeNames.includes("radio")) {
                for (let elementNodeListOfElement of parentElement.querySelectorAll("[option] .dot")) {
                    elementNodeListOfElement.classList.remove("active")
                }

                parentElement.setAttribute("select", i)
                parentElement.querySelectorAll("[option] .dot")[i].classList.add("active")
            }
        }
    }
}
