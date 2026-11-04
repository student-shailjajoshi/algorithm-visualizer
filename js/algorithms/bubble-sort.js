
function generateBubbleSortSteps(input) {
  const array = [...input];
  const steps = [];

  let comparisons = 0;
  let swaps = 0;
  let sorted = [];
  let pass = 0;

  const codeExplanations = {
    1: "The outer loop controls the number of passes. Each pass moves one more large element into its final position.",
    2: "We assume no swaps have happened yet in this pass. If this remains false, the array is already sorted.",
    3: "The inner loop visits neighboring pairs. We reduce its range after each pass because the largest remaining element is already sorted.",
    4: "This condition checks whether the left element is greater than its right neighbor. If it is, they are in the wrong order.",
    5: "Swap the two neighboring elements. The smaller value moves one position to the left.",
    6: "We record that a swap occurred. This tells the algorithm that another pass may be necessary.",
    7: "At the end of a pass, check whether any swap happened. If not, the array is already sorted.",
    8: "Stop the algorithm early. There is no reason to continue if a complete pass made no swaps."
  };

  function record({
    line = 1,
    comparing = [],
    swapping = [],
    message = "",
    title = "",
    explanation = "",
    next = "",
    label = "Algorithm step",
    icon = "✦",
    checkpoint = false,
    done = false,
    hint = ""
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
      codeExplanation: codeExplanations[line]
    });
  }

  record({
    line: 1,
    label: "Introduction",
    title: "Let's sort this array.",
    explanation:
      "Bubble Sort works by comparing two neighboring elements at a time. Whenever the left value is greater than the right value, they exchange positions. We'll repeat this process until everything is in order.",
    next: "The outer loop will begin the first pass.",
    icon: "✦"
  });

  for (let i = 0; i < array.length - 1; i++) {
    pass++;

    let swapped = false;

    record({
      line: 1,
      label: `Pass ${pass} begins`,
      title: `Starting pass ${pass}.`,
      explanation:
        `We are beginning pass ${pass}. The last ${sorted.length} element(s) are already in their final positions. We only need to work through the remaining unsorted section.`,
      next: "Initialize the swapped flag.",
      icon: "↻"
    });

    record({
      line: 2,
      label: "Initialize",
      title: "Start with swapped = false.",
      explanation:
        "At the beginning of every pass, we assume the array might already be sorted. If we discover any pair that needs swapping, we'll change this flag to true.",
      next: "Now we'll start comparing neighboring elements.",
      icon: "⚑"
    });

    for (let j = 0; j < array.length - i - 1; j++) {
      record({
        line: 3,
        label: `Pass ${pass} · Comparison ${j + 1}`,
        title: "Move to the next pair.",
        explanation:
          `We are at index ${j}. The algorithm will compare the element at index ${j} with the next element at index ${j + 1}. Notice that we don't revisit the already sorted section at the end.`,
        next: `Compare ${array[j]} and ${array[j + 1]}.`,
        icon: "→"
      });

      comparisons++;

      const left = array[j];
      const right = array[j + 1];

      if (left > right) {
        record({
          line: 4,
          comparing: [j, j + 1],
          label: "Comparison",
          title: `${left} is greater than ${right}.`,
          explanation:
            `The left value is ${left}, and the right value is ${right}. Since ${left} > ${right}, these elements are in the wrong order. We need to swap them.`,
          next: `Move ${right} to the left and ${left} to the right.`,
          icon: "!"
        });

        [array[j], array[j + 1]] = [array[j + 1], array[j]];

        swaps++;
        swapped = true;

        record({
          line: 5,
          swapping: [j, j + 1],
          label: "Swap operation",
          title: "The two elements have swapped.",
          explanation:
            `${right} has moved one position to the left, and ${left} has moved one position to the right. This is how larger values gradually travel toward the end of the array.`,
          next: "Mark that a swap happened during this pass.",
          icon: "⇄",
          checkpoint: true,
          hint:
            "Pause here. Notice how the smaller number moved left while the larger number moved right."
        });

        record({
          line: 6,
          label: "Update flag",
          title: "Set swapped to true.",
          explanation:
            "We have performed a swap, so the swapped flag is now true. This tells the algorithm that the array was not completely sorted before this pass.",
          next: "Continue with the next neighboring pair.",
          icon: "✓"
        });
      } else {
        record({
          line: 4,
          comparing: [j, j + 1],
          label: "Comparison",
          title: `${left} is already in the correct order.`,
          explanation:
            `The left value is ${left}, and the right value is ${right}. Since ${left} is not greater than ${right}, these elements are already in ascending order. No swap is needed.`,
          next: "Move one position to the right and compare the next pair.",
          icon: "✓"
        });
      }
    }

    sorted.unshift(array.length - i - 1);

    record({
      line: 1,
      label: `Pass ${pass} completed`,
      title: "The largest remaining element is in place.",
      explanation:
        `Pass ${pass} is complete. The value ${array[array.length - 1 - (sorted.length - 1)]} has reached its final position at the end of the unsorted section. We won't need to compare it again.`,
      next: swapped
        ? "Begin another pass through the remaining unsorted elements."
        : "Check whether the algorithm can stop early.",
      icon: "↓",
      checkpoint: true,
      hint:
        "A complete pass has finished. Look at the sorted section at the right side of the array."
    });

    record({
      line: 7,
      label: "Check swapped flag",
      title: swapped
        ? "At least one swap happened."
        : "No swaps happened during this pass.",
      explanation: swapped
        ? "The swapped flag is true. That means the array may still contain elements in the wrong order, so another pass is necessary."
        : "The swapped flag is still false. We checked every neighboring pair and didn't need to exchange any elements. That means the entire array is sorted.",
      next: swapped
        ? "Start the next pass."
        : "Stop the algorithm.",
      icon: swapped ? "↻" : "✓"
    });

    if (!swapped) {
      record({
        line: 8,
        label: "Early termination",
        title: "We can stop early!",
        explanation:
          "A complete pass finished without a single swap. This proves that every neighboring pair is already in ascending order. The entire array is sorted, so further passes would be unnecessary.",
        next: "Bubble Sort is complete.",
        icon: "✓",
        checkpoint: true,
        done: true,
        hint:
          "Think about why no swaps means the array is sorted. Every neighboring pair was checked."
      });

      sorted = array.map((_, index) => index);

      record({
        line: 8,
        label: "Completed",
        title: "Array successfully sorted!",
        explanation:
          "Every element is now in ascending order. Bubble Sort has completed its work, and the early-exit optimization prevented unnecessary passes.",
        next: "Try another array or experiment with Explore mode.",
        icon: "🎉",
        done: true
      });

      return steps;
    }
  }

  sorted = array.map((_, index) => index);

  record({
    line: 1,
    label: "Completed",
    title: "Array successfully sorted!",
    explanation:
      "All required passes have finished. Every element is now in its correct position, from smallest to largest.",
    next: "Try another array to see how Bubble Sort behaves with different input.",
    icon: "🎉",
    done: true
  });

  return steps;
}

const initialArray = [42, 18, 65, 23, 9, 51, 34, 76];

createVisualizer({
  generateSteps: generateBubbleSortSteps,
  initialArray
});
