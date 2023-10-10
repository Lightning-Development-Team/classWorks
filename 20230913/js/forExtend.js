// @Time : 2023/9/13 14:12
// @Author : 梁皓 / nano71.com
// @Email : 1742968988@qq.com
// @File : forExtend.js
// @Software: IntelliJ IDEA

import dataList from "./data.js";

{
    let useForElements = document.querySelectorAll("[for]")
    for (let useForElement of useForElements) {
        loop(useForElement)
    }
    try {
        mounted()
    } catch (e) {

    }

    function clearAttribute(element, keys) {
        for (let key of keys) {
            element.removeAttribute(key)
        }
    }

    function loop(useForElement) {
        let markRegExp = /\$\{.+}/g
        let parentElement = useForElement.parentElement
        let dataListKey = useForElement.getAttribute("for")
        let start = parseInt(useForElement.getAttribute("start") ?? 0)
        let count = parseInt(useForElement.getAttribute("count") ?? 0)
        let addNumber = parseInt(useForElement.getAttribute("addNumber") ?? 0)
        let number = useForElement.getAttribute("number") !== null
        clearAttribute(useForElement, ["for", "start", "count", "addNumber", "number"])
        if (number) {
            let forCount = parseInt(dataListKey ?? 0)
            for (let i = start; i < forCount + start; i++) {
                let newElement = createTemporaryElement(useForElement)
                newElement.innerHTML = useForElement.outerHTML.replace(markRegExp, (i + addNumber).toString())
                parentElement.appendChild(newElement.firstElementChild)
            }
        } else {
            if (!dataListKey) {
                throw SyntaxError("启用了for, 但没有发现for的Key或number, 在" + useForElement.outerHTML)
            }
            let newElement = createTemporaryElement(useForElement)
            let child = useForElement.querySelector("[child]")
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
                let isString = typeof data === "string"
                isString || data.index || (data.index = index + addNumber)
                newElement.innerHTML = useForElement.outerHTML.replace(markRegExp, substring => customReplaceFn(isString, substring, data)
                )
                child && (newElement.querySelector("[child]").innerHTML = childElement)
                parentElement.appendChild(newElement.firstElementChild)
            }

            parentElement.removeChild(useForElement)
            if (child) {
                let children = parentElement.querySelectorAll(`[from=${dataListKey}][child]`)
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
                        let newElement = createTemporaryElement(element)
                        newElement.innerHTML = element.outerHTML.replace(markRegExp, substring => customReplaceFn(isString, substring, data))
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

        function createTemporaryElement(element) {
            return document.createElement(element.tagName.toLowerCase())
        }

        function customReplaceFn(isString, substring, data) {
            if (isString && substring.replace(/\$\{|}/g, "") === "item") {
                return data
            }
            return data[substring.replace(/\$\{|}/g, "")]
        }
    }

}
