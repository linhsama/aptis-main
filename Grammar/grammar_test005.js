
const keyid = "Grammar Test5";
const question1_list = [
    {
        question_ask: "By the time guests arrive, I _______ dinner.",
        question_answer: ["will have prepared", "will prepare", "prepare"]
    },
    {
        question_ask: "If I _______ more spices, the dish would taste better.",
        question_answer: ["added", "add", "will add"]
    },
    {
        question_ask: "This recipe _______ by my grandmother for years.",
        question_answer: ["has been used", "uses", "used"]
    },
    {
        question_ask: "The cake _______ before we could serve it.",
        question_answer: ["had burned", "burned", "burns"]
    },
    {
        question_ask: "I've been cooking _______ I was a teenager.",
        question_answer: ["since", "for", "ago"]
    },
    {
        question_ask: "The soup will taste better if you _______ it slowly.",
        question_answer: ["simmer", "will simmer", "simmered"]
    },
    {
        question_ask: "She _______ a new dessert recipe last weekend.",
        question_answer: ["tried", "tries", "trying"]
    },
    {
        question_ask: "_______ you tasted this sauce yet?",
        question_answer: ["Have", "Did", "Do"]
    },
    {
        question_ask: "The soup was _______ spicy that I couldn't finish it.",
        question_answer: ["so", "such", "too"]
    },
    {
        question_ask: "If we _______ fresh vegetables, the salad would taste better.",
        question_answer: ["had bought", "bought", "would buy"]
    },
    {
        question_ask: "This dish _______ served hot.",
        question_answer: ["should be", "should", "should to be"]
    },
    {
        question_ask: "The chef, _______ restaurant won an award, trained in Paris.",
        question_answer: ["whose", "who", "which"]
    },
    {
        question_ask: "I'm not used to _______ without a recipe.",
        question_answer: ["cooking", "cook", "cooked"]
    },
    {
        question_ask: "There is _______ sugar in this recipe than in the last one.",
        question_answer: ["less", "fewer", "least"]
    },
    {
        question_ask: "By the time I checked the oven, the bread _______ already risen.",
        question_answer: ["had", "has", "was"]
    },
    {
        question_ask: "I need _______ advice on how to season this dish.",
        question_answer: ["some", "an", "much"]
    },
    {
        question_ask: "She _______ opening her own bakery next year.",
        question_answer: ["is planning", "plans", "planned"]
    },
    {
        question_ask: "You _______ leave raw meat out at room temperature.",
        question_answer: ["shouldn’t", "mustn’t", "couldn’t"]
    },
    {
        question_ask: "He asked me if I _______ ever baked bread before.",
        question_answer: ["had", "have", "did"]
    },
    {
        question_ask: "This restaurant is _______ than the one downtown.",
        question_answer: ["cheaper", "more cheap", "cheapest"]
    },
    {
        question_ask: "I've _______ finished preparing the ingredients.",
        question_answer: ["just", "yet", "already just"]
    },
    {
        question_ask: "If she follows the recipe carefully, the cake _______ turn out well.",
        question_answer: ["will", "would", "had"]
    },
    {
        question_ask: "The chef told him _______ chop the vegetables finely.",
        question_answer: ["to", "that he", "chop"]
    },
    {
        question_ask: "We _______ homemade meals over fast food.",
        question_answer: ["prefer", "prefers", "preferring"]
    },
    {
        question_ask: "The stew has been simmering _______ two hours.",
        question_answer: ["for", "since", "during"]
    }
];


// Question2 - Mảng câu hỏi
// Select a word from the list that has the most similar meaning to the word on the left.
const question2_list = [
    {
        question_orginal: "simmer",
        question_answer: ["", "mix", "bake", "whisk", "boil", "steam", "marinate", "grate", "slice", "decorate", "chop", "flavor"],
        correct_answer: "boil"  
    },
    {
        question_orginal: "garnish",
        question_answer: ["", "mix", "bake", "whisk", "boil", "steam", "marinate", "grate", "slice", "decorate", "chop", "flavor"],
        correct_answer: "decorate"  
    },
    {
        question_orginal: "blend",
        question_answer: ["", "mix", "bake", "whisk", "boil", "steam", "marinate", "grate", "slice", "decorate", "chop", "flavor"],
        correct_answer: "mix"  
    },
    {
        question_orginal: "season",
        question_answer: ["", "mix", "bake", "whisk", "boil", "steam", "marinate", "grate", "slice", "decorate", "chop", "flavor"],
        correct_answer: "flavor"  
    },
    {
        question_orginal: "roast",
        question_answer: ["", "mix", "bake", "whisk", "boil", "steam", "marinate", "grate", "slice", "decorate", "chop", "flavor"],
        correct_answer: "bake"  
    }
];


