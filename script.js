let loadingBar = document.getElementById('loading-bar');
let loadingTextElement = document.getElementById('loading-text');
let texts = ["Nayak Omkar", "नायक ओंकार"];
let currentIndex = 0;
let currentProgress = 0;
let intervalId;
let originalText = texts[currentIndex];
let jumbledText = originalText.split('');

function jumbleSingleLetter() {
    let index = Math.floor(Math.random() * originalText.length);
    if (jumbledText[index] !== originalText[index]) {
        jumbledText[index] = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    } else {
        jumbledText[index] = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        setTimeout(() => {
            jumbledText[index] = originalText[index];
            loadingTextElement.textContent = jumbledText.join('');
        }, 100);
    }
    loadingTextElement.textContent = jumbledText.join('');
    loadingTextElement.style.color = '#924DBF';
}

function updateLoadingBar() {
    currentProgress += 1;
    loadingBar.style.width = `${currentProgress}%`;
    if (currentProgress < 100) {
        jumbleSingleLetter();
    } else {
        loadingTextElement.textContent = originalText;
        loadingTextElement.style.color = 'white';
        clearInterval(intervalId);
        setTimeout(() => {
            currentIndex++;
            if (currentIndex < texts.length) {
                originalText = texts[currentIndex];
                jumbledText = originalText.split('');
                currentProgress = 0;
                intervalId = setInterval(updateLoadingBar, 50);
            }
        }, 1000);
    }
}

intervalId = setInterval(updateLoadingBar, 50);