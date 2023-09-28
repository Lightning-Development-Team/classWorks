// @Time : 2023/9/13 11:34
// @Author : 梁皓 / nano71.com
// @Email : 1742968988@qq.com
// @File : defineCustomElement.js
// @Software: IntelliJ IDEA
console.log("Thank you use NPlus-lite!")
if (window.location.protocol === "file:") {
    window.location.href = "https://nano71.com/classWorks/20230913/index.html"
}

let pathDot = ""
if (window.location.pathname.includes("/pages/")) {
    pathDot = "."
}
let template

function defineCustomElement(element, elementName) {
    console.log(elementName);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', pathDot + `./components/${elementName}.html`);
    xhr.onload = req => {
        let content = req.currentTarget.response
        template = document.createElement("template");
        template.innerHTML = content
        template = template.content
        eval(template.querySelector("script[beforeCreate]")?.innerHTML);
        element.appendChild(template.cloneNode(true));
        eval(template.querySelector("script[mounted]")?.innerHTML);
    }
    xhr.send();
}

function getCamelCase(str) {
    return str.replace(/-([a-z])/g, substring => {
        return substring.replace("-", "").toUpperCase()
    })
}


function createElement(tagName, attributes) {
    let element = document.createElement(tagName);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    document.getElementsByTagName("html")[0].appendChild(element)
}

let customElements = document.querySelectorAll("[custom]")

for (let customElement of customElements) {
    let tagName = customElement.tagName.toLowerCase()
    let elementNameCache = getCamelCase(tagName)
    createElement("link", {
        href: pathDot + `./stylesheet/${elementNameCache}.less`,
        rel: "stylesheet",
        type: "text/less"
    })
    defineCustomElement(customElement, elementNameCache)
}

createElement("script", {src: pathDot + "./js/less@4.js"})
createElement("script", {src: pathDot + "./js/inputExtend.js"})
createElement("script", {src: pathDot + "./js/for.js", type: "module"})
createElement("link", {
    href: pathDot + `./global.less`,
    rel: "stylesheet",
    type: "text/less"
})
