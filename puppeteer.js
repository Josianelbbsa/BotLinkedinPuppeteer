const puppeteer    = require('puppeteer');
const credentials  = require('./credentials.json');
let navPage        = 1;
let itensClickable = 0;


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page    = await browser.newPage();
    await page.goto('https://www.linkedin.com');

    await makeAuth(page);

    await page.waitForNavigation();

    console.log("Starting Linkedin Bot!");

    await navigatePages(page, navPage)
    if (itensClickable > 0) {
        console.log(`Conected successfully with ${itensClickable} people!`);
        
    } else{console.log("I couldn't connect with anyone!");}
    console.log("Shutting down the robot!");

    await browser.close();
})();

async function navigatePages(page, navigationPage){
    const searchTerm = encodeURI('recursos humanos ti');
    await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${searchTerm}&origin=FACETED_SEARCH&sid=Feu&page=${navigationPage}`)

    await sleep(2000);    
    
    const resultsPage   = await page.$$('.reusable-search__result-container')
    const whereClicking = await page.$$('.reusable-search__result-container .entity-result .entity-result__item .entity-result__actions:not(.entity-result__actions--empty)');

    console.log("Found " + resultsPage.length + " results for term " + searchTerm + " on page" + navPage);
    console.log("Of the results found, " + whereClicking.length + " are clickable (have a 'connect' button)");

    itensClickable += whereClicking.length;


    for ( let cont   = 0; cont < resultsPage.length; cont++){
        const result = resultsPage[cont];
        const block  = await result.$('.entity-result__content.entity-result__divider.pt3.pb3.t-12.t-black--light > div.mb1 > div.t-roman.t-sans > div > span.entity-result__title-line.entity-result__title-line--2-lines > span > a > span > span:nth-child(1)');

        if(!block) continue;

        let name = (await block.getProperty('innerHTML')).toString();

        const cleanName = name ? name.split("JSHandle:")[1].toString().replace(/<!---->/g, '').replace(/[^a-z0-9 ]/gi, '') : "erro";

        const connectar = await result.$('.entity-result__actions.entity-result__divider > div > button');
        if(!connectar){
            itensClickable--;
            continue;
        }else{
            const sendMessage = await result.$('div.entry-point button');
            const follow = await result.$('[data-test-reusable-search-primary-action]');
            if(follow){
                continue;

            }else if (sendMessage){
                continue;
                
            }else{

               await connectar.click('.entity-resultactions.entity-resultdivider > div > button');
           
      
        await sleep(2000);

        const addNote = await page.$('[aria-label="Adicionar nota"]');
        
        await addNote.click('[aria-label="Adicionar nota"]');
        await sleep (1000);
        await page.keyboard.type('Olá, me chamo Josiane e faço parte do Devplay, onde estou aprendendo a desenvolver sistemas. Esta mensagem foi enviada por um robô que eu mesma criei para me auxiliar no contato com recrutadores e demonstrar um pouco do que aprendi! Veja mais sobre mim no meu GitHub: https://github.com/Josianelbbsa');

        const sendNote = await page.$('[aria-label="Enviar agora"]');

        await sendNote.click('[aria-label="Enviar agora"]');

        await sleep(5000);
    }
    }
        
    }
        navPage++

    if (navPage <= 2) {
        await navigatePages(page, navPage)
        }   
    }


async function makeAuth(page){
    
    await page.waitForSelector('input[id="session_key"]');
    await page.waitForSelector('input[id="session_password"]');
    await page.waitForSelector('.sign-in-form__submit-button');

    const inputEmail = await page.$('input[id="session_key"]');    

    if (!inputEmail) {
        throw new Error('Email not found');
    }
    await page.focus('input[id="session_key"]');
    await page.keyboard.type(credentials.user);

    const inputPassword = await page.$('input[id="session_password"]');

    if (!inputPassword) {
        throw new Error('Password not found');
    }
    await page.focus('input[id="session_password"]');
    await page.keyboard.type(credentials.senha);    


    await page.click('.sign-in-form__submit-button');
    
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
