const open_guess = "<div class=\"row justify-content-center\"><div class=\"col-auto text-center justify-content-center guess\">";
var guesses = [];
var words = [];
var hashes = [];
var setupDone = false;
const storage = window.localStorage;

function setup() {
    var request = new XMLHttpRequest();
    request.open('GET', './words.txt', true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            for (var word of request.response.split(/\r?\n/)) {
                words.push(word);
            }
            var request2 = new XMLHttpRequest();
            request2.open('GET', './hashes.txt', true);
            request2.send(null);
            request2.onreadystatechange = function () {
                if (request2.readyState === 4 && request2.status === 200) {
                    for (var hash of request2.response.split(/\r?\n/)) {
                        hashes.push(hash);
                    }
                    afterSetup();
                }
            }
        }
    }
    document.getElementById("input").onkeyup = (e) => {
        if (e.key === "Enter") {
            onSubmit();
        }
    }
}

function afterSetup(){
    if(storage.getItem("dayNum") === null){
        console.log("NULL");
        storage.setItem("dayNum", todayNum());
    }
    if(parseInt(storage.getItem("dayNum")) !== todayNum()){
        storage.removeItem("guesses");
        storage.setItem("dayNum", todayNum());
    } else {
        if(storage.getItem("guesses") === null){
            storage.setItem("guesses", []);
        }
        guesses = storage.getItem("guesses").split(/[,]/);
        if(guesses[0]===""){
            guesses=guesses.splice(1);
        }
    }
    reloadGuesses();
}
function hash(str) {
    return CryptoJS.MD5(str).toString();
}

function today(){
    return hashes[(Math.floor((Date.now()/(1000*60*60)-5)/24)-19052)%hashes.length /* reset at midnight EST */];
}

function todayNum(){
    return Math.floor((Date.now()/(1000*60*60)-5)/24)-19051;
}

function wordleize(answer, guess) {
    if (answer.length !== guess.length) {
        throw "Illegal guess length" + guess;
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

function submitGuess(ghash){
    guesses.push(ghash);
    addGuess(ghash);
}

function reloadGuesses(){
    for(var guess of guesses){
        addGuess(guess);

        if (guess === today()) {
            win();
        }
    }
}

function addGuess(ghash){
    var wordle_result = wordleize(today(), ghash);
    var html = "";
    for (var i = 0; i < ghash.length; i++) {
        html += "<span" + (wordle_result.green.includes(i) ? " class=\"w-g\"" : "") + (wordle_result.yellow.includes(i) ? " class=\"w-y\"" : "") + "><tt>" + ghash[i] + "</tt></span>";
    }
    document.getElementById("guesses").innerHTML += open_guess + html + "</div></div>";
}

function onSubmit() {
    const guess = document.getElementById("input").value.toLowerCase();
    if (guess.length !== 5 || !words.includes(guess)) {
        return;
    }
    submitGuess(hash(guess));
    storage.setItem("guesses", guesses.toString());
    document.getElementById("input").value = "";
    inputChange();

    if (hash(guess) === today()) {
        win();
    }
    document.getElementById("input").scrollIntoView();
}

function inputChange() {
    var text = document.getElementById("input").value.toLowerCase();
    if (text.length === 0) {
        document.getElementById("preview").innerHTML = open_guess.replace(" guess", " preview") /* i hate this */ + "<span><tt>&nbsp;</tt></span></div></div>";
        return;
    }
    var html = open_guess.replace(" guess", " preview") /* i hate this */;
    var thash = hash(text);
    for(var i = 0; i < thash.length; i++){
        html += "<span><tt>" + thash[i] + "</tt></span>";
    }
    document.getElementById("preview").innerHTML = html + "</div></div>";
}

function win() {
    document.getElementById("win-message").innerHTML = "<h2>Congrats! You got it in " + guesses.length + " guess" + (guesses.length > 1 ? "es" : "") + "!</h2>";
    document.getElementById("preview").hidden = true;
    document.getElementById("input-section").hidden = true;
    document.getElementById("win").hidden = false;
}

function winResult(){
    var ret = "hashle #" + todayNum() + " " + guesses.length + "/:)\n";
    for(var guess of guesses){
        const wr = wordleize(today(), guess);
        for(var i = 0; i < 32; i++){
            if(wr.green.includes(i)){
                ret+= "🟩";
            } else if(wr.yellow.includes(i)){
                ret += "🟨";
            } else {
                ret += "⬛";
            }
        }
        ret+=(wr.green.length==32 ? "🎉" : "#️⃣") + "\n";
    }
    return ret + "Play hashle! hashle.com\n";
}

function share(){
    navigator.clipboard.writeText(winResult());
}

function clearState(){
    storage.clear();
    window.location = window.location;
}
