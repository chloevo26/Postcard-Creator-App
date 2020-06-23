"use strict";


// add event listener to file input element
document.getElementById('fileChooser').addEventListener("change", uploadFile);

function uploadFile() {
    // get file choosen by the file dialog control
    const selectedFile = document.getElementById('fileChooser').files[0]
    // store data
    const formData = new FormData();
    formData.append('newImage', selectedFile, encodeURIComponent(selectedFile.name))

    // build a browser-style HTTP request data structure
    const xhr = new XMLHttpRequest();
    // make a post request to the server
    xhr.open("POST", "/upload", true);
    // callback function executed when the HTTP response comes back
    // this function will be called when the request is completed
    xhr.onload = function (e) {
        // get the server's response body
        console.log("Upload file", xhr.responseText);
        // display the image on the server
        let newImage = document.getElementById("serverImage");
        newImage.src = "http://ecs162.org:3000/images/" + xhr.responseText;
        document.getElementById("controls").style.display = "none";
        document.querySelector(".replaceLabel").style.display = "block";
        document.querySelector(".replaceLabel").textContent = "Replace image";

    }
    // send the request to the server
    xhr.send(formData)
    document.querySelector("#controls>label").textContent = "Uploading ...";
    document.querySelector(".replaceLabel").textContent = "Uploading ...";
}



// add event listener to the share postcard button
document.getElementById('sharing-btn').addEventListener("click", sharePostcard);

// share postcard function
// handle sharePostcard post request
function sharePostcard() {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/sharePostcard", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    let image = document.getElementById("serverImage").src;
    let message = document.getElementById("textInput").value;
    let font = document.querySelector("textarea").style.fontFamily;
    let color = document.getElementById("imageCustom").style.backgroundColor;
    // console.log(image);
    const params = {
        image: image,
        message: message,
        font: font,
        color: color
    };
    xhr.onload = function () { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("Share post card", xhr.responseText)
            document.querySelector(".overlay").classList.remove("closeDissappear");
            document.querySelector(".overlay").classList.add("showOverlay");
            document.getElementById("displayLink").href = 'display.html?id=' + xhr.responseText;
            document.getElementById("displayLink").textContent = 'display.html?id=' + xhr.responseText;
        }
    }
    // pass `params` to `send()` method
    xhr.send(JSON.stringify(params));
}



// --------- close button ---------
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".overlay").classList.remove("showOverlay");
    document.querySelector(".overlay").classList.add("closeDissappear");
})


// ------- choosing fonts --------
let fontsList = document.querySelectorAll('li');
let fontsArr = ['Indie Flower', 'Dancing Script', 'Long Cang', 'Homemade Apple']
let currentFont = 0;
fontsList[currentFont].querySelector('span').textContent = "\u2756";
document.querySelector('textarea').style.fontFamily = fontsArr[currentFont];
for (let i = 0; i < fontsList.length; i++) {
    fontsList[i].addEventListener("click", function () {
        currentFont = i;
        document.querySelector('textarea').style.fontFamily = fontsArr[i];
        this.querySelector('span').textContent = "\u2756";
        resetFonts(currentFont);
    });
}
// reset fonts
function resetFonts(currentFont) {
    for (let i = 0; i < fontsList.length; i++) {
        if (i != currentFont) {
            fontsList[i].querySelector('span').textContent = "\u20DF";
        }
    }
}


// ------- choosing background color --------
let colorsList = document.querySelectorAll('.squares');
let colorsArr = ['#e6e2cf', '#dbcaac', '#c9cbb3', '#bbc9ca', '#a6a5b5', '#b5a6ab', '#eccfcf', '#eceeeb', '#bab9b5'];
let currentColor = 0;
colorsList[currentColor].classList.add("squaresSelected")
for (let i = 0; i < colorsList.length; i++) {
    colorsList[i].addEventListener("mouseover", function () {
        document.querySelector('#imageCustom').style.backgroundColor = colorsArr[i];
    });
    colorsList[i].addEventListener("mouseout", function () {
        document.querySelector('#imageCustom').style.backgroundColor = colorsArr[currentColor];
    });
    colorsList[i].addEventListener("click", function () {
        currentColor = i;
        document.querySelector('#imageCustom').style.backgroundColor = colorsArr[i];
        this.classList.toggle("squaresSelected");
        reset(currentColor)
    });
}
function reset(currentColor) {
    for (let i = 0; i < colorsList.length; i++) {
        if (i != currentColor) {
            colorsList[i].classList.remove('squaresSelected');
        }
    }
}

