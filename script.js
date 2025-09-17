// --- Using the config for your NEW project ---
const firebaseConfig = {
    apiKey: "AIzaSyA3h4zVJwDtj4jijmci8MrrXTZ-X_72_8",
    authDomain: "taskflow-9fdd6.firebaseapp.com",
    projectId: "taskflow-9fdd6",
    storageBucket: "taskflow-9fdd6.firebaseapp.com",
    messagingSenderId: "407720335907",
    appId: "1:407720335907:web:872078bf072f14c00df96",
    measurementId: "G-CPMLD1EL0Z"
  };
  // -----------------------------------------------------------------
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // DOM Elements
  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  const loginButton = document.getElementById('login-button');
  const usernameInput = document.getElementById('username-input');
  const userDisplay = document.getElementById('user-display');
  const boardContainer = document.getElementById('board-container');
  
  let currentUsername;
  
  // --- Mock Authentication ---
  loginButton.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      if (username) {
          currentUsername = username;
          userDisplay.innerText = currentUsername;
          
          loginView.classList.add('hidden');
          appView.classList.remove('hidden');
          renderBoard();
      } else {
          alert("Please enter a username.");
      }
  });
  
  
  // --- Board Logic ---
  async function renderBoard() {
      const lists = [
          { id: 'todo', title: 'To Do' },
          { id: 'inprogress', title: 'In Progress' },
          { id: 'done', title: 'Done' }
      ];
  
      boardContainer.innerHTML = '';
  
      for (const list of lists) {
          const listEl = document.createElement('div');
          listEl.className = 'flex-shrink-0 w-72 bg-gray-200 rounded-lg p-3';
          listEl.innerHTML = `
              <h3 class="font-bold mb-3">${list.title}</h3>
              <div class="space-y-3 task-list" id="${list.id}"></div>
              <button class="add-task-btn mt-3 w-full text-left text-gray-600 hover:bg-gray-300 p-2 rounded-md">+ Add a card</button>
          `;
          boardContainer.appendChild(listEl);
  
          const addTaskBtn = listEl.querySelector('.add-task-btn');
          addTaskBtn.addEventListener('click', () => {
              const taskText = prompt('Enter a title for this card:');
              if (taskText && taskText.trim() !== '') {
                  createNewTask(taskText.trim(), list.id);
              }
          });
  
          db.collection('tasks')
              .where('owner', '==', currentUsername) // Using username instead of UID
              .where('status', '==', list.id)
              .orderBy('createdAt')
              .onSnapshot(snapshot => {
                  const taskListEl = listEl.querySelector('.task-list');
                  taskListEl.innerHTML = '';
                  snapshot.forEach(doc => {
                      const task = doc.data();
                      const taskEl = document.createElement('div');
                      taskEl.className = 'task-card bg-white p-3 rounded-md shadow';
                      taskEl.innerText = task.text;
                      taskEl.setAttribute('data-id', doc.id);
                      taskListEl.appendChild(taskEl);
                  });
              });
      }
      initializeDragAndDrop();
  }
  
  function initializeDragAndDrop() {
      document.querySelectorAll('.task-list').forEach(list => {
          new Sortable(list, {
              group: 'tasks',
              animation: 150,
              onEnd: (evt) => {
                  const taskId = evt.item.dataset.id;
                  const newStatus = evt.to.id;
                  db.collection('tasks').doc(taskId).update({ status: newStatus });
              }
          });
      });
  }
  
  function createNewTask(text, status) {
      db.collection('tasks').add({
          text: text,
          status: status,
          owner: currentUsername, // Using username instead of UID
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
  }