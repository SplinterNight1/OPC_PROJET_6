const header = document.querySelector('header');
const main = document.getElementById('main');


// la modale sera définie par la cible du lien permettant d'interagir avec elle
let modale = null;
// ces éléments seront calculés une fois la modale ouverte
let focusableSelector;
let focusableElement = [];
let previouslyFocusedElement = null;
// arrayMods est un tableau qui contiendra la liste des travaux affichés dans la modale (Mods correspond à "modifiables", car ces travaux sont ceux que l'on peut supprimer)
let arrayMods;
// destroyGalleryFigure sera définie lors de la création du catalogue dans la modale
let destroyGalleryFigure;

function UserIsLogged(){
  const userToken = localStorage.getItem('token')
  return userToken;
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    destroyloginError();
    getFormInfo();
    console.log("Form submitted without page refresh!");
  });



});


//--------------------------------
// ---------- WORKS --------------
//Categories json
var works = [];
document.addEventListener('DOMContentLoaded', function () {

  // Get references to the button and modal elements
  var picAddBtn = document.querySelector('#picAddBtn');
  var modal2 = document.querySelector('.modale2');
  var modal1 = document.querySelector('.Modal1');

  // Add a click event listener to the button
  picAddBtn.addEventListener('click', function () {
    // Remove the "display: none" style from modale2
    modal2.style.display = 'block'; // You can use 'flex', 'grid', or any other valid display value as needed
    modal1.style.display = 'none'; // You can use 'flex', 'grid', or any other valid display value as needed
  });


  const apiUrl = 'http://localhost:5678/api/works';
  const projectsContainer = document.getElementById('projects-container');
  const filterButtonsContainer = document.querySelector('.filters');
  const categoryFiguresContainer = document.querySelector('.category-figures');

  const categories = new Set();

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      works = data; // Assign works here

      data.forEach((project) => {
        categories.add(project.category.name);
      });

      // Clear previous filter buttons and category figures
      filterButtonsContainer.innerHTML = '';
      categoryFiguresContainer.innerHTML = '';

      categories.add('noFilter'); // Add 'noFilter' as a category
      if (!UserIsLogged()){
        //if user not logged create filter buttons
        console.log(categories)
        categories.forEach((category) => {
          // Create a figure for each category
          const categoryFigure = document.createElement('figure');
          const categoryImg = document.createElement('img');
          const categoryFigcaption = document.createElement('figcaption');
  
          // Set image source, alt, and category name
          categoryImg.src = 'path-to-category-image'; // Replace with actual image path
          categoryImg.alt = category;
          categoryFigcaption.textContent = category;
  
          categoryFigure.appendChild(categoryImg);
          categoryFigure.appendChild(categoryFigcaption);
          // categoryFiguresContainer.appendChild(categoryFigure);
  
          // Add category filter buttons
          const button = document.createElement('button');
          button.classList.add('filterButton');
          button.id = category;
          if ( category == "noFilter"){
            button.textContent = "Tous";
          }else{
            button.textContent = category;
          }
          button.addEventListener('click', () => filterProjectsByCategory(category));
          filterButtonsContainer.appendChild(button);
        });
  
      }
    
      // Append project figures
      data.forEach((project) => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');
        const projectId = project.id;
        figure.classList.add(`gallery-figure-${projectId}`)
        img.src = project.imageUrl;
        img.alt = project.title;
        figcaption.textContent = project.title;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        figure.dataset.categoryName = project.category.name;
        projectsContainer.appendChild(figure);
      });
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
});

function filterProjectsByCategory(category) {
  const projects = document.querySelectorAll('.gallery figure');

  projects.forEach((project) => {
    const projectCategory = project.dataset.categoryName;

    if (category === 'noFilter' || category === projectCategory) {
      project.style.display = 'block';
    } else {
      project.style.display = 'none';
    }
  });
}

const projectsContainer = document.getElementById('projects-container-modal');

function deleteHtmlElements(projectId) {
  
  // Select and remove HTML elements with the specified class name
  const elementsToDelete = document.querySelectorAll(`.gallery-figure-${projectId}`);
  elementsToDelete.forEach(element => {
    element.remove();
    console.log("deleted", `.gallery-figure-${projectId}`)

  });
}

