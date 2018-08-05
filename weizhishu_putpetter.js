const puppeteer = require('puppeteer');


exports.getValByPutpetter = async(word, remoteWs) => {
    let browser = null;
    if (remoteWs) {
        //连接远程chrome实例
        browser = await puppeteer.connect({ browserWSEndpoint: remoteWs });
    } else {
        //本地启动chrome实例
        browser = await puppeteer.launch();
    }
    const page = await browser.newPage();
    //等5秒，如果没有获取到资源，返回空字符串
    let wait = new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve("");
        }, 5000);
    })
    let resource;
    page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1")
        //拦截真正需要的资源
    page.on('response', response => {
        if (response.url() === 'http://data.weibo.com/index/ajax/newindex/getchartdata') {
            resource = response.text();
        }
    });
    //打开首页
    await page.goto('http://data.weibo.com/index');
    //打开搜索页
    await page.goto('http://data.weibo.com/index/newindex?visit_type=search');
    const inputElement = await page.$('input[type=search]');
    //搜索索输入
    page.focus('input[type=search]')
    inputElement.focus()
    await inputElement.type(word)
        //智能提示出相关词,回车选择第一项,点击后开始刷新数据
    await inputElement.press('Enter', { delay: 100 });
    await inputElement.press('Space', { delay: 1000 });
    await page.screenshot({ path: `${word}.png` });
    //防泄露，释放资源
    let jsonData = await Promise.race([wait, resource])
    await page.close();
    // console.log(typeof jsonData)
    return JSON.parse(jsonData).data
};