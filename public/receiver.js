"use strict"

let data = {};

getDataFromServer();



function getDataFromServer() {
    console.log("get data from server", window.location.href);
    let url = "display" + window.location.search;
    // console.log(url)
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    // Next, add an event listener for when the HTTP response is loaded
    xhr.onload = function (e) {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            let newData = JSON.parse(xhr.responseText);
            // displayData(newData);
            // console.log("get data from server")
            // console.log("Parse data")
            console.log(newData)
            displayData(newData)

        }

    }
    // Actually send request to server
    xhr.send();
}

function displayData(data) {
    document.querySelector("#serverImage").src = data.image;
    document.querySelector(".messageControl").textContent = data.message;
    document.querySelector(".messageControl").style.fontFamily = data.font;
    document.querySelector("#imageCustom").style.backgroundColor = data.color;

}






