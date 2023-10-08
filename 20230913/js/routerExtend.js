// @Time : 2023/10/08 10:02
// @Author : 梁皓 / nano71.com
// @Email : 1742968988@qq.com
// @File : routerExtend.js
// @Software: IntelliJ IDEA

$$("a").forEach(element => element.onclick = function (e) {
    e.preventDefault()
    if (this.href === location.href)
        return false
    else
        location.href = this.href
})
