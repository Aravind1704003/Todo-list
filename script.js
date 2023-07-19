document.addEventListener('DOMContentLoaded', function() {
  if (!window.openDatabase) {
    alert('Web SQL Database is not supported in this browser.');
    return;
  }

  var db = openDatabase('todo', '1.0', 'todolist', 2 * 1024 * 1024);

  createTable();
  fetchTodo();

  function createTable() {
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, todo TEXT)');
    });
  }

  var todoForm = document.getElementById('todoForm');
  todoForm.addEventListener('submit', addTodo);

  function addTodo(event) {
    event.preventDefault();
  
    var todoInput = document.getElementById('todoInput');
    var todo = todoInput.value.trim();
  
    if (todo === '') {
      alert('Please enter a todo item.');
      return;
    }
  
    db.transaction(function(tx) {
      tx.executeSql('INSERT INTO todos (todo) VALUES (?)', [todo], function() {
        todoInput.value = '';
        fetchTodo();
        syncData(todo); // Trigger synchronization only on new item insertion
      });
    });
  }

  function deleteTodo(id) {
    db.transaction(function(tx) {
      var deleteId = id;
      tx.executeSql('DELETE FROM todos WHERE id = ?', [deleteId], function() {
         fetchTodo();
        syncDelete(deleteId); // Trigger synchronization after successful deletion
      });
    });
  }
  
  
  function syncDelete(id) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'delete.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
  
    var data = { id: id };
  
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log('Data deleted successfully!');
          deleteFromSQL(id); // Delete the record from SQL after successful synchronization
        } else {
          console.error('Error deleting data:', xhr.status);
        }
      }
    };
  
    xhr.send(JSON.stringify(data));
  }
  
  
  
  function fetchTodo() {
    db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM todos', [], function(tx, result) {
        var todoList = document.getElementById('todoList');
        todoList.innerHTML = '';
  
        var rows = result.rows;
        for (var i = 0; i < rows.length; i++) {
          var todo = rows.item(i).todo;
          var id = rows.item(i).id;
  
          var li = document.createElement('li');
          li.textContent = todo;
  
          var deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', function(id) {
            return function() {
              deleteTodo(id);
            };
          }(id));
  
          li.appendChild(deleteButton);
          todoList.appendChild(li);
        }
      });
    });
  }

  function syncData(todo) {
    var data = [{ todo: todo }];
  
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'sync.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
  
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log('Data synced successfully!');
        } else {
          console.error('Error syncing data:', xhr.status);
        }
      }
    };
  
    xhr.send(JSON.stringify(data));
  }
});
