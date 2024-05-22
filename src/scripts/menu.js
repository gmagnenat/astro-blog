const menuButton = document.getElementById('navbar-burger');
menuButton?.addEventListener('click', () => {
  [...document.querySelectorAll('.navbar-menu')].forEach((Element) => {
    Element.classList.toggle("hidden");
});
});