// Question3 - Mảng câu hỏi
// Complete each definition using a word from the list. Use each word once only. You will not need five of the words.
const question3_list = [
    {
        question_orginal: "To cut food into small pieces is to…",
        question_answer: ["", "simmer", "blend", "grate", "chop", "bake", "steam", "roast", "whisk", "season", "marinate", "garnish"],
        correct_answer: "chop"  
    },
    {
        question_orginal: "To cook food using dry heat in an oven is to…",
        question_answer: ["", "simmer", "blend", "grate", "chop", "bake", "steam", "roast", "whisk", "season", "marinate", "garnish"],
        correct_answer: "bake"  
    },
    {
        question_orginal: "To combine ingredients thoroughly is to…",
        question_answer: ["", "simmer", "blend", "grate", "chop", "bake", "steam", "roast", "whisk", "season", "marinate", "garnish"],
        correct_answer: "blend"  
    },
    {
        question_orginal: "To soak food in a seasoned liquid before cooking is to…",
        question_answer: ["", "simmer", "blend", "grate", "chop", "bake", "steam", "roast", "whisk", "season", "marinate", "garnish"],
        correct_answer: "marinate"  
    },
    {
        question_orginal: "To cook food using steam is to…",
        question_answer: ["", "simmer", "blend", "grate", "chop", "bake", "steam", "roast", "whisk", "season", "marinate", "garnish"],
        correct_answer: "steam"  
    }
];

// Question4 - Mảng câu hỏi
// Finish each sentence using a word from the list. Use each word once only. You will not need five of the words.
const question4_list = [
    {
        question_start: "Please",
        question_answer: ["", "grate", "garnish", "whisk", "marinate", "roast", "simmer", "chop", "steam", "season", "blend", "bake"],
        question_end: "the vegetables before adding them to the pot.",
        correct_answer: "chop"  
    },
    {
        question_start: "Let the sauce",
        question_answer: ["", "grate", "garnish", "whisk", "marinate", "roast", "simmer", "chop", "steam", "season", "blend", "bake"],
        question_end: "gently for twenty minutes.",
        correct_answer: "simmer"  
    },
    {
        question_start: "Sprinkle some herbs on top to",
        question_answer: ["", "grate", "garnish", "whisk", "marinate", "roast", "simmer", "chop", "steam", "season", "blend", "bake"],
        question_end: "the dish.",
        correct_answer: "garnish"  
    },
    {
        question_start: "",
        question_answer: ["", "grate", "garnish", "whisk", "marinate", "roast", "simmer", "chop", "steam", "season", "blend", "bake"],
        question_end: "the chicken overnight for extra flavor.",
        correct_answer: "marinate"  
    },
    {
        question_start: "Use a fine grater to",
        question_answer: ["", "grate", "garnish", "whisk", "marinate", "roast", "simmer", "chop", "steam", "season", "blend", "bake"],
        question_end: "the cheese.",
        correct_answer: "grate"  
    }
];

// Question5 - Mảng câu hỏi
// Select a word from the list that has the most similar meaning to the word on the left
const question5_list = [
    {
        question_orginal: "delicious",
        question_answer: ["", "sweet", "flavorless", "juicy", "creamy", "sour", "bitter", "tasty", "hot", "stale", "crisp", "tender"],
        correct_answer: "tasty"  
    },
    {
        question_orginal: "bland",
        question_answer: ["", "sweet", "flavorless", "juicy", "creamy", "sour", "bitter", "tasty", "hot", "stale", "crisp", "tender"],
        correct_answer: "flavorless"  
    },
    {
        question_orginal: "fresh",
        question_answer: ["", "sweet", "flavorless", "juicy", "creamy", "sour", "bitter", "tasty", "hot", "stale", "crisp", "tender"],
        correct_answer: "crisp"  
    },
    {
        question_orginal: "spicy",
        question_answer: ["", "sweet", "flavorless", "juicy", "creamy", "sour", "bitter", "tasty", "hot", "stale", "crisp", "tender"],
        correct_answer: "hot"  
    },
    {
        question_orginal: "rich",
        question_answer: ["", "sweet", "flavorless", "juicy", "creamy", "sour", "bitter", "tasty", "hot", "stale", "crisp", "tender"],
        correct_answer: "creamy"  
    }
];


