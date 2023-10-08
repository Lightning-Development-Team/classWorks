$$("a").forEach(element => element.onclick = function (e) {
    e.preventDefault()
    if (this.href === location.href)
        return false
    else
        location.href = this.href
})
