const open_guess = "<div class=\"row justify-content-center\"><div id=\"guess\" class=\"col-12 text-center justify-content-center guess\">";
var guesses = 0;
var getStatus = 0;
var words = [];
var hashes = [];

function setup() {
    var request = new XMLHttpRequest();
    request.open('GET', './words.txt', true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            for (var word of request.response.split(/\r?\n/)) {
                words.push(word);
            }
            getStatus++;
        }
    }
    var request2 = new XMLHttpRequest();
    request2.open('GET', './hashes.txt', true);
    request2.send(null);
    request2.onreadystatechange = function () {
        if (request2.readyState === 4 && request2.status === 200) {
            for (var hash of request2.response.split(/\r?\n/)) {
                hashes.push(hash);
            }
            getStatus++;
        }
    }
    document.getElementById("input").onkeyup = (e) => {
        if (e.key === "Enter") {
            onSubmit();
        }
    }
}

function hash(str) {
    return CryptoJS.MD5(str).toString();
}

function wordleize(answer, guess) {
    if (answer.length !== guess.length) {
        throw "Illegal guess length";
    }
    var letters = [];
    var green = [];
    var yellow = [];
    for (var i = 0; i < answer.length; i++) {
        if (answer[i] === guess[i]) {
            green.push(i);
        } else {
            letters.push(answer[i]);
        }
    }
    for (var i = 0; i < answer.length; i++) {
        if (green.includes(i)) {
            continue;
        }
        if (letters.includes(guess[i])) {
            yellow.push(i);
            letters = letters.splice(0, letters.indexOf(guess[i])).concat(letters.splice(letters.indexOf(guess[i]) + 1, letters.length));
        }
    }
    return {green: green, yellow: yellow};
}

function onSubmit() {
    const guess = document.getElementById("input").value;
    if (guess.length !== 5 || !words.includes(guess) || getStatus < 2) {
        return;
    }
    var ghash = hash(document.getElementById("input").value);
    var wordle_result = wordleize(hashes[(Math.floor((Date.now()/(1000*60*60)-5)/24)-19052)%hashes.length /* reset at midnight EST */], ghash);
    var html = "";
    guesses++;

    for (var i = 0; i < ghash.length; i++) {
        html += "<span" + (wordle_result.green.includes(i) ? " class=\"w-g\"" : "") + (wordle_result.yellow.includes(i) ? " class=\"w-y\"" : "") + "><tt>" + ghash[i] + "</tt></span>";
    }
    document.getElementById("guesses").innerHTML += open_guess + html + "</div></div>";
    document.getElementById("input").value = "";
    inputChange();
    document.getElementById("input").scrollIntoView();
    if (wordle_result.green.length === 32) {
        win();
    }
}

function inputChange() {
    var text = document.getElementById("input").value;
    if (text.length === 0) {
        document.getElementById("preview").innerHTML = open_guess.replace(" guess", " preview") /* i hate this */ + "<span><tt>&nbsp;</tt></span></div></div>";
        return;
    }
    document.getElementById("preview").innerHTML = open_guess.replace(" guess", " preview") /* i hate this */ + "<span><tt>" + (text.length === 0 ? "&nbsp;" : hash(text)) + "</tt></span></div</div>";
}

function win() {
    document.getElementById("win-message").innerHTML = "<h2>Congrats! You got it in " + guesses + " guess" + (guesses > 1 ? "es" : "") + "!</h2>";
    document.getElementById("preview").hidden = true;
    document.getElementById("input-section").hidden = true;
    document.getElementById("win").hidden = false;
}

function keyup(e) {
    console.log(e.key);
}

inputChange();
setup();