// Question6 - Mảng câu hỏi
// Select a word from the list that is most often used with the word on the left. Use each word once only. You will not need five of the words.
const question6_list = [
    {
        question_orginal: "balanced",
        question_answer: ["", "produce", "flavor", "meal", "portion", "cuisine", "food", "recipe", "menu", "ingredient", "diet", "dining"],
        correct_answer: "diet"  
    },
    {
        question_orginal: "home-cooked",
        question_answer: ["", "produce", "flavor", "meal", "portion", "cuisine", "food", "recipe", "menu", "ingredient", "diet", "dining"],
        correct_answer: "meal"  
    },
    {
        question_orginal: "fine",
        question_answer: ["", "produce", "flavor", "meal", "portion", "cuisine", "food", "recipe", "menu", "ingredient", "diet", "dining"],
        correct_answer: "dining"  
    },
    {
        question_orginal: "fast",
        question_answer: ["", "produce", "flavor", "meal", "portion", "cuisine", "food", "recipe", "menu", "ingredient", "diet", "dining"],
        correct_answer: "food"  
    },
    {
        question_orginal: "organic",
        question_answer: ["", "produce", "flavor", "meal", "portion", "cuisine", "food", "recipe", "menu", "ingredient", "diet", "dining"],
        correct_answer: "produce"  
    }
];








// Mảng lưu đáp án đúng (phần tử đầu tiên của mảng question_answer)
const correct_answers = [];
const user_answers = [];
const shuffledQuestions = [];

// Hàm xáo trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Hoán đổi
    }
}


let question1Ready = false;
function render_question1(index) {
    const questionContainer = document.getElementById("question1");
    const question1_x = document.getElementById("question1_x");
    question1_x.innerHTML = "Question " + (index + 1) + " of 30";

    // Only build answer banks once — re-pushing on every Next/Back corrupts scoring
    if (!question1Ready) {
        question1_list.forEach((questionObj) => {
            correct_answers.push(questionObj.question_answer[0]);
            const shuffledAnswers = [...questionObj.question_answer];
            shuffleArray(shuffledAnswers);
            shuffledQuestions.push(shuffledAnswers);
            user_answers.push(null);
        });
        question1Ready = true;
    }

    const questionObj = question1_list[index];
    const shuffledAnswers = shuffledQuestions[index];

    const questionHTML = `
        <div class="mb-3">
            <label for="q${index}" class="form-label">${questionObj.question_ask}</label>
            ${shuffledAnswers.map((answer, idx) => `
                <div class="form-check mb-2">
                    <input type="radio" class="form-check-input" id="q${index}-${idx}" name="q${index}" value="${answer}" ${user_answers[index] === answer ? 'checked' : ''}>
                    <label for="q${index}-${idx}" class="form-check-label">${answer}</label>
                </div>
            `).join('')}
        </div>
    `;
    questionContainer.innerHTML = questionHTML;

    const radioButtons = document.querySelectorAll(`input[name="q${index}"]`);
    radioButtons.forEach((radio) => {
        radio.addEventListener("change", function() {
            user_answers[index] = this.value;
        });
    });

    

}





function submitQuizQuestion1() {
    const questionContainer = document.getElementById("question1");
    const resultContainer = document.getElementById("resultContainer_question1");
    const resultTableBody = document.getElementById("resultTableBody");

    // Biến để tính điểm, thay 'score' thành 'score_question1'
    let score_question1 = 0;

    resultTableBody.innerHTML = ''; 

    question1_list.forEach((questionObj, index) => {
        const userAnswer = user_answers[index];
        const correctAnswer = correct_answers[index];
        const result = userAnswer === correctAnswer ? 'Correct' : 'Incorrect';
        const resultColor = userAnswer === correctAnswer ? 'text-success' : 'text-danger';

        // Tính điểm nếu câu trả lời đúng
        if (userAnswer === correctAnswer) {
            score_question1++;
        }

        const resultRow = `
            <tr>
                <td>${index + 1}</td>
                <td>${questionObj.question_ask}</td>
                <td>${userAnswer || 'No answer'}</td>
                <td>${correctAnswer}</td>
                <td class="${resultColor}">${result}</td>
            </tr>
        `;
        resultTableBody.innerHTML += resultRow;
    });

    // Hiển thị điểm lên phần tử yourScore_question1
    document.getElementById("yourScore_question1").textContent =
        `Your Score: ${score_question1} / ${question1_list.length}`;

    // Ẩn phần footer và câu hỏi, hiển thị kết quả
    document.querySelector(".footer").style.display = "none";
    questionContainer.style.display = "none";
    resultContainer.style.display = "block";

    // Đóng modal nếu có
    const myModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    if (myModal) myModal.hide();

     return score_question1;

}





