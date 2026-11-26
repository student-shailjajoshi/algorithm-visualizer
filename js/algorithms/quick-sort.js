
const initialArray = [42, 18, 65, 23, 9, 51, 34, 76];

function generateSteps(input) {
  const array = [...input];
  const steps = [];

  let comparisons = 0;
  let swaps = 0;
  let pass = 0;

  const sortedPositions = new Set();

  function addStep({
    comparing = [],
    swapping = [],
    line = 1,
    title,
    explanation,
    next,
    label,
    icon = "⚡",
    checkpoint = false,
    done = false,
    hint,
    codeExplanation
  }) {
    steps.push({
      array: [...array],
      comparing: [...comparing],
      swapping: [...swapping],
      sorted: [...sortedPositions].sort((a, b) => a - b),
      comparisons,
      swaps,
      pass,
      line,
      message: explanation,
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
    title: "Meet Quick Sort",
    explanation:
      "Quick Sort uses divide and conquer. It selects a pivot, rearranges the elements around it, and then recursively sorts the sections on either side.",
    next: "Choose a pivot from the array.",
    label: "STEP 1",
    icon: "⚡",
    checkpoint: true,
    hint: "Watch how the pivot separates smaller and larger elements.",
    codeExplanation:
      "We begin by calling quickSort on the entire array."
  });

  function partition(low, high) {
    const pivot = array[high];
    let i = low - 1;

    pass++;

    addStep({
      line: 3,
      comparing: [high],
      title: `Choose pivot: ${pivot}`,
      explanation:
        `The last element of the current section is selected as the pivot. Our pivot is ${pivot} at index ${high}.`,
      next: "Scan the section and move elements smaller than or equal to the pivot to its left.",
      label: `PARTITION ${pass}`,
      icon: "🎯",
      checkpoint: true,
      hint: "The pivot is the reference value for this partition.",
      codeExplanation:
        `pivot = arr[${high}] = ${pivot}. Initially, i = ${low - 1}.`
    });

    for (let j = low; j < high; j++) {
      comparisons++;

      addStep({
        line: 4,
        comparing: [j, high],
        title: "Compare with pivot",
        explanation:
          `Compare ${array[j]} at index ${j} with the pivot ${pivot}. We need to determine whether this element belongs on the left side of the pivot.`,
        next:
          array[j] <= pivot
            ? `${array[j]} is less than or equal to ${pivot}. Move it into the left partition.`
            : `${array[j]} is greater than ${pivot}. Leave it on the right side for now.`,
        label: `PARTITION ${pass}`,
        icon: "⚖️",
        hint: "The highlighted bars show the current element and the pivot.",
        codeExplanation:
          `arr[${j}] = ${array[j]} ${array[j] <= pivot ? "<=" : ">"} ${pivot}.`
      });

      if (array[j] <= pivot) {
        i++;

        if (i !== j) {
          const previous = array[i];
          array[i] = array[j];
          array[j] = previous;
          swaps++;
        }

        addStep({
          line: 5,
          comparing: [i],
          swapping: i !== j ? [i, j] : [],
          title:
            i !== j
              ? "Move element into left partition"
              : "Element already in left partition",
          explanation:
            i !== j
              ? `${array[i]} belongs on the left side of the pivot. It is moved to index ${i}, maintaining the partition boundary.`
              : `${array[i]} is already at the correct side of the partition boundary. No swap is needed.`,
          next: "Continue scanning the remaining elements.",
          label: `PARTITION ${pass}`,
          icon: "↔️",
          hint: "All elements before the partition boundary are smaller than or equal to the pivot.",
          codeExplanation:
            `i becomes ${i}. ${i !== j ? `Swap arr[${i}] and arr[${j}].` : "No swap required."}`
        });
      }
    }

    const pivotIndex = i + 1;

    if (pivotIndex !== high) {
      const previous = array[pivotIndex];
      array[pivotIndex] = array[high];
      array[high] = previous;
      swaps++;
    }

    sortedPositions.add(pivotIndex);

    addStep({
      line: 7,
      swapping: pivotIndex !== high ? [pivotIndex, high] : [],
      title: "Pivot finds its position!",
      explanation:
        `The pivot ${pivot} is now at index ${pivotIndex}. Every element to its left is less than or equal to it, and every element to its right is greater.`,
      next: "The pivot is now in its final sorted position. Recursively sort the left and right sections.",
      label: `PARTITION ${pass} COMPLETE`,
      icon: "📍",
      checkpoint: true,
      hint: "Unlike the other elements, this pivot will never need to move again.",
      codeExplanation:
        `Swap arr[${pivotIndex}] with arr[${high}]. The pivot is now at index ${pivotIndex}.`
    });

    return pivotIndex;
  }

  function quickSort(low, high) {
    if (low > high) {
      return;
    }

    if (low === high) {
      sortedPositions.add(low);

      addStep({
        line: 2,
        comparing: [low],
        title: "Single element section",
        explanation:
          `The section contains only ${array[low]}. A single element is already sorted, so no partitioning is required.`,
        next: "Return to the previous recursive call.",
        label: "BASE CASE",
        icon: "🎯",
        checkpoint: true,
        hint: "Recursion stops when a section has at most one element.",
        codeExplanation:
          "When low >= high, there is nothing left to partition."
      });

      return;
    }

    const pivotIndex = partition(low, high);

    quickSort(low, pivotIndex - 1);
    quickSort(pivotIndex + 1, high);
  }

  quickSort(0, array.length - 1);

  addStep({
    line: 1,
    comparing: [],
    swapping: [],
    title: "Array completely sorted!",
    explanation:
      "Every pivot has reached its final position, and every remaining section has been sorted recursively. Quick Sort has successfully sorted the entire array.",
    next: "Try another array or replay the visualization.",
    label: "COMPLETED",
    icon: "🏆",
    done: true,
    hint: "You've just watched the divide-and-conquer process in action!",
    codeExplanation:
      `Sorting complete. ${comparisons} comparisons and ${swaps} swaps were performed across ${pass} partitions.`
  });

  return steps;
}

createVisualizer({
  generateSteps,
  initialArray
});
