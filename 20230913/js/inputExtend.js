{
    let radioAndMultipleList = $$("[radio],[multiple]")
    console.log(radioAndMultipleList);
    for (const parentElement of radioAndMultipleList) {
        let attributeNames = parentElement.getAttributeNames()
        parentElement.$$ = $$
        let options = parentElement.$$("[option]")
        for (let i in options) {
            options[i].onclick = function () {
                if (attributeNames.includes("multiple")) {
                    let select = parentElement.getAttribute("select") ?? []
                    if (typeof select === "string") {
                        select = select.split(",")
                    }
                    if (select.includes(i)) {
                        select.splice(select.indexOf(i), 1)
                        parentElement.$$("[option] .dot")[i].classList.remove("active")
                    } else {
                        select.push(i)
                        parentElement.$$("[option] .dot")[i].classList.add("active")
                    }
                    parentElement.setAttribute("select", select.join())
                } else if (attributeNames.includes("radio")) {
                    for (let elementNodeListOfElement of parentElement.$$("[option] .dot")) {
                        elementNodeListOfElement.classList.remove("active")
                    }

                    parentElement.setAttribute("select", i)
                    parentElement.$$("[option] .dot")[i].classList.add("active")
                }
            }
        }
    }
}
