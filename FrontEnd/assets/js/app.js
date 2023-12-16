const header = document.querySelector('header');
const main = document.getElementById('main');


let modale = null;
let focusableSelector;
let focusableElement = [];
let previouslyFocusedElement = null;
let arrayMods;
let destroyGalleryFigure;

function UserIsLogged(){
  const userToken = localStorage.getItem('token')
  return userToken;
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if ( loginForm ){
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      destroyloginError();
      getFormInfo();
    });
  }
});


var works = [];
document.addEventListener('DOMContentLoaded', function () {

  var picAddBtn = document.querySelector('#picAddBtn');
  var modal2 = document.querySelector('.modale2');
  var modal1 = document.querySelector('.Modal1');

  var arrowLeft = document.querySelector('.arrowLeft');
  if ( arrowLeft ){
    arrowLeft.addEventListener('click', function () {
      modal2.style.display = 'none'; 
      modal1.style.display = 'block';
    });
  }


  if ( picAddBtn ){
    picAddBtn.addEventListener('click', function () {
      modal2.style.display = 'block'; 
      modal1.style.display = 'none';
    });
  }

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

      filterButtonsContainer.innerHTML = '';
      categoryFiguresContainer.innerHTML = '';

      categories.add('noFilter');
      if (!UserIsLogged()){
        categories.forEach((category) => {
          const categoryFigure = document.createElement('figure');
          const categoryImg = document.createElement('img');
          const categoryFigcaption = document.createElement('figcaption');
  
          categoryImg.src = 'path-to-category-image'; 
          categoryImg.alt = category;
          categoryFigcaption.textContent = category;
  
          categoryFigure.appendChild(categoryImg);
          categoryFigure.appendChild(categoryFigcaption);
  
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
  
  const elementsToDelete = document.querySelectorAll(`.gallery-figure-${projectId}`);
  elementsToDelete.forEach(element => {
    element.remove();
  });
}

if ( projectsContainer ){
  projectsContainer.addEventListener('click', function (event) {
    if (event.target.matches('.trashButtonModalWork i')) {
        event.preventDefault();
  
        const trashButtonId = event.target.closest('.trashButtonModalWork').querySelector('a').id;
        const projectId = trashButtonId.split('-')[1];
        const userToken = localStorage.getItem('token')
  
        if (userToken) {
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
          })
          .catch(error => {
            console.error('Error:', error);
          });
        } 
      
    }
  });
}


function createAdminHeaderNav() {
  if ( UserIsLogged()){
    header.className = 'header';
    const editBanner = document.createElement('section');
    editBanner.setAttribute('id', 'editBanner');
    editBanner.className = 'editBanner';
    editBanner.innerHTML = `   <p class="editBannerButton"> 
          <i class="fa fa-light fa-pen-to-square"></i> 
          Mode Edition</p>
      `;
  
    const head = document.head || document.getElementsByTagName('head')[0];
    head.parentNode.insertBefore(editBanner, head.nextSibling);
  }
}

function addEventListeners() {
  document.querySelectorAll('.openModal').forEach((a) => {
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

  filterButtonsContainer.innerHTML = '';
  categoryFiguresContainer.innerHTML = '';
  projects.forEach((project) => {
    const projectId = project.id;
    const existingFigure = projectsContainer.querySelector(`.gallery-figure-${projectId}`);

    if (!existingFigure) {
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      const projectId = project.id;
  
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
      figure.appendChild(img);
      figure.dataset.categoryName = project.category.name;
      projectsContainer.appendChild(figure);
  
    }
 
  });
    
}

function openModal(e) {

  resetForm();
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
  openModalBtn.addEventListener('click', openModal);

  closeModalBtn.addEventListener('click', closeModal);

  window.addEventListener('click', function (event) {
    if (event.target === modalWrapper) {
      closeModal();
    }
  });
}

function closeModalAfterAddingWork() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}



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
    
    const parentElement = document.querySelector('.myProjectsTitle');
    
    parentElement.appendChild(editBanner);
  }
}

function changeLoginToLogout() {
    const parentElement = document.querySelector('.navbar-ul');
    if (UserIsLogged()) {
      const logoutLink = document.createElement('li');
      logoutLink.innerHTML = `
        <p id="logout-btn">logout</p>
      `;
  
      const loginLink = parentElement.querySelector('.login-a');
      if (loginLink) {
        parentElement.replaceChild(logoutLink, loginLink);
      }
    }
}


  
const showAdminHeaderNav = function () {
    header.style.display = null;
};

function load() {
    changeLoginToLogout();
    createAdminHeaderNav();
    createAdminEditButtonOnProjectsTitle();
    showAdminHeaderNav();
    addEventListeners();
}
load();

document.addEventListener('DOMContentLoaded', function () {
  createLogin();
});

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

  loginSection.appendChild(loginH2);
  loginSection.appendChild(loginForm);
  loginForm.appendChild(loginEmailText);
  loginForm.appendChild(loginId);
  loginForm.appendChild(loginPwdText);
  loginForm.appendChild(loginPwd);
  loginForm.appendChild(loginSubmit);
  loginSection.appendChild(forgotPwd);

}


const showLogin = function () {
  exterminate();
  const loginSection = document.getElementById('loginSection');
  loginSection.style.display = null;
};

function exterminate() {
  catalogue.style.display = 'none';
  introduction.style.display = 'none';
  contact.style.display = 'none';
}

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
    redirectToMainPage();
  } else {
    const loginError = document.createElement('p');
        loginError.innerText = `L'utilisateur n'existe pas ou mot de passe invalide, vérifiez votre adresse email et votre mot de passe.`;
    loginError.className = 'loginError';
    loginError.setAttribute('id', 'loginError');
    const loginSection = document.getElementById('loginSection');
    loginSection.appendChild(loginError);
  }
}

