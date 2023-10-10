// @Time : 2023/9/13 11:34
// @Author : 梁皓 / nano71.com
// @Email : 1742968988@qq.com
// @File : defineCustomElement.js
// @Software: IntelliJ IDEA

console.log("Thank you use NPlus-lite!")
if (window.location.protocol === "file:") {
    window.location.href = "https://nano71.com/classWorks/20230913/index.html"
}

function $(selector) {
    return this.querySelector(selector)
}

function $$(selector) {
    return this.querySelectorAll(selector)
}

Element.prototype.$ = $
Document.prototype.$ = $
DocumentFragment.prototype.$ = $
window.$ = selector => document.$(selector)

Element.prototype.$$ = $$
Document.prototype.$$ = $$
DocumentFragment.prototype.$$ = $$
window.$$ = selector => document.$$(selector)

{
    let pathDot = ""
    if (window.location.pathname.includes("/pages/")) {
        pathDot = "."
    }
    function defineCustomElement(element, elementName) {
        return new Promise(resolve => {
            console.log(elementName);
            const xhr = new XMLHttpRequest();
            xhr.open('GET', pathDot + `./components/${elementName}.html`);
            xhr.onload = req => {
                let content = req.currentTarget.response
                let template = document.createElement("template");
                template.innerHTML = content
                template = template.content
                const beforeCreateScript = template.$("script[beforeCreate]")?.innerHTML
                const mountedScript = template.$("script[mounted]")?.innerHTML
                eval(beforeCreateScript);
                element.appendChild(template.cloneNode(true));
                eval(mountedScript);
                resolve()
            }
            xhr.send();
        })
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

    let customElements = document.$$("[custom]");

    (async function () {
        for (let customElement of customElements) {
            let tagName = customElement.tagName.toLowerCase()
            let elementNameCache = getCamelCase(tagName)
            createElement("link", {
                href: pathDot + `./stylesheet/${elementNameCache}.less`,
                rel: "stylesheet",
                type: "text/less"
            })
            await defineCustomElement(customElement, elementNameCache)
        }
        createElement("script", {src: pathDot + "./js/less@4.js"})
        createElement("script", {src: pathDot + "./js/inputExtend.js"})
        createElement("script", {src: pathDot + "./js/routerExtend.js"})
        createElement("script", {src: pathDot + "./js/forExtend.js", type: "module"})
        createElement("link", {
            href: pathDot + `./global.less`,
            rel: "stylesheet",
            type: "text/less"
        })
    })()
}
