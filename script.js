fetch("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json")
.then(response => response.json())
.then(dati => {
    //ordino i dati
    let sorted = dati.reverse()
    //ultima data caricata
    let lastUpdated = sorted[0].data
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

    console.log(totalCases);
})