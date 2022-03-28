const open_guess = "<div class=\"row justify-content-center\"><div class=\"col-auto text-center justify-content-center guess\">";
let guesses = [];
let words = [];
let hashes = [];
let setupDone = false;
const storage = window.localStorage;

function setup() {
    let request = new XMLHttpRequest();
    request.open('GET', './words.txt', true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            for (let word of request.response.split(/\r?\n/)) {
                words.push(word);
            }
            let request2 = new XMLHttpRequest();
            request2.open('GET', './hashes.txt', true);
            request2.send(null);
            request2.onreadystatechange = function () {
                if (request2.readyState === 4 && request2.status === 200) {
                    for (let hash of request2.response.split(/\r?\n/)) {
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
    let letters = [];
    let green = [];
    let yellow = [];
    for (let i = 0; i < answer.length; i++) {
        if (answer[i] === guess[i]) {
            green.push(i);
        } else {
            letters.push(answer[i]);
        }
    }
    for (let i = 0; i < answer.length; i++) {
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
    document.getElementById("guesses").innerHTML = "";
    for(let guess of guesses){
        addGuess(guess);
        if (guess === today()) {
            win();
        }
    }
}

function addGuess(ghash){
    let wordle_result = wordleize(today(), ghash);
    let html = "";
    for (let i = 0; i < ghash.length; i++) {
        html += "<span" + (wordle_result.green.includes(i) ? " class=\"w-g\"" : "") + (wordle_result.yellow.includes(i) ? " class=\"w-y\"" : "") + "><tt>" + ghash[i] + "</tt></span>";
    }
    document.getElementById("guesses").innerHTML += open_guess + html + "</div></div>";
}

function onSubmit() {
    const guess = document.getElementById("input").value.toLowerCase();
    if (guess !== "chom" && (guess.length !== 5 || !words.includes(guess))) {
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
    let text = document.getElementById("input").value.toLowerCase();
    if (text.length === 0) {
        document.getElementById("preview").innerHTML = open_guess.replace(" guess", " preview") /* i hate this */ + "<span><tt>&nbsp;</tt></span></div></div>";
        return;
    }
    let html = open_guess.replace(" guess", " preview") /* i hate this */;
    let thash = hash(text);
    for(let i = 0; i < thash.length; i++){
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
    let ret = "hashle " + todayNum() + " " + guesses.length + "/:)\n";
    for(let guess of guesses){
        const wr = wordleize(today(), guess);
        for(let i = 0; i < 32; i++){
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
    return ret + "Play hashle! " + window.location + "\n";
}

function share(){
    navigator.clipboard.writeText(winResult());
}

function clearState(){
    storage.clear();
    window.location = window.location;
}
