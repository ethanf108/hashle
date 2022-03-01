const today_word = "hello";
const open_guess = "<div class=\"row justify-content-center\"><div id=\"guess\" class=\"col-12 text-center justify-content-center guess\">";
var guesses = 0;

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
    if (document.getElementById("input").value.length !== 5) {
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
    if(wordle_result.green.length === 32){
        document.getElementById("input-section").innerHTML = "<h2>Congrats! You got it in " + guesses + " guess" + (guesses > 1 ? "es" : "") + "!</h2>"
    }
}

function inputChange() {
    var text = document.getElementById("input").value;
    if (text.length === 0) {
        document.getElementById("preview").innerHTML = "";
    }
    document.getElementById("preview").innerHTML = "<tt>" + (text.length === 0 ? "&nbsp;" : hash(text)) + "</tt>";
}
