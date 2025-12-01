let currentQuestion = 0;
let quizData;
let score = 0;
let selectedImages = [];

const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const questionContainer = document.getElementById("question-container");
const resultContainer = document.getElementById("result-container");
const resultLevel = document.getElementById("result-level");
const resultMessage = document.getElementById("result-message");
const resultImage = document.getElementById("result");
const instructionScreen = document.getElementById("instruction-screen");
const goToStartBtn = document.getElementById("go-to-start-btn");

// JSON here
fetch("kyuiz-id.json")
  .then(res => res.json())
  .then(data => {
    quizData = data;
    document.getElementById("quiz-title").textContent = quizData.quiz.title;
  });

// not sure what this called
document.addEventListener('DOMContentLoaded', () => {
    startScreen.classList.add("hidden");
    startBtn.style.display = "none";     
    instructionScreen.classList.remove("hidden"); 
});
// Go to start screen
goToStartBtn.addEventListener("click", () => {
    instructionScreen.classList.add("hidden"); 
    startBtn.style.display = "inline-block";
    startScreen.classList.remove("hidden");
});


// Start quiz
startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
   startBtn.style.display = "none";
  questionContainer.classList.remove("hidden");
  showQuestion();
});

// Display Question
function showQuestion() {
  questionContainer.innerHTML = "";

  const q = quizData.quiz.questions[currentQuestion];

  if (!q) {
    showResult();
    return;
  }

  const questionEl = document.createElement("p");
  questionEl.textContent = q.text;
  questionContainer.appendChild(questionEl);

  const answers = q.choices || q.answers;

answers.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.classList.add("answer-btn");

    // If this answer uses objects (label + optional image)
    if (typeof choice === "object") {
    const showImg = choice.showImage !== false;

    btn.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
            ${showImg && choice.image ? `<img src="${choice.image}" style="width:120px; margin-bottom:8px;">` : ""}
            <span>${choice.label}</span>
        </div>
    `;
} else {
    btn.textContent = choice;
}


    btn.onclick = () => {

        // Score
        if (q.scores) score += q.scores[index];

        // Stored image 
        if (typeof choice === "object" && choice.store === true) {
            selectedImages.push(choice.image);
        }

        // Skip logic
        if (currentQuestion === 7) {
            currentQuestion = index === 0 ? 8 : 9;
        } else {
            currentQuestion++;
        }

        showQuestion();
    };

    questionContainer.appendChild(btn);
});


}

// Show result
function showResult() {
    questionContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");

resultMessage.textContent = quizData.quiz.ending_message;

    let scoreImage = "";
    let scoreMessage = "";

if (score < 5) {
    scoreImage = "assets/art-under.png";
    scoreMessage = "Kamu adalah penjelajah yang ingin tahu! Kamu belum terlalu familiar dengan makanan apa saja yang benar-benar makanan tradisional Indonesia, tapi tidak apa-apa. Ini akan menjadi awal perjalananmu untuk belajar~";
} 
else if (score < 7) {
    scoreImage = "assets/art-middle.png";
    scoreMessage = "Kamu adalah pengembara yang terampil! Kamu punya pemahaman yang cukup baik tentang makanan tradisional Indonesia. Teruslah menjelajah untuk menemukan lebih banyak makanan tradisional Indonesia.";
} 
else {
    scoreImage = "assets/art-above.png";
    scoreMessage = "Kamu adalah petualang sejati! Kamu sangat familiar dengan makanan tradisional Indonesia. Kerja bagus! Dengan pengetahuan itu, mungkin kamu bisa menemukan lebih banyak lagi tentang makanan tradisional Indonesia di masa mendatang.";
} 

    resultLevel.textContent = scoreMessage;


    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const imgWidth = 950;
    const imgHeight = 1400;
    canvas.width = imgWidth;
    canvas.height = imgHeight;

    const baseImage = new Image();
    baseImage.src = scoreImage;

    baseImage.onload = () => {
        ctx.drawImage(baseImage, 0, 0, imgWidth, imgHeight);


        if (selectedImages.length === 0) {
            finalizeResult(canvas);
        } else {
            let loadedImages = 0;
            selectedImages.forEach(imgSrc => {
                const overlayImg = new Image();
                overlayImg.src = imgSrc;

                overlayImg.onload = () => {
                    ctx.drawImage(overlayImg, 0, 0, imgWidth, imgHeight);
                    loadedImages++;
                    if (loadedImages === selectedImages.length) {
                        finalizeResult(canvas);
                    }
                };

                overlayImg.onerror = () => {
                    console.error("Error loading overlay image: " + imgSrc);
                    loadedImages++;
                    if (loadedImages === selectedImages.length) finalizeResult(canvas);
                };
            });
        }
    };
}

//final res
function finalizeResult(canvas) {
    resultImage.src = canvas.toDataURL();
    

    // buttons remov
    const oldDownload = document.getElementById("download-btn");
    if (oldDownload) oldDownload.remove();
    const oldUpload = document.getElementById("upload-btn");
    if (oldUpload) oldUpload.remove();

    // downwnload button
    const downloadBtn = document.createElement("a");
    downloadBtn.id = "download-btn";
    downloadBtn.textContent = "Download Image";
    downloadBtn.href = canvas.toDataURL("image/png");
    downloadBtn.download = "Quiz_result.png";
    styleButton(downloadBtn, "#4CAF50");
  // Hover ON
downloadBtn.addEventListener("mouseenter", () => {
    downloadBtn.style.backgroundColor = "#26722aff"; 
});

// Hover OFF
downloadBtn.addEventListener("mouseleave", () => {
    downloadBtn.style.backgroundColor = "#4CAF50"; 
    downloadBtn.style.transform = "scale(1)";
});
    document.getElementById("result-container").appendChild(downloadBtn);

    // upppload button
    const uploadBtn = document.createElement("a");
    uploadBtn.id = "upload-btn";
    uploadBtn.textContent = "Upload to Drive";
    uploadBtn.href = "https://drive.google.com/drive/folders/1GL0Bx0vo2K-QF7glbquVM5ZubNdPMyQd?usp=drive_link";
    uploadBtn.target = "_blank";
    styleButton(uploadBtn, "#4285F4");
  // Hover ON
uploadBtn.addEventListener("mouseenter", () => {
    uploadBtn.style.backgroundColor = "#275196ff"; 
});

// Hover OFF
uploadBtn.addEventListener("mouseleave", () => {
    uploadBtn.style.backgroundColor = "#4285F4";
    uploadBtn.style.transform = "scale(1)";
});
    document.getElementById("result-container").appendChild(uploadBtn);
}

// button style
function styleButton(btn, bgColor) {
    btn.style.display = "inline-block";
    btn.style.marginTop = "10px";
    btn.style.marginRight = "5px";
    btn.style.padding = "10px 20px";
    //btn.style.marginTop = "20px";
    btn.style.backgroundColor = bgColor;
    btn.style.color = "white";
    btn.style.textDecoration = "none";
    btn.style.borderRadius = "10px";
}


// Restart button
document.getElementById("restart-btn").addEventListener("click", () => {

    currentQuestion = 0;
    score = 0;
    selectedImages = [];

    instructionScreen.classList.remove("hidden"); 
    startScreen.classList.add("hidden");          


    questionContainer.classList.add("hidden");
    resultContainer.classList.add("hidden");
});