// ++++++++++++++++++++++++++++++++++++++++++++++++++++++
// QUESTION 2
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++


// Hàm hiển thị câu hỏi khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", function() {
    render_question2();  // Gọi hàm render_question2 khi DOM đã tải xong
});


// Hàm render câu hỏi 2
function render_question2() {
    const form = document.getElementById("exerciseForm_question2");
    form.innerHTML = ""; // Xóa nội dung cũ nếu có

    question2_list.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "row mb-3 align-items-center";

        const colLeft = document.createElement("div");
        colLeft.className = "col-md-3";
        colLeft.innerText = item.question_orginal;

        const colRight = document.createElement("div");
        colRight.className = "col-md-6";
        const select = document.createElement("select");
        select.className = "form-select";
        select.name = `question_${index}`;

        item.question_answer.forEach(answer => {
            const option = document.createElement("option");
            option.value = answer;
            option.innerText = answer;
            select.appendChild(option);
        });

        colRight.appendChild(select);
        row.appendChild(colLeft);
        row.appendChild(colRight);
        form.appendChild(row);
    });
}


function submitQuizQuestion2() {
    const resultTableBody = document.getElementById("resultTableBody_question2");
    const yourScoreElement = document.getElementById("yourScore_question2");

    // Kiểm tra tồn tại
    if (!resultTableBody) {
        console.error('resultTableBody_question2 không tồn tại trong DOM.');
        return;
    }

    resultTableBody.innerHTML = ''; // Xóa bảng cũ

    let correctCount = 0; // Biến lưu số câu đúng

    // Tạo mảng kết quả từ question2_list
    const results = question2_list.map((item, index) => {
        const formQ2 = document.getElementById("exerciseForm_question2");
        const select = formQ2 ? formQ2.querySelector(`select[name="question_${index}"]`) : null;
        const userAnswer = select ? select.value : "";

        // Kiểm tra câu trả lời đúng
        if (userAnswer === item.correct_answer) {
            correctCount++;
        }

        return {
            question: item.question_orginal,
            userAnswer: userAnswer,
            correctAnswer: item.correct_answer
        };
    });

    // Cập nhật điểm
    yourScoreElement.innerText = `Your score: ${correctCount} / 5`;

    // Render ra bảng
    results.forEach((result, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${result.question}</td>
            <td>${result.userAnswer}</td>
            <td>${result.correctAnswer}</td>
            <td class="${result.userAnswer === result.correctAnswer ? 'text-success' : 'text-danger'}">
                ${result.userAnswer === result.correctAnswer ? 'Correct' : 'Incorrect'}
            </td>
        `;
        resultTableBody.appendChild(row);
    });

    // Hiển thị container kết quả
    //document.getElementById("resultContainer_question2").style.display = "block";

    return correctCount;
}









// ++++++++++++++++++++++++++++++++++++++++++++++++++++++
// QUESTION 3
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++


document.addEventListener("DOMContentLoaded", function() {
    render_question3();  // Gọi hàm render_question3 khi DOM đã tải xong
});

// Mảng để theo dõi các từ đã chọn
let selectedAnswers_question3 = [];

function render_question3() {
    const form = document.getElementById("exerciseForm_question3");
    form.innerHTML = ""; // Xóa nội dung cũ nếu có

    question3_list.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "row mb-3 align-items-center";

        const colLeft = document.createElement("div");
        colLeft.className = "col-md-3";
        colLeft.innerText = item.question_orginal;

        const colRight = document.createElement("div");
        colRight.className = "col-md-6";
        const select = document.createElement("select");
        select.className = "form-select";
        select.name = `question_${index}`;

        // Lọc ra các từ đã được chọn
       const availableAnswers = item.question_answer.filter(answer => !selectedAnswers_question3.includes(answer));


        // Thêm các tùy chọn vào select
        availableAnswers.forEach(answer => {
            const option = document.createElement("option");
            option.value = answer;
            option.innerText = answer;
            select.appendChild(option);
        });

        // Lắng nghe sự thay đổi của lựa chọn
        select.addEventListener("change", function() {
            selectedAnswers_question3[index] = select.value; // Lưu đáp án đã chọn
        });

        colRight.appendChild(select);
        row.appendChild(colLeft);
        row.appendChild(colRight);
        form.appendChild(row);
    });
}

function submitQuizQuestion3() {
    const resultTableBody = document.getElementById("resultTableBody_question3");
    const yourScoreElement = document.getElementById("yourScore_question3");

    // Kiểm tra tồn tại
    if (!resultTableBody) {
        console.error('resultTableBody_question3 không tồn tại trong DOM.');
        return;
    }

    resultTableBody.innerHTML = ''; // Xóa bảng cũ

    let correctCount = 0; // Biến lưu số câu đúng

    // Tạo mảng kết quả từ question3_list
    const results = question3_list.map((item, index) => {
        const userAnswer = selectedAnswers_question3[index] || "";  // Lấy giá trị người dùng chọn

        // Kiểm tra câu trả lời đúng
        if (userAnswer === item.correct_answer) {
            correctCount++;
        }

        return {
            question: item.question_orginal,
            userAnswer: userAnswer,
            correctAnswer: item.correct_answer
        };
    });

    // Cập nhật điểm
    yourScoreElement.innerText = `Your score: ${correctCount} / 5`;

    // Render ra bảng
    results.forEach((result, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${result.question}</td>
            <td>${result.userAnswer}</td>  <!-- Hiển thị đáp án người dùng chọn -->
            <td>${result.correctAnswer}</td>
            <td class="${result.userAnswer === result.correctAnswer ? 'text-success' : 'text-danger'}">
                ${result.userAnswer === result.correctAnswer ? 'Correct' : 'Incorrect'}
            </td>
        `;
        resultTableBody.appendChild(row);
    });

    // Hiển thị container kết quả
    //document.getElementById("resultContainer_question3").style.display = "block";

    return correctCount;
}






