const fs = require('fs');
const filePretest = 'out/scriptPreTest';
const fileScriptTest = 'out/scriptTest';
const fileRequestBody = 'out/requestBody.json';
const outputFolder = 'out';

let rawFile = fs.readFileSync('swagger-body.json');
let rawData = JSON.parse(rawFile);
let scriptTest = '';
let scriptPreTest = '';


Object.keys(rawData).forEach(e => generateData(e, rawData))

function generateData(target, raw, index) {
    const rawElement = raw[target];
    const isValidType = typeof rawElement == "object"
        && rawElement != null
        && rawElement != undefined
        && rawElement != NaN;

    if (isValidType) {
        Object.keys(rawElement).forEach(e => generateData(e, rawElement, target))
    } else {
        if (isNumeric(index)) {
            raw[target] = generateVariable(target + '_' + index);
            scriptPreTest += generatePreTest(target + '_' + index)
        } else {
            raw[target] = generateVariable(target);
            scriptPreTest += generatePreTest(target);
        }
    }

}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function generateTest(fieldName) {
    return `pm.test("kiểm tra ${fieldName} từ db với giá trị đã nhập", function () { pm.expect(responseData.${fieldName}).to.eql(pm.environment.get("${fieldName}")) }); \n \n`;
}

function generatePreTest(fieldName) {
    return `const ${fieldName} = "";
    pm.environment.set("${fieldName}", ${fieldName}); \n \n`;
}

function generateVariable(fieldName) {
    return `{{${fieldName}}}`;
}

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

fs.writeFile(fileScriptTest, createTestScript(scriptTest), err => {
    if (err) {
        console.error(err)
    }
    console.log("write to fileScriptTest done !!!!!")
})

fs.writeFile(filePretest, scriptPreTest, err => {
    if (err) {
        console.error(err)
    }
    console.log("write to filePretest done !!!!!")
})

fs.writeFile(fileRequestBody, JSON.stringify(rawData), err => {
    if (err) {
        console.error(err)
    }
    console.log("write to fileRequestBody done !!!!!")
})