// Add a click event listener to the container
projectsContainer.addEventListener('click', function (event) {
  // Check if the clicked element is a trash button
  if (event.target.matches('.trashButtonModalWork i')) {
      // Prevent the default behavior of the link
      event.preventDefault();

      // Get the ID from the clicked trash button
      const trashButtonId = event.target.closest('.trashButtonModalWork').querySelector('a').id;

      // Extract the project ID from the trash button ID
      const projectId = trashButtonId.split('-')[1];
      const userToken = localStorage.getItem('token')
      if (userToken) {
        // SEND DELETION REQUEST TO REST API
        console.log('Clicked on trash button for project with ID:', projectId);
        fetch(`http://localhost:5678/api/works/${projectId}`, {
          method: 'DELETE',
            headers: {
              'Accept': '*/*',
              Authorization: `Bearer ${userToken}`,
            },
        })
        .then(response => {
          if (response.status !== 204) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }else{
            deleteHtmlElements(projectId);
          }
          // Handle successful response, if needed
        })
        .catch(error => {
          console.error('Error:', error);
        });
      } 
    
  }
});

//--------------------------------
// ---------- ADMIN UI --------------
function createAdminHeaderNav() {
  if ( UserIsLogged()){
    header.className = 'header';
    const editBanner = document.createElement('section');
    editBanner.setAttribute('id', 'editBanner');
    editBanner.className = 'editBanner';
    // editBanner.style.display = 'none';
    editBanner.innerHTML = `   <p class="editBannerButton"> 
          <i class="fa fa-light fa-pen-to-square"></i> 
          Mode Edition</p>
      `;
  
    const head = document.head || document.getElementsByTagName('head')[0];
    const childToInsertBefore = header.querySelector('.titleAndNav'); // Replace 'someChildElementId' with the actual child's ID
    head.parentNode.insertBefore(editBanner, head.nextSibling);

    // header.insertBefore(editBanner, childToInsertBefore);
  }
}

// on crée des listeners pour chaque lien permettant d'ouvrir la modale
function addEventListeners() {
  document.querySelectorAll('.openModal').forEach((a) => {
    console.log("opened")
    a.addEventListener('click', openModal);
  });
}

function insertProjectsIntoModal(){
  const categories = new Set();

  const projects = works;
  const filterButtonsContainer = document.querySelector('.filters');
  const projectsContainer = document.getElementById('projects-container-modal');

  const categoryFiguresContainer = document.querySelector('.category-figures');
  projects.forEach((project) => {
    categories.add(project.category.name);
  });
  console.log("works", works)

  // Clear previous filter buttons and category figures
  filterButtonsContainer.innerHTML = '';
  categoryFiguresContainer.innerHTML = '';
  // Append project figures
  projects.forEach((project) => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    const figcaption = document.createElement('figcaption');
    const projectId = project.id;
    const editBanner = document.createElement('section');

    figure.innerHTML = `
      <div class="trashButtonModalWork">
        <a href="#" id="trashButton-${projectId}">
        <i class="fa fa-light fa-trash-can" aria-hidden="true"></i>
        </a>
      </div>
    `;

    figure.classList.add(`gallery-figure-${projectId}`)
    img.src = project.imageUrl;
    img.alt = project.title;
    img.classList.add("modalImage")
    figure.classList.add("figure-work")
    figcaption.textContent = project.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    figure.dataset.categoryName = project.category.name;
    projectsContainer.appendChild(figure);

  });
    
}

