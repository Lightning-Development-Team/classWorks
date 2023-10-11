import dataList from "./data.js";

/**
 * nplus-lite是一个小巧的模板解释器
 */
class NplusLite {

    /**
     * nplus-lite是一个小巧的模板解释器
     */
    constructor() {
        this.pathDot = ""
        window.location.pathname.includes("/pages/") && (this.pathDot = ".")

        function $(selector) {
            return this.querySelector(selector)
        }

        function $$(selector) {
            return this.querySelectorAll(selector)
        }

        Element.prototype.$ = $
        Document.prototype.$ = $
        DocumentFragment.prototype.$ = $
        Window.prototype.$ = selector => document.$(selector)

        Element.prototype.$$ = $$
        Document.prototype.$$ = $$
        DocumentFragment.prototype.$$ = $$
        Window.prototype.$$ = selector => document.$$(selector)
        this.#initialization()
    }

    /**
     * 创建一个html元素
     * @param {string} tagName
     * @param {Object<string, string>} attributes
     */
    createElement(tagName, attributes) {
        let element = document.createElement(tagName);
        for (let key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        $("html").appendChild(element)
    }

    /**
     * 等待脚本加载完毕
     * @param {string[]} querySelectors
     * @returns {Promise<void>}
     */
    async #waitScriptLoad(querySelectors) {
        async function wait(querySelector) {
            return new Promise(resolve => {
                $("html").$(querySelector).onload = function () {
                    resolve()
                }
            })
        }

        for (let querySelector of querySelectors) {
            await wait(querySelector)
        }
        // await Promise.all([
        //     wait("script#routerExtend"), wait("script#inputExtend")
        // ])
        return Promise.resolve()
    }

    /**
     * html标签名的格式转大小写驼峰
     * @param {string} name
     * @type string
     */
    getCamelCase(name) {
        return name.replace(/-([a-z])/g, substring => {
            return substring.replace("-", "").toUpperCase()
        })
    }

