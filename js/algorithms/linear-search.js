
import { createSearchVisualizer } from "../search-core.js";

const initialArray = [42, 18, 65, 23, 9, 51, 34, 76];
const initialTarget = 23;

function generateSteps(input, target) {
  const array = [...input];
  const steps = [];

  let comparisons = 0;
  const checkedIndices = [];

  function addStep({
    activeIndex = null,
    foundIndex = null,
    notFound = false,
    line = 1,
    title,
    explanation,
    next,
    label,
    icon = "🔍",
    checkpoint = false,
    done = false,
    hint,
    codeExplanation
  }) {
    steps.push({
      array: [...array],
      activeIndex,
      foundIndex,
      notFound,
      checkedIndices: [...checkedIndices],
      comparisons,
      line,
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
    title: "Let's find your target",
    explanation:
      `We need to find ${target} in this array. Linear Search starts at the first element and checks each value one by one.`,
    next: "Start with the element at index 0.",
    label: "STEP 1",
    icon: "🎯",
    checkpoint: true,
    hint: "The order of the array doesn't matter for Linear Search.",
    codeExplanation:
      `We are searching for target = ${target}. Initialize the index i = 0.`
  });

  for (let i = 0; i < array.length; i++) {
    comparisons++;
    checkedIndices.push(i);

    const found = array[i] === target;

    addStep({
      activeIndex: i,
      foundIndex: found ? i : null,
      line: 2,
      title: found
        ? "Target found!"
        : `Checking index ${i}`,
      explanation: found
        ? `The current element is ${array[i]}, which matches the target ${target}. We have found the first occurrence of the target at index ${i}.`
        : `The current element is ${array[i]}, but our target is ${target}. They do not match, so we move to the next index.`,
      next: found
        ? `The target is at index ${i}. Linear Search can stop now.`
        : i === array.length - 1
          ? "There are no more elements to check. The target is not present."
          : `Move to index ${i + 1} and compare the next element.`,
      label: `COMPARISON ${comparisons}`,
      icon: found ? "🎉" : "🔎",
      checkpoint: true,
      done: found,
      hint: found
        ? "The first matching element has been found."
        : "Compare the current value with the target before moving forward.",
      codeExplanation:
        `arr[${i}] = ${array[i]} ${found ? "===" : "!=="} ${target}.`
    });

    if (found) {
      return steps;
    }
  }

  addStep({
    line: 3,
    notFound: true,
    title: "Target not found",
    explanation:
      `We checked all ${array.length} elements, but none matched ${target}. Linear Search has reached the end of the array without finding the target.`,
    next: "Try another target or change the array and search again.",
    label: "SEARCH COMPLETE",
    icon: "🔍",
    done: true,
    hint: "A complete search with no match means the target is absent.",
    codeExplanation:
      `The loop finished without finding arr[i] === ${target}. Return -1.`
  });

  return steps;
}

createSearchVisualizer({
  generateSteps,
  initialArray,
  initialTarget
});