// ++++++++++++++++++++++++++++++++++++++++++++++++++++++
// QUESTION 4
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++
document.addEventListener("DOMContentLoaded", function() {
    render_question4();  // Gọi hàm render_question4 khi DOM đã tải xong
});

let selectedAnswers_question4 = [];


function render_question4() {
    const form = document.getElementById("exerciseForm_question4");
    form.innerHTML = ""; // Xóa nội dung cũ nếu có

    question4_list.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "mb-3 d-flex align-items-center"; // Dùng d-flex để căn chỉnh theo hàng và align-items-center để canh giữa các phần tử

        // Tạo câu hỏi đầu (question_start)
        const questionStart = document.createElement("div");
        questionStart.className = "me-2"; // Thêm margin-right giữa các phần tử
        questionStart.innerText = item.question_start;

        // Tạo selectbox cho câu trả lời
        const select = document.createElement("select");
        select.className = "form-select form-select-sm w-auto me-2"; // Thêm form-select-sm và w-auto để giảm chiều rộng
        select.name = `question_${index}`;

        // Lọc các lựa chọn chưa được chọn
        const availableAnswers = item.question_answer.filter(answer => !selectedAnswers_question4.includes(answer));

        // Thêm các lựa chọn vào select
        availableAnswers.forEach(answer => {
            const option = document.createElement("option");
            option.value = answer;
            option.innerText = answer;
            select.appendChild(option);
        });

        // Lắng nghe sự thay đổi của lựa chọn
        select.addEventListener("change", function() {
            selectedAnswers_question4[index] = select.value; // Lưu đáp án đã chọn
        });

        // Tạo phần kết thúc câu hỏi (question_end)
        const questionEnd = document.createElement("div");
        questionEnd.innerText = item.question_end;

        // Thêm vào form
        row.appendChild(questionStart);
        row.appendChild(select);
        row.appendChild(questionEnd);

        form.appendChild(row);
    });
}