    /**
     * 定义组件
     * @param {Element|Node} element
     * @param {string} elementName
     */
    #defineCustomElement(element, elementName) {
        return new Promise(resolve => {
            // console.log(elementName);
            const xhr = new XMLHttpRequest();
            xhr.open("GET", this.pathDot + `./components/${elementName}.html`);
            xhr.onload = req => {
                let content = req.currentTarget.response
                let template = document.createElement("template")
                template.innerHTML = content
                const beforeCreateScript = template.content.$("script[beforeCreate]")?.innerHTML
                const mountedScript = template.content.$("script[mounted]")?.innerHTML
                template.innerHTML = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                template = template.content
                this.draft = template
                eval(beforeCreateScript);
                element.appendChild(template.cloneNode(true));
                eval(mountedScript);
                resolve()
            }
            xhr.send();
        })
    }

    /**
     * 清除元素的属性
     * @param {Element} element
     * @param {string[]} keys
     */
    clearAttribute(element, keys) {
        for (let key of keys) {
            element.removeAttribute(key)
        }
    }

    /**
     * 从这个模板进行复制
     * @param {Element} element
     * @returns {HTMLElement}
     */
    #createTemporaryElement(element) {
        return document.createElement(element.tagName.toLowerCase())
    }

    /**
     * 自定义的html字符串替换
     * @param {boolean} isString
     * @param {string} html
     * @param {*} data
     */
    #customReplaceFn(isString, html, data) {
        if (isString && html.replace(/\$\{|}/g, "") === "item") {
            return data
        }
        return data[html.replace(/\$\{|}/g, "")]
    }

    /**
     * 进行填充模板和数据写入html
     * @param {Element|Node} useForElement
     */
    async #fillTemplate(useForElement) {
        let markRegExp = /\${(.+?)}/g
        let parentElement = useForElement.parentElement
        let dataListKey = useForElement.getAttribute("for")
        let start = parseInt(useForElement.getAttribute("start") ?? 0)
        let count = parseInt(useForElement.getAttribute("count") ?? 0)
        let addNumber = parseInt(useForElement.getAttribute("addNumber") ?? 0)
        let number = useForElement.getAttribute("number") !== null
        this.clearAttribute(useForElement, ["for", "start", "count", "addNumber", "number"])
        if (number) {
            let forCount = parseInt(dataListKey ?? 0)
            for (let i = start; i < forCount + start; i++) {
                let newElement = this.#createTemporaryElement(useForElement)
                newElement.innerHTML = useForElement.outerHTML.replace(markRegExp, (i + addNumber).toString())
                parentElement.appendChild(newElement.firstElementChild)
            }
        } else {
            if (!dataListKey) {
                throw SyntaxError("启用了for, 但没有发现for的Key或number, 在" + useForElement.outerHTML)
            }
            let newElement = this.#createTemporaryElement(useForElement)
            let child = useForElement.$("[child]")
            let childElement = child?.innerHTML

            for (let i in dataList[dataListKey]) {
                let index = parseInt(i)
                let data = dataList[dataListKey][i]
                if (start && index < start) {
                    continue
                }
                if (count && (count + start + 1 < index)) {
                    break
                }
                // 基本类型
                let isString = typeof data === "string"

                // 无声明index
                isString || data.index || (data.index = index + addNumber)
                newElement.innerHTML = useForElement.outerHTML.replace(markRegExp, htmlString => this.#customReplaceFn(isString, htmlString, data))
                child && (newElement.$("[child]").innerHTML = childElement)
                try {
                    parentElement.appendChild(newElement.firstElementChild)
                } catch (e) {
                    console.log(e);
                    console.log(useForElement);
                }
            }

            parentElement.removeChild(useForElement)
            if (child) {
                let children = parentElement.$$(`[from=${dataListKey}][child]`)
                if (!dataListKey.length) {
                    throw SyntaxError("启用了child, 但没有发现from, 在" + child.outerHTML)
                }
                let i = 0
                for (const element of children) {
                    let realIndex = element.getAttribute("key") ?? i
                    let dataListChildKey = element.getAttribute("for")
                    if (!dataListChildKey)
                        throw SyntaxError("启用了child, 但没有发现for的Key, 在" + element.outerHTML)
                    let dataListCache = dataList[dataListKey][realIndex][dataListChildKey]
                    if (!dataListCache)
                        throw SyntaxError("启用了child, 但for的Key对应的数据为undefined, 在" + element.outerHTML)

                    for (const data of dataListCache) {
                        let isString = typeof data === "string"
                        let newElement = this.#createTemporaryElement(element)
                        newElement.innerHTML = element.outerHTML.replace(markRegExp, substring => this.#customReplaceFn(isString, substring, data))
                        newElement = newElement.firstElementChild
                        newElement.removeAttribute("child")
                        element.parentElement.appendChild(newElement)
                    }
                    element.parentElement.removeChild(element)
                    i++
                }
            }
            return
        }
        parentElement.removeChild(useForElement)
        return Promise.resolve()
    }

    /**
     * nplus-lite的初始化
     * @returns {Promise<Awaited<string>>}
     */
    async #initialization() {
        // window.nplusLitePage = {
        //     data: null,
        //     mounted: null
        // }
        const pathDot = this.pathDot
        await this.componentsInitialize()
        await this.elementLoopInitialize()
        nplusLite.createElement("link", {
            href: pathDot + `./global.less`,
            rel: "stylesheet",
            type: "text/less"
        })
        nplusLite.createElement("script", {id: "inputExtend", src: pathDot + "./js/inputExtend.js"})
        nplusLite.createElement("script", {id: "routerExtend", src: pathDot + "./js/routerExtend.js"})
        nplusLite.createElement("script", {src: pathDot + "./js/less@4.js"})
        await this.#waitScriptLoad(["script#inputExtend", "script#routerExtend"])
        this.#pageDataBind()
        console.log("%cThanks for using nplus-lite!", "background:#0096ff;color:white;padding:10px");
    }

    /**
     * 页面数据绑定和执行页面的mounted函数
     */
    #pageDataBind() {
        let bindData = nplusLitePage.data

        if (Object.keys(bindData || {}).length) {
            /**
             * 包装对象,捕获器
             * @type {{any}}
             */
            nplusLitePage.data = new Proxy(bindData, {
                get(target, key) {
                    return target[key];
                },
                set(target, key, value) {
                    target[key] = value;
                    $$(`[bind^='${key}:']`).forEach(element => {
                        element[element.getAttribute("bind").split(":")[1]] = value
                    })
                    console.log(value);
                    return true;
                },
            });
        } else {
            console.log("%c页面没有定义data(), 它是可选的", "background:#0096ff;color:white;padding:10px");
        }

        if (nplusLitePage.mounted) {
            nplusLitePage.mounted()
        } else {
            console.log("%c页面没有定义mounted(), 它是可选的", "background:#0096ff;color:white;padding:10px");
        }
    }

    /**
     *
     * @param {function(any)|undefined} callBack
     * @param {string|undefined} bindName
     * @returns {{}|null}
     */
    bindData({
                 callBack,
                 bindName
             }) {
        let object = {}
        let value = null
        Object.defineProperties(object, {
            value: {
                get() {
                    return value
                },
                set(newValue) {
                    value = newValue
                    if (bindName) {
                        $$(`[bind^='${bindName}:']`).forEach(element => {
                            element[element.getAttribute("bind").split(":")[1]] = newValue
                        })
                    }
                    callBack && callBack(newValue)
                }
            }
        })
        return object
    }

    /**
     * 组件模块的初始化
     * @returns {Promise<void>}
     */
    async componentsInitialize() {
        for (let customElement of $$("[custom]")) {
            let tagName = customElement.tagName.toLowerCase()
            let elementNameCache = this.getCamelCase(tagName)
            this.createElement("link", {
                href: this.pathDot + `./stylesheet/${elementNameCache}.less`,
                rel: "stylesheet",
                type: "text/less"
            })
            await this.#defineCustomElement(customElement, elementNameCache)
        }
    }

    /**
     * 填充模板和数据遍历
     */
    async elementLoopInitialize() {
        let useForElements = $$("[for]")
        for (let useForElement of useForElements) {
            await this.#fillTemplate(useForElement)
        }
    }

    /**
     * 移除元素的某个类名
     * @param {Element} element
     * @param {string} className
     */
    remoClassName(element, className) {
        element.classList.remove(className)
    }

    /**
     * @param {NodeListOf} elements
     * @param {string} className
     */
    remoClassNameAll(elements, className) {
        for (let childNode of elements) {
            this.remoClassName(childNode, className)
        }
    }
}

window.nplusLite = new NplusLite()



