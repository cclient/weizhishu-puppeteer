async function test() {

    // let v1 = await require('./index').getValByAxios("世界杯");
    // console.log("axios", JSON.stringify(v1))

    let v2 = await require('./index').getValByPutpetter("世界杯");
    console.log("putpetter", v2)

}

if (!module.parent) {
    test();
}