function submitQuizQuestion4() {
    const resultTableBody = document.getElementById("resultTableBody_question4");
    const yourScoreElement = document.getElementById("yourScore_question4");

    resultTableBody.innerHTML = ''; // Xóa bảng cũ

    let correctCount = 0; // Biến lưu số câu đúng

    // Tạo mảng kết quả từ question4_list
    const results = question4_list.map((item, index) => {
        const userAnswer = selectedAnswers_question4[index] || "";  // Lấy giá trị người dùng chọn

        // Kiểm tra câu trả lời đúng
        if (userAnswer === item.correct_answer) {
            correctCount++;
        }

        return {
            question: `${item.question_start} ... ${item.question_end}`,
            userAnswer: userAnswer,
            correctAnswer: item.correct_answer
        };
    });

    // Cập nhật điểm
    yourScoreElement.innerText = `Your score: ${correctCount} / 5`;

    // Render ra bảng
    results.forEach((result, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${result.question}</td>
            <td>${result.userAnswer}</td>  <!-- Hiển thị đáp án người dùng chọn -->
            <td>${result.correctAnswer}</td>
            <td class="${result.userAnswer === result.correctAnswer ? 'text-success' : 'text-danger'}">
                ${result.userAnswer === result.correctAnswer ? 'Correct' : 'Incorrect'}
            </td>
        `;
        resultTableBody.appendChild(row);
    });

    // Hiển thị container kết quả
    //document.getElementById("resultContainer_question4").style.display = "block";

    return correctCount;
}




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++
// QUESTION 5
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Lưu đáp án user theo index
const question5_userAnswers = {}; // {0:"A", 1:"B", ...}

// Hàm hiển thị câu hỏi khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", function() {
  render_question5();
});

// Hàm render câu hỏi 5
function render_question5() {
  const form = document.getElementById("exerciseForm_question5");
  form.innerHTML = "";

  question5_list.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "row mb-3 align-items-center";

    const colLeft = document.createElement("div");
    colLeft.className = "col-md-3";
    colLeft.innerText = item.question_orginal;

    const colRight = document.createElement("div");
    colRight.className = "col-md-6";

    const select = document.createElement("select");
    select.className = "form-select";
    select.name = `question_${index}`;

    // (Tuỳ chọn) thêm placeholder để tránh mặc định luôn chọn option đầu
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.innerText = "-- Choose an answer --";
    select.appendChild(placeholder);

    item.question_answer.forEach(answer => {
      const option = document.createElement("option");
      option.value = answer;
      option.innerText = answer;
      select.appendChild(option);
    });

    // KHÔI PHỤC lựa chọn đã lưu (nếu có)
    if (question5_userAnswers[index] !== undefined) {
      select.value = question5_userAnswers[index];
    } else {
      select.value = ""; // placeholder
    }

    // Lưu lại khi user chọn
    select.addEventListener("change", () => {
      question5_userAnswers[index] = select.value;

      // Nếu muốn chọn lại là cập nhật bảng luôn:
      submitQuizQuestion5();
    });

    colRight.appendChild(select);
    row.appendChild(colLeft);
    row.appendChild(colRight);
    form.appendChild(row);
  });
}
function submitQuizQuestion5() {
  const resultTableBody = document.getElementById("resultTableBody_question5");
  const yourScoreElement = document.getElementById("yourScore_question5");

  if (!resultTableBody) {
    console.error("resultTableBody_question5 không tồn tại trong DOM.");
    return;
  }

  resultTableBody.innerHTML = "";

  let correctCount = 0;

  const results = question5_list.map((item, index) => {
    // Ưu tiên lấy từ state đã lưu
    const userAnswerRaw = question5_userAnswers[index] ?? "";

    // Chỉ tính đúng khi có chọn và đúng
    if (userAnswerRaw && userAnswerRaw === item.correct_answer) {
      correctCount++;
    }

    return {
      question: item.question_orginal,
      userAnswerRaw,
      userAnswerText: userAnswerRaw || "(không chọn)",
      correctAnswer: item.correct_answer,
      isCorrect: userAnswerRaw !== "" && userAnswerRaw === item.correct_answer
    };
  });

  yourScoreElement.innerText = `Your score: ${correctCount} / ${question5_list.length}`;

  results.forEach((result, index) => {
    let statusText = "Incorrect";
    let statusClass = "text-danger";

    if (result.userAnswerRaw === "") {
      statusText = "Not answered";
      statusClass = "text-secondary";
    } else if (result.isCorrect) {
      statusText = "Correct";
      statusClass = "text-success";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${result.question}</td>
      <td>${result.userAnswerText}</td>
      <td>${result.correctAnswer}</td>
      <td class="${statusClass}">
        ${statusText}
      </td>
    `;
    resultTableBody.appendChild(row);
  });

  return correctCount;
}



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++
// QUESTION 6
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Lưu đáp án user theo index
const question6_userAnswers = {}; // {0:"A", 1:"B", ...}

// Hàm hiển thị câu hỏi khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", function () {
  render_question6();
});