// on déclare la fonction d'ouverture de la modale
function openModal(e) {
  insertProjectsIntoModal(works);

  const modal = document.getElementById('modal');
  const openModalBtn = document.getElementById('editWorksBtn');
  const closeModalBtn = document.querySelector('.closeModal');
  const modalWrapper = document.querySelector('.modal-wrapper');

  function openModal() {
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  addWorkListener();
  // Ouvre la Modal au clic sur le bouton Modifier
  openModalBtn.addEventListener('click', openModal);

  // Ferme la Modal au clic sur le bouton Fermer
  closeModalBtn.addEventListener('click', closeModal);

  // Ferme la Modal si on clique en dehors de celle-ci
  window.addEventListener('click', function (event) {
    if (event.target === modalWrapper) {
      closeModal();
    }
  });
}

function closeModalAfterAddingWork() {
  console.log("added")
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}



//SHOW MODIF BUTTON ON CATEGORIES
function createAdminEditButtonOnProjectsTitle() {
  if ( UserIsLogged()){
    const editBanner = document.createElement('div');
    editBanner.innerHTML = `
      <p id="editWorksBtn" class="editWorksBtn" style="">
        <a href="#modale" class="openModal">
          <i class="fa  fa-pen-to-square" aria-hidden="true"></i> 
          modifier 
        </a>
      </p>
    `;
    
    const parentElement = document.querySelector('.myProjectsTitle'); // Replace 'myProjectsTitle' with the actual ID of the parent element
    
    // Ajoute editBanner comme enfant de l'élément parent
    parentElement.appendChild(editBanner);
  }
}

//SHOW MODIF BUTTON ON CATEGORIES
function changeLoginToLogout() {
    const parentElement = document.querySelector('.navbar-ul');
    if (UserIsLogged()) {
      console.log('UserIsLogged', UserIsLogged())
      // If user is logged in, create a "logout" link
      const logoutLink = document.createElement('li');
      logoutLink.innerHTML = `
        <p id="logout-btn">logout</p>
      `;
  
      // Replace the existing "login" link with the "logout" link
      const loginLink = parentElement.querySelector('.login-a');
      console.log("loginLink", loginLink)
      if (loginLink) {
        parentElement.replaceChild(logoutLink, loginLink);
      }
    }
}


  
const showAdminHeaderNav = function () {
    // isLoggedIn();
    header.style.display = null;
};

function load() {
    console.log("load")
    // createPortfolio();
    changeLoginToLogout();
    createAdminHeaderNav();
    createAdminEditButtonOnProjectsTitle();
    showAdminHeaderNav();
    addEventListeners();
    // createIntro();
    // createContact();
    // addProfilePicModifierBtn();
    // isLoggedIn();
}
load();


// ---------- LOGIN --------------

createLogin();

async function createLogin() {
  const loginSection = document.createElement('section');
  loginSection.className = 'loginSection';
  loginSection.setAttribute('id', 'loginSection');
  loginSection.style.display = 'none';

  const loginH2 = document.createElement('h2');
  loginH2.innerText = 'Log-In';

  const loginForm = document.createElement('form');
  loginForm.className = 'loginForm';
  loginForm.setAttribute('id', 'loginForm');
  loginForm.setAttribute('method', 'POST');

  const loginEmailText = document.createElement('label');
  loginEmailText.innerText = 'E-mail';

  const loginId = document.createElement('input');
  loginId.id = 'idInput';
  loginId.className = 'loginInput';
  loginId.setAttribute('type', 'email');
  loginId.setAttribute('name', 'emailId');

  const loginPwdText = document.createElement('label');
  loginPwdText.innerText = 'Mot de Passe';

  const loginPwd = document.createElement('input');
  loginPwd.id = 'pwdInput';
  loginPwd.className = 'loginInput';
  loginPwd.setAttribute('type', 'password');
  loginPwd.setAttribute('name', 'pwdId');

  const loginSubmit = document.createElement('input');
  loginSubmit.id = 'loginSubmit';
  loginSubmit.class = 'loginSubmit';
  loginSubmit.setAttribute('value', 'Se Connecter');
  loginSubmit.setAttribute('type', 'submit');

  const forgotPwd = document.createElement('p');
  forgotPwd.className = 'forgotPwd';
  forgotPwd.setAttribute('id', 'forgotPwd');
  forgotPwd.innerHTML = `
        <a href="#" class="forgotPwdLink">
            Mot de passe oublié
        </a>
    `;

  main.appendChild(loginSection);

  loginSection.appendChild(loginH2);
  loginSection.appendChild(loginForm);
  loginForm.appendChild(loginEmailText);
  loginForm.appendChild(loginId);
  loginForm.appendChild(loginPwdText);
  loginForm.appendChild(loginPwd);
  loginForm.appendChild(loginSubmit);
  loginSection.appendChild(forgotPwd);

  // const loginFormulaire = document.getElementById('loginForm');
  
  // loginFormulaire.addEventListener('submit', function (event) {
  //   event.preventDefault();
  //   destroyloginError();
  //   getFormInfo();
  // });
}


// affichage du formulaire de connexion, annihilation de la page d'accueil
const showLogin = function () {
  exterminate();
  const loginSection = document.getElementById('loginSection');
  loginSection.style.display = null;
};

//  on "none" le display du catalogue, de l'intro et des contacts
function exterminate() {
  catalogue.style.display = 'none';
  introduction.style.display = 'none';
  contact.style.display = 'none';
  // console.log("DoctOOOOr");
}

// on display "none" le formulaire de connexion, à condition que celui-ci existe
function destroyLogin() {
  const loginSection = document.querySelector('.loginSection');
  if (loginSection == null) {
    return;
  } else {
    loginSection.style.display = 'none';
  }
}

async function redirectToMainPage(){
    window.location.href = 'index.html';
}
async function getFormInfo() {
  const loginFormulaire = document.getElementById('loginForm');
  const loginIdSent = loginFormulaire.querySelector(
    'input[name="emailId"]'
  ).value;
  const pwdIdSent = loginFormulaire.querySelector('input[name="pwdId"]').value;

  const jsonLogin = {
    email: loginIdSent,
    password: pwdIdSent,
  };

  const serverLoginAccess = await fetch('http://localhost:5678/api/users/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(jsonLogin),
  });

  const serverLoginResponse = await serverLoginAccess.json();
  const serverLoginStatus = serverLoginAccess.status;

  if (serverLoginStatus == 200) {
    localStorage.setItem('token', serverLoginResponse.token);
    console.log(serverLoginResponse)
    redirectToMainPage();
  } else {
    const loginError = document.createElement('p');
    // if (loginAttempt < 10) {
        loginError.innerText = `L'utilisateur n'existe pas ou mot de passe invalide, vérifiez votre adresse email et votre mot de passe.`;
    // } else {
    //   loginError.innerText = `Trop de tentatives de connexion.`;
    //   showMainPage();
    // }
    loginError.className = 'loginError';
    loginError.setAttribute('id', 'loginError');
    const loginSection = document.getElementById('loginSection');
    loginSection.appendChild(loginError);
  }
}

