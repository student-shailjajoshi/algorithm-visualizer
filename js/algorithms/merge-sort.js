
const initialArray = [42, 18, 65, 23, 9, 51, 34, 76];

function generateSteps(input) {
  const array = [...input];
  const steps = [];

  let comparisons = 0;
  let pass = 0;

  function addStep({
    comparing = [],
    swapping = [],
    sorted = [],
    line = 1,
    message = "",
    title,
    explanation,
    next,
    label,
    icon = "🔀",
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
      swaps: 0,
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
    title: "Meet Merge Sort",
    explanation:
      "Merge Sort uses a divide-and-conquer strategy. Instead of sorting the entire array at once, it repeatedly divides the array into smaller sections until each section contains just one element.",
    next: "Divide the array into a left half and a right half.",
    label: "STEP 1",
    icon: "🧩",
    checkpoint: true,
    hint: "A single-element array is already sorted.",
    codeExplanation:
      "We begin by calling mergeSort on the entire array."
  });

  function mergeSort(left, right, depth = 0) {
    if (left >= right) {
      addStep({
        line: 2,
        comparing: [],
        sorted: [left],
        title: "Base case: One element",
        explanation:
          `The section at index ${left} contains only ${array[left]}. An array with one element is already sorted, so recursion stops here.`,
        next: "Return to the previous recursive call and continue sorting the other section.",
        label: "BASE CASE",
        icon: "🎯",
        checkpoint: true,
        hint: "This is where the recursion starts returning.",
        codeExplanation:
          "When left >= right, the section contains zero or one element and needs no sorting."
      });

      return;
    }

    const middle = Math.floor((left + right) / 2);

    addStep({
      line: 3,
      comparing: [],
      sorted: [],
      title: "Divide the array",
      explanation:
        `The current section covers indexes ${left} to ${right}. We calculate the middle index ${middle} and divide it into two smaller sections.`,
      next: "Recursively divide the left section.",
      label: `DIVIDING · ${left}–${right}`,
      icon: "✂️",
      checkpoint: true,
      hint: "Keep dividing until every section has just one element.",
      codeExplanation:
        `middle = floor((${left} + ${right}) / 2) = ${middle}.`
    });

    mergeSort(left, middle, depth + 1);
    mergeSort(middle + 1, right, depth + 1);

    merge(left, middle, right);
  }

  function merge(left, middle, right) {
    const leftPart = array.slice(left, middle + 1);
    const rightPart = array.slice(middle + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    const mergedIndices = Array.from(
      { length: right - left + 1 },
      (_, index) => left + index
    );

    addStep({
      line: 4,
      comparing: [],
      sorted: [],
      title: "Time to merge",
      explanation:
        `We now have two sorted sections: [${leftPart.join(", ")}] and [${rightPart.join(", ")}]. Our job is to combine them into one sorted section.`,
      next: "Compare the first remaining elements of both sections.",
      label: `MERGING · ${left}–${right}`,
      icon: "🔗",
      checkpoint: true,
      hint: "Both sections are already sorted individually.",
      codeExplanation:
        `Create two temporary arrays: left = [${leftPart.join(", ")}], right = [${rightPart.join(", ")}].`
    });

    while (i < leftPart.length && j < rightPart.length) {
      comparisons++;

      addStep({
        line: 5,
        comparing: [left + i, middle + 1 + j],
        sorted: [],
        title: "Compare the front elements",
        explanation:
          `Compare ${leftPart[i]} from the left section with ${rightPart[j]} from the right section. The smaller value should come next in the merged section.`,
        next:
          leftPart[i] <= rightPart[j]
            ? `${leftPart[i]} is smaller or equal, so it will be placed next.`
            : `${rightPart[j]} is smaller, so it will be placed next.`,
        label: `MERGING · ${left}–${right}`,
        icon: "⚖️",
        hint: "Only compare the first unprocessed element from each section.",
        codeExplanation:
          `${leftPart[i]} ${leftPart[i] <= rightPart[j] ? "<=" : ">"} ${rightPart[j]}. Comparison ${comparisons}.`
      });

      if (leftPart[i] <= rightPart[j]) {
        array[k] = leftPart[i];

        addStep({
          line: 6,
          comparing: [],
          swapping: [k],
          sorted: Array.from(
            { length: k - left + 1 },
            (_, index) => left + index
          ),
          title: `Place ${leftPart[i]} into the merged section`,
          explanation:
            `${leftPart[i]} is the smaller value, so we place it at index ${k} in the original array. The merged section grows by one element.`,
          next: "Compare the next available elements.",
          label: `MERGING · ${left}–${right}`,
          icon: "📥",
          hint: "The highlighted element has been written into its new position.",
          codeExplanation:
            `array[${k}] = ${leftPart[i]}. Move the left pointer forward.`
        });

        i++;
      } else {
        array[k] = rightPart[j];

        addStep({
          line: 6,
          comparing: [],
          swapping: [k],
          sorted: Array.from(
            { length: k - left + 1 },
            (_, index) => left + index
          ),
          title: `Place ${rightPart[j]} into the merged section`,
          explanation:
            `${rightPart[j]} is smaller, so we place it at index ${k}. The merged section now contains one more sorted element.`,
          next: "Compare the next available elements.",
          label: `MERGING · ${left}–${right}`,
          icon: "📥",
          hint: "The highlighted element has been written into its new position.",
          codeExplanation:
            `array[${k}] = ${rightPart[j]}. Move the right pointer forward.`
        });

        j++;
      }

      k++;
    }

    while (i < leftPart.length) {
      array[k] = leftPart[i];

      addStep({
        line: 7,
        comparing: [],
        swapping: [k],
        sorted: Array.from(
          { length: k - left + 1 },
          (_, index) => left + index
        ),
        title: "Append remaining left elements",
        explanation:
          `The right section has been exhausted. The remaining left elements are already sorted, so we can append ${leftPart[i]} directly.`,
        next: "Continue appending the remaining elements.",
        label: `MERGING · ${left}–${right}`,
        icon: "📥",
        hint: "No more comparisons are needed for the remaining elements.",
        codeExplanation:
          `array[${k}] = ${leftPart[i]}. Append the remaining left element.`
      });

      i++;
      k++;
    }

    while (j < rightPart.length) {
      array[k] = rightPart[j];

      addStep({
        line: 7,
        comparing: [],
        swapping: [k],
        sorted: Array.from(
          { length: k - left + 1 },
          (_, index) => left + index
        ),
        title: "Append remaining right elements",
        explanation:
          `The left section has been exhausted. We append the remaining right element ${rightPart[j]} directly because its section is already sorted.`,
        next: "Continue until every element has been merged.",
        label: `MERGING · ${left}–${right}`,
        icon: "📥",
        hint: "The remaining elements are already in sorted order.",
        codeExplanation:
          `array[${k}] = ${rightPart[j]}. Append the remaining right element.`
      });

      j++;
      k++;
    }

    pass++;

    addStep({
      line: 7,
      comparing: [],
      sorted: mergedIndices,
      title: "Merge completed!",
      explanation:
        `The section from index ${left} to ${right} is now sorted: [${array.slice(left, right + 1).join(", ")}]. This sorted section can now be merged with another sorted section.`,
      next:
        left === 0 && right === array.length - 1
          ? "The entire array is now sorted!"
          : "Return to the previous recursive call and merge the larger sections.",
      label: `MERGE ${pass} COMPLETE`,
      icon: "✅",
      checkpoint: true,
      hint: "Notice how small sorted sections gradually become larger sorted sections.",
      codeExplanation:
        `The merged section [${left}...${right}] is sorted. Completed merges: ${pass}.`
    });
  }

  mergeSort(0, array.length - 1);

  addStep({
    line: 7,
    comparing: [],
    swapping: [],
    sorted: array.map((_, index) => index),
    title: "Array completely sorted!",
    explanation:
      "Every recursive section has been merged back together. The entire array is now sorted in ascending order. That's Merge Sort: divide the problem, solve smaller sections, and combine the results.",
    next: "Try another array or replay the visualization.",
    label: "COMPLETED",
    icon: "🏆",
    done: true,
    hint: "You've just watched the complete divide-and-conquer process!",
    codeExplanation:
      `Sorting complete. ${comparisons} comparisons and ${pass} merge operations were performed.`
  });

  return steps;
}

createVisualizer({
  generateSteps,
  initialArray
});
