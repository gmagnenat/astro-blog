const menuButton = document.getElementById("navbar-burger");
const menuContainer = document.getElementById("mobile-menu");
const navbarMenus = document.querySelectorAll(".navbar-menu");
const navbarClose = document.querySelector(".navbar-close");
const body = document.body;

function toggleMenu() {
  navbarMenus.forEach((Element) => {
    Element.classList.toggle("hidden");
  });

  if (menuContainer.classList.contains("hidden")) {
    body.classList.remove("overflow-hidden");
  } else {
    body.classList.add("overflow-hidden");

    // Move focus to the first menu item (a link or a button)
    const firstFocusableElement =
      menuContainer.querySelector("a[href], button");

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  }
}

menuButton?.addEventListener("click", (event) => {
  toggleMenu();
  event.stopPropagation();
});

navbarClose?.addEventListener("click", (event) => {
  toggleMenu();
});

document.addEventListener("click", (event) => {
  if (
    !menuContainer.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    navbarMenus.forEach((Element) => {
      Element.classList.add("hidden");
    });
    body.classList.remove("overflow-hidden");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    navbarMenus.forEach((Element) => {
      Element.classList.add("hidden");
    });
    body.classList.remove("overflow-hidden");
  }
});
