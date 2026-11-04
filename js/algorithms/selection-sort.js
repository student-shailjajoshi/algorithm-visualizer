
const initialArray = [42, 18, 65, 23, 9, 51, 34, 76];

function generateSteps(input) {
  const array = [...input];
  const steps = [];

  let comparisons = 0;
  let swaps = 0;
  let pass = 0;

  function addStep({
    comparing = [],
    swapping = [],
    sorted = [],
    line = 1,
    message,
    title,
    explanation,
    next,
    label,
    icon = "🔎",
    checkpoint = false,
    done = false,
    hint,
    codeExplanation
  }) {
    steps.push({
      array: [...array],
      comparing: [...comparing],
      swapping: [...swapping],
      sorted: [...sorted],
      comparisons,
      swaps,
      pass,
      line,
      message,
      title,
      explanation,
      next,
      label,
      icon,
      checkpoint,
      done,
      hint,
      codeExplanation
    });
  }

  addStep({
    line: 1,
    title: "Let's find the minimum",
    explanation:
      "Selection Sort divides the array into a sorted section on the left and an unsorted section on the right. Initially, the entire array is unsorted.",
    next: "Start with the first position and assume it contains the minimum value.",
    label: "STEP 1",
    icon: "🎯",
    hint: "Watch how the algorithm searches for the smallest value.",
    codeExplanation:
      "The outer loop determines which position should receive the next smallest element."
  });

  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    const sortedBefore = Array.from({ length: i }, (_, index) => index);

    addStep({
      line: 2,
      comparing: [minIndex],
      sorted: sortedBefore,
      title: `Pass ${i + 1}: Assume a minimum`,
      explanation:
        `We begin at index ${i}. The value ${array[i]} is temporarily considered the smallest element in the unsorted portion.`,
      next: "Scan the remaining elements to check whether a smaller value exists.",
      label: `PASS ${i + 1}`,
      icon: "🎯",
      checkpoint: true,
      hint: "The current minimum is only an assumption. We still need to verify it.",
      codeExplanation:
        `minIndex = ${i}. We initially assume arr[${i}] = ${array[i]} is the minimum.`
    });

    for (let j = i + 1; j < array.length; j++) {
      comparisons++;

      addStep({
        line: 4,
        comparing: [minIndex, j],
        sorted: sortedBefore,
        title: "Compare two elements",
        explanation:
          `Compare the current minimum ${array[minIndex]} at index ${minIndex} with ${array[j]} at index ${j}.`,
        next:
          array[j] < array[minIndex]
            ? `${array[j]} is smaller. Update minIndex to ${j}.`
            : `${array[j]} is not smaller. Keep the current minimum.`,
        label: `PASS ${i + 1}`,
        icon: "⚖️",
        hint: "The orange bars represent the current minimum and the element being checked.",
        codeExplanation:
          `Comparison ${comparisons}: arr[${j}] = ${array[j]} ${array[j] < array[minIndex] ? "<" : ">="} arr[${minIndex}] = ${array[minIndex]}.`
      });

      if (array[j] < array[minIndex]) {
        minIndex = j;

        addStep({
          line: 5,
          comparing: [minIndex],
          sorted: sortedBefore,
          title: "Found a new minimum!",
          explanation:
            `${array[minIndex]} is smaller than the previous minimum. We update minIndex to ${minIndex}. This becomes our new candidate for the smallest element.`,
          next: "Continue scanning the remaining unsorted elements.",
          label: `PASS ${i + 1}`,
          icon: "✨",
          checkpoint: true,
          hint: "Notice how the minimum position moves whenever a smaller value is discovered.",
          codeExplanation:
            `minIndex = ${minIndex}. The new minimum is arr[${minIndex}] = ${array[minIndex]}.`
        });
      }
    }

    const minimumValue = array[minIndex];
    const previousValue = array[i];

    if (minIndex !== i) {
      array[i] = minimumValue;
      array[minIndex] = previousValue;
      swaps++;
    }

    pass++;

    const sortedAfter = Array.from(
      { length: i + 1 },
      (_, index) => index
    );

    addStep({
      line: 6,
      swapping: minIndex !== i ? [i, minIndex] : [],
      comparing: [],
      sorted: sortedAfter,
      title:
        minIndex !== i
          ? "Place the minimum in position"
          : "Minimum is already in position",
      explanation:
        minIndex !== i
          ? `The smallest element ${minimumValue} is now placed at index ${i}. We swapped it with ${previousValue}. The sorted portion has grown by one element.`
          : `${minimumValue} was already the smallest element at index ${i}. No swap was necessary. The sorted portion has grown by one element.`,
      next:
        i < array.length - 2
          ? "Move to the next unsorted position and repeat the process."
          : "Only one element remains. It is automatically in its correct position.",
      label: `PASS ${i + 1} COMPLETE`,
      icon: "📍",
      checkpoint: true,
      hint: "Every completed pass guarantees that the left portion is sorted.",
      codeExplanation:
        minIndex !== i
          ? `swap(arr[${i}], arr[${minIndex}]). The minimum value is now at index ${i}.`
          : `minIndex === ${i}. The minimum is already in its correct position, so no swap is needed.`
    });
  }

  addStep({
    line: 6,
    comparing: [],
    swapping: [],
    sorted: array.map((_, index) => index),
    title: "Array completely sorted!",
    explanation:
      "Every element is now in its correct position. Selection Sort has finished. The sorted portion covers the entire array.",
    next: "Try another array or replay the algorithm to understand the process again.",
    label: "COMPLETED",
    icon: "🏆",
    done: true,
    hint: "Great! You have completed Selection Sort.",
    codeExplanation:
      `Sorting complete. ${comparisons} comparisons and ${swaps} swaps were performed across ${pass} passes.`
  });

  return steps;
}

createVisualizer({
  generateSteps,
  initialArray
});
