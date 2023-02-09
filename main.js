let dailyWord = '';
let userWord = '';
let isValid;
let currentRow = 0;
let letterSelector;
const urlDailyWord = "https://words.dev-apis.com/word-of-the-day"
const urlIsValid = "https://words.dev-apis.com/validate-word"
const WORD_LENGTH = 5;

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }
function letterSelect(rowIndex, letterIndex) {
  letterSelector = `.container :nth-child(${rowIndex}) :nth-child(${letterIndex})`;
}
function letterChange (key) {
  if (key == 'Backspace') {
    key = '';
  }
  letterSelect(currentRow + 1, userWord.length);
  document.querySelector(letterSelector).innerText = key;
}
async function reqDailyWord() {
    const promise = await fetch(urlDailyWord);
    const objDailyWord = await promise.json();
    dailyWord = objDailyWord.word;
}
async function validateUserInput() {
  for (let i = 0; i < WORD_LENGTH; i++) {
    letterSelect(currentRow + 1, i + 1);
    document.querySelector(letterSelector).classList.add("rotate");
  }
  const promise = await fetch(urlIsValid, {
      method: "POST",
      body: JSON.stringify({
        "word": userWord.toLowerCase()
      })
  });
  const objUserInput =  await promise.json();
  isValid = objUserInput.validWord;
  return isValid;
}

function keyPressed(event) {
// LETTERS 
  if (isLetter(event.key) ) {
    if (userWord.length < WORD_LENGTH) {
      userWord += event.key;
      letterChange(event.key);
    }
// BACKSPACE 
  } else if (event.key == 'Backspace') {
    letterSelect(currentRow + 1, 1);
    if (document.querySelector(letterSelector).classList.contains("red")) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        letterSelect(currentRow + 1, i + 1);
        document.querySelector(letterSelector).classList.remove("red");
      }
    }
    letterChange(event.key);
    userWord = userWord.substring(0, userWord.length - 1);
// ENTER
  } else if (event.key == 'Enter') {
// not correct length
    if (userWord.length != WORD_LENGTH) {
      return;
    }
// Win
    if (userWord.toLowerCase() == dailyWord) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        letterSelect(currentRow + 1, i + 1);
        document.querySelector(letterSelector).classList.add("green");
      }
      document.removeEventListener('keydown', keyPressed);
      let wonDiv = document.createElement('div');
      wonDiv.innerText = "You won :)";
      wonDiv.className = "won-div";
      document.body.appendChild(wonDiv);
      return;
// word validation 
    } else {
      validateUserInput()
      .then(isValid => {
        for (let i = 0; i < WORD_LENGTH; i++) {
          letterSelect(currentRow + 1, i + 1);
          document.querySelector(letterSelector).classList.remove("rotate");
        }
// Valid Word
        if (isValid) {
// compare words
//green   
          let lookupWord = dailyWord;
          for (let i = 0; i < WORD_LENGTH; i++) {
            for (let j = 0; j < WORD_LENGTH; j++) {
              if (dailyWord[i] == userWord[j] && i == j) {
                  letterSelect(currentRow + 1, j + 1);
                  document.querySelector(letterSelector).classList.add("green");
                  lookupWord = lookupWord.substring(0, i) + ' ' + lookupWord.substring(i+1, lookupWord.length);
                }
              }
            }
//red
          for (let i = 0; i < WORD_LENGTH; i++) {
            for (let j = 0; j < WORD_LENGTH; j++) {
              if (lookupWord[i] == userWord[j]) {
                  letterSelect(currentRow + 1, j + 1);
                  document.querySelector(letterSelector).classList.add("yellow");
                  lookupWord = lookupWord.substring(0, i) + ' ' + lookupWord.substring(i+1, lookupWord.length);
                }
              }
            }
// next try
          if (currentRow < WORD_LENGTH) {
            currentRow++;
            userWord = '';
// out of tries
          } else {
            document.removeEventListener('keydown', keyPressed);
            let lostDiv = document.createElement('div');
            lostDiv.innerText = "You lost :(";
            lostDiv.className = "lost-div";
            document.body.appendChild(lostDiv);
          }
// Invalid Word
        } else {
          for (let i = 0; i < WORD_LENGTH; i++) {
            letterSelect(currentRow + 1, i + 1);
            document.querySelector(letterSelector).classList.add("red");
          }
        }      
      })
      .catch(error => {
        console.log('no connection');
      });
    }
    }
}

if (dailyWord == '') {
  reqDailyWord()
  .then(event => {
    document.addEventListener('keydown', keyPressed);
  }) 
  .catch(error => {
    console.log('no connection');
  });
}


