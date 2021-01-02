fetch("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json")
.then(response => response.json())
.then(dati => {
    //ordino i dati
    let sorted = dati.reverse()
    //ultima data caricata
    let lastUpdated = sorted[0].data
    console.log(sorted);
    //formattazione data dell'ultimo aggiornamento
    let lastUpdatedFormatted = lastUpdated.split("T")[0].split("-").reverse().join("/")
    document.getElementById("data").innerHTML = `Dati aggiornati al: ${lastUpdatedFormatted}` 
    //regione con più casi
    let lastUpdatedData = sorted.filter(el => el.data == lastUpdated).sort((a,b) => b.nuovi_positivi - a.nuovi_positivi)

    //totale casi
    let totalCases = lastUpdatedData.map(el=>el.totale_casi).reduce((t,n) => t+n)
    document.getElementById("totalCases").innerHTML = totalCases
    //totale guariti
    let totalRecovered = lastUpdatedData.map(el=>el.dimessi_guariti).reduce((t,n)=>t+n)
    document.getElementById("totalRecovered").innerHTML = totalRecovered
    //morti totali
    let totalDeath = lastUpdatedData.map(el=>el.deceduti).reduce((t,n)=>t+n)
    document.getElementById("totalDeath").innerHTML = totalDeath
    //tatale positivi
    let totalPositive = lastUpdatedData.map(el=>el.deceduti).reduce((t,n)=>t+n)
    document.getElementById("totalPositive").innerHTML = totalPositive

    //card regioni positivi oggi
    let cardWrapper = document.getElementById("cardWrapper")

    lastUpdatedData.forEach(el => {
        let div =  document.createElement('div')
        div.classList.add('col-12','col-md-6','my-4')
        div.innerHTML =
        `
            <div class="card-custom p-3 pb-0 h-100 rounded-3" data-region="${el.denominazione_regione}">
                <p>${el.denominazione_regione}</p>
                <p class="text-end fw-bold fs-4 mb-0">${el.nuovi_positivi}</p>
            </div>
        `  
        cardWrapper.appendChild(div)
        
    });

    console.log(totalCases);

    let modal = document.querySelector('.modal-custom')
    let modalContent = document.querySelector('.modal-custom-content')

   //apertura modale
    document.querySelectorAll('[data-region]').forEach(el=>{
        el.addEventListener('click', () => {
            let region = el.dataset.region
            modal.classList.add('active')

            let dataAboutRegion = lastUpdatedData.filter(el => el.denominazione_regione == region)[0]
            console.log(dataAboutRegion);

            modalContent.innerHTML = 
            `
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <p class="fs-4">${dataAboutRegion.denominazione_regione}</p>
                        </div>
                        <div class="col-12">
                            <p class="fs-3"><span class="fw-bold">Totale casi:</span> ${dataAboutRegion.totale_casi}</p>
                            <p>Nuovi positivi: ${dataAboutRegion.nuovi_positivi}</p>
                            <p>Deceduti: ${dataAboutRegion.deceduti}</p>
                            <p>Guariti: ${dataAboutRegion.dimessi_guariti}</p>
                            <p>Ricoverati con sintomi: ${dataAboutRegion.ricoverati_con_sintomi}</p>
                            <p>Isolamento domiciliare: ${dataAboutRegion.isolamento_domiciliare}</p>
                        </div>
                    </div>
                </div>
            `
        })
    })

    window.addEventListener('click', function(e){
        if(e.target == modal){
            modal.classList.remove('active')
        }
    })
})