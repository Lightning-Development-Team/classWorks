// @Time : 2023/10/08 10:02
// @Author : 梁皓 / nano71.com
// @Email : 1742968988@qq.com
// @File : routerExtend.js
// @Software: IntelliJ IDEA
// class HashRouter {
//     constructor(routes) {
//         window.onhashchange = e => this.routeChanges(e)
//         this.routes = routes
//     }
//
//     async updateNplusLite() {
//         await nplusLite.componentsInitialize()
//         await nplusLite.elementLoopInitialize()
//     }
//
//     routeChanges(event) {
//         event.preventDefault()
//         const path = location.hash.replace("#", "")
//         if (this.routes.includes(path)) {
//             this.requestHTML(path)
//         }
//     }
//
//     requestHTML(path) {
//         const xhr = new XMLHttpRequest()
//         xhr.open("GET", path)
//         xhr.onload = req => {
//             const html = req.currentTarget.response
//             let template = document.createElement("html")
//             template.innerHTML = html
//             // console.log(template);
//             const body = template.$("body")
//             const originalHTML = $("html")
//             // console.log(body);
//             $("body").innerHTML = body.innerHTML
//
//             this.updateNplusLite()
//         }
//         xhr.send()
//     }
// }

function useRouterExtend() {
    // console.log("useRouterExtend");
    // nplusLite.router = new HashRouter([
    //     "/",
    //     "/pages/details.html",
    //     "/pages/register.html",
    //     "/pages/category.html"
    // ])
    $$("a").forEach(element => element.onclick = function (e) {
        e.preventDefault()
        if (this.href === location.href) {
            return false
        } else location.href = this.href
    })
}

console.log("路由拓展已引入");
