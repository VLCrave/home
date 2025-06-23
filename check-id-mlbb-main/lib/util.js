function parseObject(str) {
    let fil = str.split("\n");
    let data = {};
    fil.forEach(element => {
        let [key, value] = element.split(":");
        data[key.trim().toLowerCase().replace(/ /gi, "-")] = value.trim()
    });
    return data;
}

exports.parseObject = parseObject