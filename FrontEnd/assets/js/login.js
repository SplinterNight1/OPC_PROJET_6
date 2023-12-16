const alredyLoggedError = document.querySelector(".alredyLogged__error"); 
const loginEmailError = document.querySelector(".loginEmail__error"); 
const loginMdpError = document.querySelector(".loginMdp__error"); 

const email = document.getElementById("idInput");
const password = document.getElementById("pwdInput");

const submit = document.getElementById("loginSubmit");

alredyLogged();

function alredyLogged() {
    if (localStorage.getItem("token")) {
        localStorage.removeItem("token");

        const p = document.createElement("p");
        p.innerHTML = "<br><br><br>Vous avez été déconnecté, veuillez vous reconnecter";
        alredyLoggedError.appendChild(p);
    }
}

submit.addEventListener("click", () => {
    let user = {
        email: email.value,
        password: password.value
    };
    login(user);
})

function login(id) {
    const loginFormulaire = document.getElementById('loginForm');
    const loginIdSent = loginFormulaire.querySelector(
      'input[name="emailId"]'
    ).value;
    const pwdIdSent = loginFormulaire.querySelector('input[name="pwdId"]').value;
  
    loginEmailError.innerHTML = "";
    loginMdpError.innerHTML = ""; 

    const jsonLogin = {
        email: loginIdSent,
        password: pwdIdSent,
    };
    console.log(jsonLogin)
    fetch('http://192.168.0.34:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(jsonLogin),
    })
    .then(response => response.json())
    .then(result => { 
        console.log(result);
        if (result.error || result.message) {
            const p = document.createElement("p");
            p.innerHTML = "La combinaison e-mail/mot de passe est incorrecte";
            loginMdpError.appendChild(p);

        } else if (result.token) {
            console.log(result.token)
            localStorage.setItem("token", result.token);
            window.location.href = "/index.html";        }
    
    })
    .catch(error => 
        console.log(error));
}