// on utilisera cette fonction pour retirer le message d'erreur de connexion
function destroyloginError() {
  const loginError = document.getElementById('loginError');
  if (loginError != null) {
    loginError.remove();
  }
}

// INTRO

// Dans cette partie on crée et display l'introduction de Sophie Bluel
function createIntro() {
  const introduction = document.querySelector('#introduction');

  const introDiv = document.createElement('div');
  introDiv.className = 'introDiv';

  const profilePic = document.createElement('figure');
  profilePic.setAttribute('id', 'profilePic');
  profilePic.className = 'profilePic';
  profilePic.innerHTML = `<img src="./assets/images/sophie-bluel.png" alt="Portrait de Sophie Bluel en extérieur.">`;

  const presentation = document.createElement('article');
  presentation.innerHTML = `
            <h2>Designer d'espace</h2>
            <p>Je raconte votre histoire, je valorise vos idées. Je vous accompagne de la conception à la livraison finale du chantier.</p>
            <p>Chaque projet sera étudié en commun, de façon à mettre en valeur les volumes, les matières et les couleurs dans le respect de l’esprit des lieux et le choix adapté des matériaux. Le suivi du chantier sera assuré dans le souci du détail, le respect du planning et du budget.</p>
            <p>En cas de besoin, une équipe pluridisciplinaire peut-être constituée : architecte DPLG, décorateur(trice)</p>
            `;
  introduction.appendChild(introDiv);
  introDiv.appendChild(profilePic);
  introDiv.appendChild(presentation);
}
const showIntro = function () {
  const introduction = document.querySelector('#introduction');
  introduction.style.display = null;
};

// CONTACT

// On crée et affiche le formulaire de contact. Aucune action pour l'instant
function createContact() {
  contact.innerHTML = `<h2 id="contactTest">Contact </h2>
<p>Vous avez un projet ? Discutons-en !</p>
<form action="#" method="post">
    <label for="name">Nom</label>
    <input type="text" name="name" id="name">
    <label for="email">Email</label>
    <input type="email" name="email" id="email">
    <label for="message">Message</label>
    <textarea name="message" id="message" cols="30" rows="10"></textarea>
    <input type="submit" value="Envoyer">
</form>`;
  document.getElementById('contact').style.display = 'inherit';
}

const showContact = function () {
  contact.style.display = null;
};

// FOOTER

