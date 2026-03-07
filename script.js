// Step 1: delay function
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Step 2: bubble sort function
async function bubbleSort(){

  let bars = document.querySelectorAll(".bar");

  for(let i=0;i<bars.length;i++){

    for(let j=0;j<bars.length-i-1;j++){

      bars[j].style.background="red";
      bars[j+1].style.background="red";

      await sleep(500);

      let h1=parseInt(bars[j].style.height);
      let h2=parseInt(bars[j+1].style.height);

      if(h1>h2){

        bars[j].style.height=h2+"px";
        bars[j+1].style.height=h1+"px";

      }

      bars[j].style.background="steelblue";
      bars[j+1].style.background="steelblue";

    }

  }

}


// Step 3: buttons
const generateBtn = document.getElementById("generate");
const playBtn = document.getElementById("play");
const visualizer = document.getElementById("visualizer");


// Step 4: generate bars
generateBtn.addEventListener("click", function(){

  let input = document.getElementById("arrayInput").value;

  let arr = input.split(",").map(Number);

  visualizer.innerHTML="";

  arr.forEach(num => {

    let bar=document.createElement("div");

    bar.classList.add("bar");

    bar.style.height=num*30+"px";

    visualizer.appendChild(bar);

  });

});


// Step 5: play button
playBtn.addEventListener("click", bubbleSort);