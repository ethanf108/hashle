const today_word = "hello";
const open_guess = "<div class=\"row justify-content-center\"><div id=\"guess\" class=\"col-12 text-center justify-content-center guess\">";
var guesses = 0;
var words = [];

function setup() {
    var request = new XMLHttpRequest();
    request.open('GET', './words.txt', true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            for (var word of request.response.split(/\r?\n/)){
                words.push(word);
            }
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
    if (guess.length !== 5 || !words.includes(guess)) {
        return;
    }
    var ghash = hash(document.getElementById("input").value);
    var wordle_result = wordleize(hash(today_word), ghash);
    var html = "";
    guesses++;

    for (var i = 0; i < ghash.length; i++) {
        html += "<span" + (wordle_result.green.includes(i) ? " class=\"w-g\"" : "") + (wordle_result.yellow.includes(i) ? " class=\"w-y\"" : "") + "><tt>" + ghash[i] + "</tt></span>";
    }
    document.getElementById("guesses").innerHTML += open_guess + html + "</div></div>";
    document.getElementById("input").value = "";
    inputChange();
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
    document.getElementById("input-section").innerHTML = "<h2>Congrats! You got it in " + guesses + " guess" + (guesses > 1 ? "es" : "") + "!</h2>";
    document.getElementById("preview").hidden = true;
}

inputChange();
setup();
