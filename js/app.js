
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const previewBars = document.querySelectorAll("#previewBars .bar");

if (previewBars.length) {
  const values = Array.from(previewBars).map((bar) =>
    Number.parseFloat(bar.style.height)
  );

  let index = 0;

  const animatePreview = () => {
    previewBars.forEach((bar, i) => {
      bar.classList.remove("active");
      bar.style.height = `${values[i]}%`;
    });

    const current = index % (previewBars.length - 1);
    const next = current + 1;

    previewBars[current].classList.add("active");
    previewBars[next].classList.add("active");

    if (values[current] > values[next]) {
      const temp = values[current];
      values[current] = values[next];
      values[next] = temp;
    }

    previewBars[current].style.height = `${values[current]}%`;
    previewBars[next].style.height = `${values[next]}%`;

    index++;

    if (index >= previewBars.length - 1) {
      index = 0;
      values.sort(() => Math.random() - 0.5);
    }
  };

  animatePreview();
  setInterval(animatePreview, 1100);
}