// le footer n'interagit pour l'instant avec rien, il s'agit donc d'un simple code HTML
document.querySelector('footer').innerHTML = `<nav>
<ul>
    <li id="mentionsLegales">Mentions Légales</li>
</ul>
</nav>`;

// éléments d'ADMIN

// ajout d'un bouton permettant l'édition de la photo de profil (pour l'instant ce bouton ouvre la modale, il pourra être modifié dans un prochain sprint)
function addProfilePicModifierBtn() {
  const editProfilePicPrompt = document.createElement('div');
  editProfilePicPrompt.innerHTML = `<p class="editProfilePicInnerText"><a href="#modale" class="openModal">
        <i class="fa fa-light fa-pen-to-square"></i> 
        modifier </a></p>
        `;
  editProfilePicPrompt.setAttribute('id', 'editProfilePicPrompt');
  editProfilePicPrompt.className = 'editProfilePicPrompt';
  const introSection = document.getElementById('introduction');
  introSection.appendChild(editProfilePicPrompt);
}

// cette fonction est appelée lorsqu'on se déconnecte, elle cache tous les éléments liés à l'édition de la page
function destroyEditPage() {
  editBanner.style.display = 'none';
  const editProfilePicPrompt = document.getElementById('editProfilePicPrompt');
  const editWorksPrompt = document.getElementById('editWorksBtn');

  if (editWorksPrompt != null && editProfilePicPrompt != null) {
    if (
      editProfilePicPrompt.style.display != 'none' ||
      editWorksPrompt.style.display != 'none'
    ) {
      editProfilePicPrompt.style.display = 'none';
      editWorksPrompt.style.display = 'none';
      // console.log("profilePicPrompt détruit avec succès.");
    }
  }
}

// cette fonction est appelée si l'utilisateur est connecté, elle montre tous les éléments liés à l'édition de la page
function showEditPage() {
  editBanner.style.display = null;
  const editProfilePicPrompt = document.getElementById('editProfilePicPrompt');
  const editWorksPrompt = document.getElementById('editWorksBtn');

  editProfilePicPrompt.style.display = null;
  editWorksPrompt.style.display = null;
}




    //VERIFY FORM MODAL FOR ADDING PHOTO


    // Sélectionnez les éléments du formulaire
    var titleInput = document.querySelector('.addWorkTitle');
    var categorySelect = document.querySelector('.selectCategory');
    var confirmButton = document.getElementById('button-confirm-add-work');

    // Ajoutez des écouteurs d'événements pour les changements dans les champs
    titleInput.addEventListener('input', checkFields);
    categorySelect.addEventListener('change', checkFields);

    function checkFields() {
      console.log("ex")
      // Vérifiez si tous les champs sont remplis
      var titleValue = titleInput.value.trim();
      var categoryValue = categorySelect.value.trim();

      if (titleValue !== '' && categoryValue !== '') {
        // Si tous les champs sont remplis, changez la couleur du bouton en vert
        confirmButton.classList.remove("button-confirm-add-work");
        confirmButton.classList.add("valid-button-confirm-add-work");
        const errorDiv = document.querySelector(".error-message-modal");
        errorDiv.remove();
      } else {
        //add error message
        const errorDiv = document.querySelector(".error-message-modal");
        if (errorDiv.hasChildNodes()) {
        } else {
          const errorMessage = document.createElement('div');
          errorMessage.innerHTML = `<p style="color: red; margin-top: 12px;"> Veuillez remplir tous les champs<p>`;
          errorDiv.appendChild(errorMessage);
        }

        confirmButton.classList.add("button-confirm-add-work");
        confirmButton.classList.remove("valid-button-confirm-add-work");
      }
    }

    //SHOW IMAGE IN MODAL WHEN LOADED IN INPUT
      var imageInput = document.getElementById('imageInput');
      var dropzone = document.getElementById('dropzone');
      
      // Ajoutez un écouteur d'événement pour le changement de fichier
      imageInput.addEventListener('change', displayImage);
  
      function displayImage() {
        var file = imageInput.files[0];
      
        // Check if a file has been selected
        if (file) {
          // Create an object URL for the file
          var imageURL = URL.createObjectURL(file);
      
          // Create an image element and assign the URL
          var imgElement = document.createElement('img');
          imgElement.style = "width: 100%; height: 100%;"
          imgElement.src = imageURL;
      
          // Append the image to the dropzone
          // dropzone.innerHTML = ''; // Clear the existing content of the dropzone
            // Clear specific child elements in the dropzone
          var children = Array.from(dropzone.children);
          children.forEach(function (child) {
           child.style.display = "none";
          });
          dropzone.appendChild(imgElement);
     
        } else {
          // // Clear the dropzone if no file is selected
          // dropzone.innerHTML = '';
        }
      }

  // //HANDLE CLICK OUTSIDE MODAL
  // document.addEventListener("click", function (event) {
  //   var modal = document.querySelector("#modal");
  //   var modalWrapper = document.querySelector(".modal-wrapper");

  //   console.log("click", event)
  //   var modalStyle = window.getComputedStyle(modal);
  //   //Check if modal is shown and Check if the clicked element is outside the modal-wrapper
  //   if (modalStyle.display !== "none" && !modalWrapper.contains(event.target)) {
  //     console.log("show")
  //     // Clicked outside the modal-wrapper, hide the modal
  //     modal.style.display = "none";
  //   }
 
  // });


