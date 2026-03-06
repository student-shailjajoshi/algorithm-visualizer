// button aur visualizer ko select karna
const generateBtn = document.getElementById("generate");
const visualizer = document.getElementById("visualizer");

// generate button click hone par function chalega
generateBtn.addEventListener("click", generateBars);

function generateBars() {

    // input se array lena
    let input = document.getElementById("arrayInput").value;

    if(input.trim() === ""){
        alert("Please enter array values");
        return;
    }

    // string ko numbers array me convert karna
    let arr = input.split(",").map(Number);

    // purane bars remove karna
    visualizer.innerHTML = "";

    // har number ke liye bar banana
    arr.forEach(function(num){

        let bar = document.createElement("div");

        bar.classList.add("bar");

        bar.style.height = num * 30 + "px";

        visualizer.appendChild(bar);

    });
}