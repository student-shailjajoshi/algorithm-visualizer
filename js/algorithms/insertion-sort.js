
function generateInsertionSortSteps(input) {
  const array = [...input];
  const steps = [];

  let comparisons = 0;
  let shifts = 0;
  let pass = 0;
  let sorted = [0];

  const codeExplanations = {
    1: "Start at index 1. The first element alone is already sorted.",
    2: "Save the current element as the key. This is the value we want to insert.",
    3: "Set j to the position immediately before the key. We will move backwards through the sorted portion.",
    4: "Check whether j is valid and whether the element at j is greater than the key.",
    5: "Shift the larger element one position to the right. This creates space for the key.",
    6: "Move one position to the left to check the next element.",
    7: "Insert the key into the empty position. The sorted portion now contains one more element."
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
      swaps: shifts,
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
    title: "Let's arrange the array.",
    explanation:
      "Insertion Sort maintains a sorted portion on the left and an unsorted portion on the right. We take one element from the unsorted portion and insert it into its correct position in the sorted portion.",
    next: "The first element is already sorted. Let's select the second element.",
    icon: "✦"
  });

  for (let i = 1; i < array.length; i++) {
    pass++;

    const key = array[i];
    let j = i - 1;

    record({
      line: 1,
      label: `Pass ${pass} begins`,
      title: `Let's insert element ${i}.`,
      explanation:
        `The first ${i} element(s) form our sorted portion. We now take ${key} from the unsorted portion and find its correct position.`,
      next: `Save ${key} as the key.`,
      icon: "↗"
    });

    record({
      line: 2,
      comparing: [i],
      label: "Select the key",
      title: `${key} is our key.`,
      explanation:
        `We temporarily remember ${key}. Think of it like holding a playing card while making room for it in an already sorted hand.`,
      next: "Start checking from the element immediately to its left.",
      icon: "◆"
    });

    record({
      line: 3,
      comparing: [j],
      label: "Set pointer",
      title: `Start at index ${j}.`,
      explanation:
        `The pointer j starts at index ${j}, immediately before the key. We'll move backwards through the sorted portion to find where ${key} belongs.`,
      next: `Check whether ${array[j]} is greater than ${key}.`,
      icon: "←"
    });

    while (j >= 0) {
      comparisons++;

      if (array[j] > key) {
        const shiftedValue = array[j];
        const oldIndex = j;

        record({
          line: 4,
          comparing: [j],
          label: "Compare with key",
          title: `${shiftedValue} is greater than ${key}.`,
          explanation:
            `The element ${shiftedValue} is greater than our key ${key}. It cannot stay before the key in ascending order, so it needs to move one position to the right.`,
          next: `Shift ${shiftedValue} to index ${j + 1}.`,
          icon: "?"
        });

        array[j + 1] = array[j];
        shifts++;
        j--;

        sorted = Array.from(
          { length: j + 1 },
          (_, index) => index
        );

        record({
          line: 5,
          comparing: [j + 1],
          swapping: [oldIndex, oldIndex + 1],
          label: "Shift element",
          title: `${shiftedValue} moves one position right.`,
          explanation:
            `We copy ${shiftedValue} into index ${oldIndex + 1}. This is a shift, not a swap. The key is being held separately while larger elements make room for it.`,
          next: "Move one position left to check the next element.",
          icon: "→",
          checkpoint: true,
          hint:
            "Notice how the larger element moves right. The key is still waiting to be inserted."
        });

        record({
          line: 6,
          comparing: j >= 0 ? [j] : [],
          label: "Move pointer",
          title: j >= 0
            ? `Move left to index ${j}.`
            : "The pointer has moved before the beginning.",
          explanation: j >= 0
            ? `We moved j from ${oldIndex} to ${j}. The next element is ${array[j]}. We need to check whether it is also greater than ${key}.`
            : `There are no more elements to the left. The key ${key} belongs at the beginning of the array.`,
          next: j >= 0
            ? `Compare ${array[j]} with ${key}.`
            : `Insert ${key} at index 0.`,
          icon: "←"
        });
      } else {
        record({
          line: 4,
          comparing: [j],
          label: "Comparison",
          title: `${array[j]} is not greater than ${key}.`,
          explanation:
            `We compared ${array[j]} with ${key}. Since ${array[j]} is smaller than or equal to the key, it is already in the correct position. The key belongs immediately after it.`,
          next: `Insert ${key} at index ${j + 1}.`,
          icon: "✓"
        });

        break;
      }
    }

    const insertionIndex = j + 1;

    array[insertionIndex] = key;

    sorted = Array.from(
      { length: i + 1 },
      (_, index) => index
    );

    record({
      line: 7,
      comparing: [insertionIndex],
      label: "Insert the key",
      title: `Place ${key} at index ${insertionIndex}.`,
      explanation:
        `We found the correct position. All elements to the left are smaller than or equal to ${key}, while the shifted elements to the right are larger. The key is now inserted.`,
      next: "The sorted portion has grown by one element.",
      icon: "↓",
      checkpoint: true,
      hint:
        "Look at the green section. It has grown by one element and remains sorted."
    });

    record({
      line: 1,
      label: `Pass ${pass} completed`,
      title: `${key} is in its correct position!`,
      explanation:
        `The first ${i + 1} elements are now sorted. We can move to the next element in the unsorted portion.`,
      next: i === array.length - 1
        ? "Every element has been processed. The array is sorted!"
        : `Select the next key, ${array[i + 1]}.`,
      icon: "✓",
      checkpoint: true,
      hint:
        "The sorted portion now includes one more element."
    });
  }

  sorted = array.map((_, index) => index);

  record({
    line: 1,
    label: "Completed",
    title: "The entire array is sorted!",
    explanation:
      "Every element has been inserted into its correct position. The sorted portion now covers the entire array. That's Insertion Sort: select a key, shift larger elements, and insert the key.",
    next: "Try another array or experiment with Explore mode.",
    icon: "🎉",
    done: true
  });

  return steps;
}

const initialArray = [42, 18, 65, 23, 9, 51, 34, 76];

createVisualizer({
  generateSteps: generateInsertionSortSteps,
  initialArray
});