function createElementAfterAdding(res) {
  console.log("createElementAfterAdding executing ...")
  // recreateForm();
  const newWorkId = res.id;
  const newWorkImg = res.imageUrl;
  const newWorkTitle = res.title;
  const categoryId = res.categoryId;

  const projectsContainer = document.getElementById('projects-container');
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const figcaption = document.createElement('figcaption');
  const projectId = newWorkId;
 
  switch ( categoryId ) {
    case 1:
      figure.dataset.categoryName = "Objets"
      break
    case 2:
      figure.dataset.categoryName = "Appartements"
      break
    case 3:
      figure.dataset.categoryName = "Hotels & restaurants"
      break
  }
  figure.classList.add(`gallery-figure-${projectId}`)
  img.src = newWorkImg;
  img.alt = newWorkTitle;
  figcaption.textContent = newWorkTitle;
  figure.appendChild(img);
  figure.appendChild(figcaption);
  projectsContainer.appendChild(figure);

  showMainModale();
}

function addNewWork(event) {
  event.preventDefault();

  //check if validate button is green or not
  
  var confirmButton = document.getElementById('button-confirm-add-work');
  if (confirmButton.classList.contains("valid-button-confirm-add-work")){

    console.log("execute")
    const addWorkForm = document.querySelector('.add-work-form');
    const formData = new FormData(addWorkForm);
    console.log("image", formData); // Log the file data

    const userToken = localStorage.getItem('token')
    if ( userToken ){
      fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: 'application/json',
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          closeModalAfterAddingWork()
          return response.json()
        })  
        .then((response) => createElementAfterAdding(response))
    } 
  }
}

 // on écoute le submit du formulaire
function addWorkListener() {
  console.log("ccc")
  const addWorkForm = document.querySelector('.add-work-form');
  addWorkForm.addEventListener('submit', addNewWork);
}

//MODAL ADD PHOTO
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Get references to the button and modal elements
  var picAddBtn = document.getQuerySelector('#picAddBtn');
  var modale2 = document.getQuerySelector('.modale2');

  // Add a click event listener to the button
  picAddBtn.addEventListener('click', function () {
    // Remove the "display: none" style from modale2
    modale2.style.display = 'block'; // You can use 'flex', 'grid', or any other valid display value as needed
  });
});



//DETECT CLICK OUTSIDE MODAL
document.addEventListener('click', function (event) {
  // Get references to the modal and modal wrapper elements
  var modal = document.getElementById('modal');
  
  var modalWrapper = document.querySelector('.modal-wrapper.modal-stop');
  // Check if the modal is visible and the clicked element is not inside the modal or a child of modal-wrapper modal-stop
  // Prevent closing when clicking on the button that opens the modal
  console.log(event.target.classList.contains('openModal'))
  if (!event.target.classList.contains('openModal') && modal.style.display !== 'none' && !modalWrapper.contains(event.target)) {
    console.log("clicked active")
    
    // Hide the modal by adding the "display: none" style
    modal.style.display = 'none';
  }
});

document.getElementById('logout-btn').addEventListener('click', function() {
  console.log("logout")
  // Remove token from localStorage
  localStorage.removeItem('token'); // Replace 'yourTokenKey' with the actual key used for your token

  // Refresh the page
  location.reload();
});