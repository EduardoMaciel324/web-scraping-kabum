const puppeteer = require('puppeteer');
const fs = require('fs');
let scrape = async () => {
    const browser = await puppeteer.launch({
        headless:false
    })
    const page = await browser.newPage()
    await page.goto('https://www.kabum.com.br', {waitUntil: 'networkidle2'}); // você coloca qual página deseja ir
    await page.waitForSelector('#form-busca > input'); // espera esses seletores, pois futuramente iremos utiliza-lo para colocar dados
    await page.waitForSelector('#bt-busca');
    await page.type('#form-busca > input.sprocura',process.argv[2]); // colocamos o dado pesquisado
    await page.click('#bt-busca'); // clica no botão de busca
    await page.waitForNavigation({waitUntil:'domcontentloaded'}) // espera carregar a página
    const result = await page.evaluate(() => {
        var divs = document.querySelectorAll('div#listagem-produtos > div >  div:nth-child(n+3):nth-child(-n+29)') // irei percorrer os dados
        var data = new Date();
        data.setHours(-1); // terminar de configurar as horas
        var produtos = [];
        divs.forEach( (x,index) => {
            let link = x.children[0].children[0].href;
            let nome = x.children[0].children[1].children[0].innerHTML;
            let preco = '';
            if(x.children[0].children[2].children[0].children[0].innerHTML.indexOf('De') !== -1) {
                 preco = x.children[0].children[2].children[0].children[3].innerHTML
            } else {
                 preco = x.children[0].children[2].children[0].children[0].innerHTML
            }
            produtos.push(
                [
                    link,
                    nome,
                    preco,
                    data.toUTCString()
                ]
            );
        });
        return produtos;
    })
    // browser.close()
    await browser.close();
    return result
};
scrape().then((value) => {
    console.log(value)
    fs.writeFile('mynewfile3.txt', value, function (err) {
        if (err) throw err;
        console.log('Saved!');
      }); 
})