function destroyloginError() {
  const loginError = document.getElementById('loginError');
  if (loginError != null) {
    loginError.remove();
  }
}

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

document.querySelector('footer').innerHTML = `<nav>
<ul>
    <li id="mentionsLegales">Mentions Légales</li>
</ul>
</nav>`;

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
    }
  }
}

  function showEditPage() {
    editBanner.style.display = null;
    const editProfilePicPrompt = document.getElementById('editProfilePicPrompt');
    const editWorksPrompt = document.getElementById('editWorksBtn');

    editProfilePicPrompt.style.display = null;
    editWorksPrompt.style.display = null;
  }

  var titleInput = document.querySelector('.addWorkTitle');
  var categorySelect = document.querySelector('.selectCategory');

  var confirmButton = document.getElementById('button-confirm-add-work');
  var imageInput = document.getElementById('imageInput');
  var titleInput = document.getElementById('titleInput');
  var selectInput = document.getElementById('selectInput');
  var errorDiv = document.querySelector(".error-message-modal");
  
  if ( imageInput ){
    imageInput.addEventListener('change', checkFields);
  }
  if ( titleInput ){
    titleInput.addEventListener('input', checkFields);
  }
  if ( selectInput ){
    selectInput.addEventListener('change', checkFields);
  }
  
  function checkFields() {
    var imageValue = imageInput.value.trim();
    var titleValue = titleInput.value.trim();
    var selectValue = selectInput.value.trim();
  
    if (imageValue !== '' && titleValue !== '' && selectValue !== '') {
      confirmButton.classList.remove("button-confirm-add-work");
      confirmButton.classList.add("valid-button-confirm-add-work");
      removeErrorMessage();
    } else {
      displayErrorMessage();
      confirmButton.classList.remove("valid-button-confirm-add-work");
      confirmButton.classList.add("button-confirm-add-work");
    }
  }

  function resetForm() {
    imageInput.src = ''; 
    titleInput.value = ''; 
    selectInput.value = ''; 
    confirmButton.classList.remove("valid-button-confirm-add-work");
    confirmButton.classList.add("button-confirm-add-work");

    var dropzone = document.getElementById('dropzone');
    var children = Array.from(dropzone.children);
    children.forEach(function (child) {
      if (child.style.display === 'none') {
        child.style.removeProperty('display');
      }
    });
    var imgShowed = document.querySelector('.imgShowed');
    if (imgShowed) {
      imgShowed.remove();
    }
    var modal1 = document.querySelector('.Modal1');
    var modal2 = document.querySelector('.modale2');
    if (modal1 && modal2) {
      modal1.style.display = 'block';
      modal2.style.display = 'none';
    }
    removeErrorMessage();
  }

  function displayErrorMessage() {
    if (!errorDiv.hasChildNodes()) {
      const errorMessage = document.createElement('div');
      errorMessage.innerHTML = `<p style="color: red; margin-top: 12px;"> Veuillez remplir tous les champs<p>`;
      errorDiv.appendChild(errorMessage);
    }
  }
  
  function removeErrorMessage() {
    if (errorDiv.hasChildNodes()) {
      errorDiv.innerHTML = '';
    }
  }

  var imageInput = document.getElementById('imageInput');
  var dropzone = document.getElementById('dropzone');
  
  if ( imageInput ){
    imageInput.addEventListener('change', displayImage);
  }

  function displayImage() {
    var file = imageInput.files[0];
  
    if (file) {
      var imageURL = URL.createObjectURL(file);
      var imgElement = document.createElement('img');
      imgElement.style = "max-height: 169px;"
      imgElement.src = imageURL;
      imgElement.classList.add("imgShowed");
      var children = Array.from(dropzone.children);
      children.forEach(function (child) {
        child.style.display = "none";
      });
      dropzone.appendChild(imgElement);
  
    }
  }


function createElementAfterAdding(res) {
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

  const figureModal = document.createElement('figure');
  const imgModal  = document.createElement('img');
  const categoryFiguresContainer = document.querySelector('#projects-container-modal');
  if ( categoryFiguresContainer ){
    figureModal.innerHTML = `
    <div class="trashButtonModalWork">
      <a href="#" id="trashButton-${projectId}">
      <i class="fa fa-light fa-trash-can" aria-hidden="true"></i>
      </a>
    </div>
    `; 
    figureModal.classList.add(`gallery-figure-${projectId}`)
    imgModal.classList.add("modalImage")
    imgModal.src = newWorkImg;
    imgModal.alt = newWorkTitle;
    figureModal.classList.add("figure-work")
    figureModal.appendChild(imgModal);
    categoryFiguresContainer.appendChild(figureModal);
  }
}

function addNewWork(event) {
  event.preventDefault();

  var confirmButton = document.getElementById('button-confirm-add-work');
  if (confirmButton.classList.contains("valid-button-confirm-add-work")){

    const addWorkForm = document.querySelector('.add-work-form');
    const formData = new FormData(addWorkForm);

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

function addWorkListener() {
  const addWorkForm = document.querySelector('.add-work-form');
  addWorkForm.addEventListener('submit', addNewWork);
}

document.addEventListener('click', function (event) {
  var modal = document.getElementById('modal');
  var modalWrapper = document.querySelector('.modal-wrapper.modal-stop');

  if (!event.target.classList.contains('openModal') && modal.style.display !== 'none' && !modalWrapper.contains(event.target)) {
    modal.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('token');
      location.reload();
    });
  }
});