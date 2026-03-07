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

// step 3: selection sort
async function selectionSort(){

let bars=document.querySelectorAll(".bar");

for(let i=0;i<bars.length;i++){

let minIndex=i;

bars[i].style.background="red";

for(let j=i+1;j<bars.length;j++){

bars[j].style.background="yellow";

await sleep(500);

let h1=parseInt(bars[j].style.height);
let h2=parseInt(bars[minIndex].style.height);

if(h1<h2){

bars[minIndex].style.background="steelblue";
minIndex=j;

}

bars[j].style.background="steelblue";

}

let temp=bars[i].style.height;
bars[i].style.height=bars[minIndex].style.height;
bars[minIndex].style.height=temp;

bars[i].style.background="green";

}

}
// Step 4: buttons
const generateBtn=document.getElementById("generate");
const playBtn=document.getElementById("play");
const visualizer=document.getElementById("visualizer");


// Step 5: generate bars
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


// Step 6: play button

playBtn.addEventListener("click", function(){

let algo=document.getElementById("algorithm").value;

if(algo==="Bubble Sort"){
bubbleSort();
}

else if(algo==="Selection Sort"){
selectionSort();
}

});