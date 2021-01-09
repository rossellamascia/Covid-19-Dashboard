//calcolo anno corrente
let getYear = new Date().getFullYear()
document.getElementById('year').innerHTML = getYear

fetch("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json")
    .then(response => response.json())
    .then(dati => {


        let modalRegion = document.querySelector('#region')
        let modalTrend = document.querySelector('#trend')
        let modalContentRegion = document.querySelector('#ModalContentRegion')
        let modalContentTrend = document.querySelector('#ModalContentTrend')

        //ordino i dati
        let sorted = dati.reverse()
        //ultima data caricata
        let lastUpdated = sorted[0].data
        console.log(sorted);

        //formattazione data dell'ultimo aggiornamento
        let lastUpdatedFormatted = lastUpdated.split("T")[0].split("-").reverse().join("/")
        let lastUpdatedFormattedHour = lastUpdated.split("T")[1]
        document.getElementById("data").innerHTML = `Dati aggiornati al: ${lastUpdatedFormatted}`

        //regione con più casi
        let lastUpdatedData = sorted.filter(el => el.data == lastUpdated).sort((a, b) => b.nuovi_positivi - a.nuovi_positivi)

        //totale casi
        let totalCases = lastUpdatedData.map(el => el.totale_casi).reduce((t, n) => t + n)
        document.getElementById("totalCases").innerHTML = totalCases

        //totale guariti
        let totalRecovered = lastUpdatedData.map(el => el.dimessi_guariti).reduce((t, n) => t + n)
        document.getElementById("totalRecovered").innerHTML = totalRecovered
        //morti totali
        let totalDeath = lastUpdatedData.map(el => el.deceduti).reduce((t, n) => t + n)
        document.getElementById("totalDeath").innerHTML = totalDeath
        //totale positivi
        let totalPositive = lastUpdatedData.map(el => el.nuovi_positivi).reduce((t, n) => t + n)
        document.getElementById("totalPositive").innerHTML = totalPositive

        let days = Array.from(new Set(sorted.map(el => el.data))).reverse()

        document.querySelectorAll('[data-trend]').forEach(el => {
            el.addEventListener('click', () => {
                //formatto la data
                let formatDays = days.map(el => el.toString().split("T")[0].split("-").reverse().join("/"))
                //prendo l'attributo data-region
                let set = el.dataset.trend
           
                //casi per ogni giorno e le data
                let totalsForDays = days.map(el => [el, sorted.filter(i => i.data == el).map(e => e[set]).reduce((t, n) => t + n)])
               
                //let maxData = Math.max(...totalsForDays.map(el => el[1]))

                modalTrend.classList.add('active')
                modalContentTrend.innerHTML =
                    `
                        <div class="modal-custom-header">
                                <h3 class="fs-3">${set.replace(/_/g, " ").toUpperCase()}</h3> <span class="close" id="closeTrend">&times;</span>
                        </div>
                        <div class="modal-custom-body">
                            <div class="row">
                                <div class="col-12">
                                    <canvas id="totalTrend"></canvas>
                                </div>
                            </div>
                        </div>
                    `

                let setColor = (set)=>{
                    if(set == "totale_casi")
                    { 
                       return "#fe744f"
                    } else if (set == "dimessi_guariti"){
                        return "#198754"
                    } else if (set == "deceduti"){
                        return "#dc3445"
                    } else if (set == "totale_positivi"){
                        return "#ffc107"
                    }
                }
                
                var ctx = document.getElementById('totalTrend').getContext('2d');
                var chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'line',

                    // The data for our dataset
                    data: {
                        labels: formatDays,
                        datasets: [{
                            label: set.replace(/_/g, " ").toUpperCase(),
                            backgroundColor: setColor(set),
                            borderColor: setColor(set),
                            data: totalsForDays.map(el => el[1])
                        }]
                    },

                    // Configuration options go here
                    options: {}
                });


                // let totalTrend = document.getElementById('myChart')
                // totalsForDays.forEach(el => {
                //     let col = document.createElement('div')
                //     col.classList.add('d-inline-block', 'pin-new')
                //     col.style.height = `${70 * el[1] / maxData}%`
                //     totalTrend.appendChild(col)
                // })
                //chiusura per mobile
                let modalCloseTrend = document.querySelector('#closeTrend')
                modalCloseTrend.addEventListener('click', () => {
                    modalTrend.classList.remove('active')

                })
                //chiusura click fuori
                window.addEventListener('click', function (e) {
                    if (e.target == modalTrend) {
                        modalTrend.classList.remove('active')
                    }
                })
            })
        })


        //card regioni positivi oggi
        let cardWrapper = document.getElementById("cardWrapper")

        lastUpdatedData.forEach(el => {
            let div = document.createElement('div')
            div.classList.add('col-12', 'col-md-3', 'my-4')
            div.innerHTML =
                `
                    <div class="card-custom h-100 rounded-3 d-flex flex-column" data-region="${el.denominazione_regione}">
                        <p class="mb-0 ms-3 mt-3">${el.denominazione_regione}</p>
                        <p class="fw-bold fs-4 mb-0 ms-3">${el.nuovi_positivi}</p>
                        <hr class="text-main">
                        <p class="text-main ms-3">scopri di più</p>
                    </div>
                `
            cardWrapper.appendChild(div)

        });




        //apertura modale
        document.querySelectorAll('[data-region]').forEach(el => {
            el.addEventListener('click', () => {
                let region = el.dataset.region
                modalRegion.classList.add('active')

                let dataAboutRegion = lastUpdatedData.filter(el => el.denominazione_regione == region)[0]

                modalContentRegion.innerHTML =
                    `
                        <div class="modal-custom-header">
                            <h3 class="fs-3">${dataAboutRegion.denominazione_regione}</h3> <span class="close" id="close">&times;</span>
                        </div>
                        <div class="modal-custom-body">
                            <div class="row">
                                <div class="col-12 col-md-3 mb-4">
                                    <div class="card-custom rounded-3 d-flex flex-column h-100 bg-accent text-white" data-trend="totale_casi">
                                        <p class="ms-3 fs-4 mt-3 fw-light mb-0">Casi totali</p>
                                        <p class="fs-3 ms-3 pe-3 text-white fw-bolder">${dataAboutRegion.totale_casi}</p>
                                    </div>
                                </div>
                                <div class="col-12 col-md-3 mb-4">
                                    <div class="card-custom rounded-3 d-flex flex-column h-100 bg-success text-white"
                                        data-trend="dimessi_guariti">
                                        <p class="ms-3 fs-4 mt-3 fw-light mb-0">Guariti totali</p>
                                        <p class="fs-3 ms-3 pe-3 text-white fw-bolder">${dataAboutRegion.dimessi_guariti}</p>
                        
                                    </div>
                                </div>
                                <div class="col-12 col-md-3 mb-4">
                                    <div class="card-custom rounded-3 d-flex flex-column h-100 bg-danger text-white" data-trend="deceduti">
                                        <p class="ms-3 fs-4 mt-3 fw-light mb-0">Morti totali</p>
                                        <p class="fs-3 ms-3 pe-3 text-white fw-bolder">${dataAboutRegion.deceduti}</p>
                        
                                    </div>
                                </div>
                                <div class="col-12 col-md-3 mb-4">
                                    <div class="card-custom rounded-3 d-flex flex-column h-100 bg-warning text-white"
                                        data-trend="totale_positivi">
                                        <p class="ms-3 fs-4 mt-3 fw-light mb-0">Nuovi casi</p>
                                        <p class="fs-3 ms-3 pe-3 text-white fw-bolder">${dataAboutRegion.nuovi_positivi}</p>
                        
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <h6 class="mb-0 mt-5 fs-5 p-2 bg-accent d-inline-flex text-white rounded-top">Trend nuovi casi</h6>
                                    <div id="trendNew" class="d-flex align-items-end plot bg-main rounded-bottom">
                                    </div>
                                </div>
                                <div class="col-12">
                                    <h6 class="mb-0 mt-5 fs-5 p-2 bg-danger d-inline-flex text-white rounded-top">Trend decessi</h6>
                                    <div id="trendDeath" class="d-flex align-items-end plot bg-main rounded-bottom"></div>
                                </div>
                                <div class="col-12">
                                    <h6 class="mb-0 mt-5 fs-5 p-2 bg-info d-inline-flex text-white rounded-top">Trend ricoverati</h6>
                                    <div id="trendRecovered" class="d-flex align-items-end plot bg-main rounded-bottom"></div>
                                </div>
                            </div>
                        </div>
                    `

                //chiusura per mobile
                let modalClose = document.querySelector('#close')
                modalClose.addEventListener('click', () => {
                    modalRegion.classList.remove('active')
                })
                //chiusura click fuori
                window.addEventListener('click', function (e) {
                    if (e.target == modalRegion) {
                        modalRegion.classList.remove('active')
                    }
                })

                //dati per ogni regione data dal più vecchio + positivi + deceduti + guariti
                let trendData = sorted.map(el => el).reverse().filter(el => el.denominazione_regione == region).map(el => [el.data, el.nuovi_positivi, el.deceduti, el.dimessi_guariti])

                //trend nuovi casi
                let maxNew = Math.max(...trendData.map(el => el[1]))
                let trendNew = document.querySelector('#trendNew')
                //let pinAfter = document.styleSheets[3].insertRule('.pin-new:after {background-color: rgb(255, 255, 255);}', 0)

                trendData.forEach(el => {
                    let colNew = document.createElement('div')
                    colNew.classList.add('d-inline-block', 'pin-new')
                    colNew.setAttribute('title', el[1])
                    colNew.style.height = `${90 * el[1] / maxNew}%`
                    trendNew.appendChild(colNew)
                })

                //trend decessi
                let maxDeath = Math.max(...trendData.map(el => el[2]))
                let trendDeath = document.querySelector('#trendDeath')
                trendData.forEach(el => {
                    let colNew = document.createElement('div')
                    colNew.classList.add('d-inline-block', 'pin-new')
                    colNew.style.height = `${90 * el[2] / maxDeath}%`
                    trendDeath.appendChild(colNew)
                })
                //trend ricoveri
                let maxRecovered = Math.max(...trendData.map(el => el[3]))
                let trendRecovered = document.querySelector('#trendRecovered')
                trendData.forEach(el => {
                    let colNew = document.createElement('div')
                    colNew.classList.add('d-inline-block', 'pin-new')
                    colNew.style.height = `${90 * el[3] / maxRecovered}%`
                    trendRecovered.appendChild(colNew)
                })


            })

        })




    })
