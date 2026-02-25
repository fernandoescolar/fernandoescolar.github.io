/* navbar opacity management */
window.addEventListener('scroll', function(e) {
  if (window.scrollY > 100) {
    document.getElementsByTagName("nav")[0].classList.add("solid");
  } else {
    document.getElementsByTagName("nav")[0].classList.remove("solid");
  }
});

/* hamburger status management: opened or closed */
document.getElementById('hamburger').addEventListener('click', function () {
  const classList = document.getElementsByTagName("nav")[0].classList;
  if (classList.contains('active')) {
    classList.remove('active');
  } else {
    classList.add('active');
  }
});

/* on sumit subscribe form */
const subscribe = document.getElementById('subscribe');
if (subscribe) {
  subscribe.onsubmit= () => {
    window.open('https://feedburner.google.com/fb/a/mailverify?uri=Developerro', 'popupwindow', 'scrollbars=yes,width=550,height=520');
    return true;
  };
}

/* post external links in new tab */
document.querySelectorAll('.post a').forEach(link => {
  if (link.hostname != window.location.hostname) {
    link.target = '_blank';
  }
});

/* theme switcher */
const li = document.createElement('li');
if (localStorage.getItem('light-theme') == 'light-theme') {
  li.innerHTML = `<a style="cursor: pointer"><i id="theme-switch" class="fas fa-toggle-on"></i></a>`;
  document.body.classList.add('light-theme');
} else {
  li.innerHTML = `<a style="cursor: pointer"><i id="theme-switch" class="fas fa-toggle-off"></i></a>`;
}
document.getElementById('nav-options').appendChild(li);

document.getElementById('theme-switch').addEventListener("click", (e) => {
  const a = document.getElementById('theme-switch');
  const darkEnabled = localStorage.getItem('light-theme') != 'light-theme';
  localStorage.setItem('light-theme', darkEnabled ? 'light-theme' : '');
  if (darkEnabled) {
    a.classList.add('fa-toggle-on');
    a.classList.remove('fa-toggle-off');
    document.body.classList.add('light-theme');
  } else {
    a.classList.add('fa-toggle-off');
    a.classList.remove('fa-toggle-on');
    document.body.classList.remove('light-theme');
  }
});
