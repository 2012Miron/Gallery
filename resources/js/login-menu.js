const loginButton = document.getElementById('last');
let loginMenu = document.getElementById('loginmenu');

loginButton.addEventListener('click', function () {
    if (loginMenu.classList.item(1) == 'hide') {
        loginMenu.classList.replace('hide', 'open');
    } else {
        loginMenu.classList.replace('open', 'hide');
    }
});