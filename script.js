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

        //colori 

        let ColorTotalCases = "#fe744f"

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
                       return ColorTotalCases
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
                    options: {
                       
                    }
                });
               
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
                                <div class="col-12">
                                    <canvas id="pinRegion"></canvas>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <canvas id="trendNew"></canvas>
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
                    var ctx = document.getElementById('pinRegion');
                    var test = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Totale casi', 'Dimessi guariti', 'Deceduti', 'Nuovi positivi'],
                            datasets: [{
                                label: '# of Votes',
                                data: [dataAboutRegion.totale_casi,dataAboutRegion.dimessi_guariti,dataAboutRegion.deceduti,dataAboutRegion.nuovi_positivi],
                                backgroundColor: [
                                    ColorTotalCases,
                                    '#198754',
                                    '#dc3445',
                                    '#ffc107',
                                ],
                                borderColor: [
                                    ColorTotalCases,
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    });
                    
                    
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
                console.log(trendData[0]);


                var ctx = document.getElementById('trendNew').getContext('2d');
                var chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'line',

                    // The data for our dataset
                    data: {
                        labels: trendData.map(el => el[0].split("T")[0].split("-").reverse().join("/")),
                        datasets: [{
                            label: ["totale casi"],
                            backgroundColor: ColorTotalCases,
                            borderColor: "red",
                            data: trendData.map(el => el[1])
                        }]
                    },

                    // Configuration options go here
                    options: {
                       
                    }
                });


                //trend nuovi casi
                let maxNew = Math.max(...trendData.map(el => el[1]))
                let trendNew = document.querySelector('#trendNew')
                

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



    