// Hàm render câu hỏi 6
function render_question6() {
  const form = document.getElementById("exerciseForm_question6");
  form.innerHTML = "";

  question6_list.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "row mb-3 align-items-center";

    const colLeft = document.createElement("div");
    colLeft.className = "col-md-3";
    colLeft.innerText = item.question_orginal;

    const colRight = document.createElement("div");
    colRight.className = "col-md-6";

    const select = document.createElement("select");
    select.className = "form-select";

    // ✅ Đặt name riêng để không đụng Q5
    select.name = `question6_${index}`;

    // (Tuỳ chọn) placeholder để tránh auto chọn đáp án đầu tiên
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.innerText = "-- Choose an answer --";
    select.appendChild(placeholder);

    item.question_answer.forEach((answer) => {
      const option = document.createElement("option");
      option.value = answer;
      option.innerText = answer;
      select.appendChild(option);
    });

    // ✅ Khôi phục lựa chọn đã lưu
    if (question6_userAnswers[index] !== undefined) {
      select.value = question6_userAnswers[index];
    } else {
      select.value = "";
    }

    // ✅ Lưu lại khi user đổi chọn
    select.addEventListener("change", () => {
      question6_userAnswers[index] = select.value;

      // Nếu muốn đổi select là update bảng luôn:
      submitQuizQuestion6();
    });

    colRight.appendChild(select);
    row.appendChild(colLeft);
    row.appendChild(colRight);
    form.appendChild(row);
  });
}
function submitQuizQuestion6() {
  const resultTableBody = document.getElementById("resultTableBody_question6");
  const yourScoreElement = document.getElementById("yourScore_question6");

  if (!resultTableBody) {
    console.error("resultTableBody_question6 không tồn tại trong DOM.");
    return;
  }

  resultTableBody.innerHTML = "";

  let correctCount = 0;

  const results = question6_list.map((item, index) => {
    const userAnswer = question6_userAnswers[index] ?? "";

    // Chỉ tính đúng khi CÓ chọn và đúng
    if (userAnswer && userAnswer === item.correct_answer) {
      correctCount++;
    }

    return {
      question: item.question_orginal,
      userAnswer: userAnswer || "(không chọn)",
      correctAnswer: item.correct_answer,
      isCorrect: userAnswer === item.correct_answer && userAnswer !== ""
    };
  });

  yourScoreElement.innerText = `Your score: ${correctCount} / ${question6_list.length}`;

  results.forEach((result, index) => {
    let statusText = "Incorrect";
    let statusClass = "text-danger";

    if (result.userAnswer === "(không chọn)") {
      statusText = "Not answered";
      statusClass = "text-secondary";
    } else if (result.isCorrect) {
      statusText = "Correct";
      statusClass = "text-success";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${result.question}</td>
      <td>${result.userAnswer}</td>
      <td>${result.correctAnswer}</td>
      <td class="${statusClass}">
        ${statusText}
      </td>
    `;
    resultTableBody.appendChild(row);
  });

  return correctCount;
}


// ============================================================
// 🟢 Nút Submit - Xử lý khi bấm nút nộp bài
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
    const submitTestButton = document.getElementById("submitTestButton");
    const total_score_s = document.getElementById("totalScore");
    const result_navigation = document.getElementById("result_navigation");

    submitTestButton.addEventListener("click", function() {
        // Gọi các hàm nộp quiz và lấy điểm
        const scores = [
            submitQuizQuestion1(),
            submitQuizQuestion2(),
            submitQuizQuestion3(),
            submitQuizQuestion4(),
            submitQuizQuestion5(),
            submitQuizQuestion6()
        ].map(s => Number(s) || 0);

        const total = scores.reduce((a, b) => a + b, 0);

        total_score_s.textContent = `Your grammar total score: ${total}`;

        hidden_all();

        result_navigation.style.display = "block";
        // Show answer review for part 1 right away; nav buttons switch other parts
        const resultContainers = [1,2,3,4,5,6].map(i => document.getElementById(`resultContainer_question${i}`));
        resultContainers.forEach((el, i) => { if (el) el.style.display = i === 0 ? "block" : "none"; });
        [1,2,3,4,5,6].forEach(i => {
          const btn = document.getElementById(`navQ${i}`);
          if (btn) {
            btn.classList.toggle("btn-active", i === 1);
            btn.classList.toggle("active", i === 1);
          }
        });

    });
});



// ============================================================
// 🟢 Nút next và back
// ============================================================
let currentQuestionIndex = 0;
document.addEventListener("DOMContentLoaded", function() {
    render_question1(0);

    nextButton.addEventListener("click", function() {
        if (currentQuestionIndex < question1_list.length + 4) {
            currentQuestionIndex++;
            if(currentQuestionIndex < question1_list.length){
                render_question1(currentQuestionIndex);
            }
            display_question(currentQuestionIndex);
        } else {
            const myModal = new bootstrap.Modal(document.getElementById('confirmModal'), {
                keyboard: false
            });
            myModal.show();
        }


        const question1_x = document.getElementById("question1_x");
        if (currentQuestionIndex > question1_list.length -1) {
            question1_x.style.display = "none";
        } else {
            question1_x.style.display = "block";
        }

        if (currentQuestionIndex === question1_list.length + 4) {
            nextButton.textContent = "Submit Test"; 
        } else {
            nextButton.textContent = "Next"; 
        }
    });

    backButton.addEventListener("click", function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;

            if(currentQuestionIndex < question1_list.length - 1){
                render_question1(currentQuestionIndex);
            }           
        }
        display_question(currentQuestionIndex);

        if (currentQuestionIndex > question1_list.length -1) {
            question1_x.style.display = "none";
        } else {
            question1_x.style.display = "block";
        }

        if (currentQuestionIndex === question1_list.length + 4) {
            nextButton.textContent = "Submit Test"; 
        } else {
            nextButton.textContent = "Next"; 
        }
    });
});






function display_question(index) {
    const questions = [
        document.getElementById("question1"),
        document.getElementById("question2"),
        document.getElementById("question3"),
        document.getElementById("question4"),
        document.getElementById("question5"),
        document.getElementById("question6")
    ];

    // Ẩn hết
    questions.forEach(div => div.style.display = "none");

    // Tính xem đang ở câu hỏi số mấy
    let step = 0;
    if (index < question1_list.length) {
        step = 0; // question1
    } else if (index === question1_list.length) {
        step = 1; // question2
    } else if (index === question1_list.length + 1) {
        step = 2; // question3
    } else if (index === question1_list.length + 2) {
        step = 3; // question4
    } else if (index === question1_list.length + 3) {
        step = 4; // question5
    } else if (index === question1_list.length + 4) {
        step = 5; // question6
    }

    // Hiện đúng div
    questions[step].style.display = "block";
}


// Ẩn tất cả câu hỏi
function hidden_all() {
    const questions = [
        document.getElementById("question1"),
        document.getElementById("question2"),
        document.getElementById("question3"),
        document.getElementById("question4"),
        document.getElementById("question5"),
        document.getElementById("question6")
    ];

    questions.forEach(div => {
        if (div) div.style.display = "none";
    });
}


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("question_step").innerHTML = keyid;
    const navButtons = [
        document.getElementById("navQ1"),
        document.getElementById("navQ2"),
        document.getElementById("navQ3"),
        document.getElementById("navQ4"),
        document.getElementById("navQ5"),
        document.getElementById("navQ6")
    ];

    const resultContainers = [
        document.getElementById("resultContainer_question1"),
        document.getElementById("resultContainer_question2"),
        document.getElementById("resultContainer_question3"),
        document.getElementById("resultContainer_question4"),
        document.getElementById("resultContainer_question5"),
        document.getElementById("resultContainer_question6")
    ];

    function hideAllResults() {
        resultContainers.forEach(div => { if (div) div.style.display = "none"; });
    }

    function setActiveButton(activeIdx) {
        navButtons.forEach((btn, i) => {
            btn.classList.toggle("btn-active", i === activeIdx);
            btn.classList.toggle("active", i === activeIdx); // phòng khi bạn muốn dùng .active của Bootstrap
        });
    }

    function showResult(idx) {
        hideAllResults();
        if (resultContainers[idx]) resultContainers[idx].style.display = "block";
        setActiveButton(idx);
        const nav = document.getElementById("result_navigation");
        if (nav) nav.style.display = "block";
    }

    // Gắn sự kiện cho 6 nút
    navButtons.forEach((btn, i) => {
        if (!btn) return;
        btn.addEventListener("click", () => showResult(i));
    });

    // ===== Ví dụ: sau khi submit và tính điểm xong, hiện navigation và kết quả số 1
    // Gọi ở cuối hàm tổng hợp điểm của bạn:
    // document.getElementById("result_navigation").style.display = "block";
    // showResult(0); // hiển thị resultContainer_question1
});
