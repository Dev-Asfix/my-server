// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function() {
    
    // Crea una conexión WebSocket a la dirección IP y puerto especificados
    var ws = new WebSocket("ws://192.168.18.22:3000"); // Reemplaza con tu IP
    
    // Obtiene referencias a los elementos del DOM
    var statusElement = document.getElementById("status"); // Elemento para mostrar el estado
    var trash = document.getElementById("trash"); // Elemento que representa el tacho
    var innerTrash = trash.querySelector(".inner"); // Elemento interno del tacho
    var spirals = document.querySelectorAll('.spiral'); // Elementos que representan las espirales
    var luz = document.querySelector('.luz'); // Elemento que representa la luz fluorescente
    var ctx = document.getElementById('chart').getContext('2d'); // Contexto del gráfico
    var logTableBody = document.getElementById('log-body'); // Cuerpo de la tabla de registro

    // Estado inicial
    var currentState = 'empty'; // Estado actual del tacho
    var stateChangeTime = new Date(); // Hora en la que cambió el estado
    var lastFullDuration = 0; // Duración del último estado lleno
    var lastEmptyDuration = 0; // Duración del último estado vacío
    
    // Inicializa el gráfico
    var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Etiquetas del gráfico
        datasets: [{
          label: 'Historial de estado', // Etiqueta del conjunto de datos
          data: [], // Datos del gráfico
          borderColor: 'rgba(75, 192, 192, 1)', // Color del borde del gráfico
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de fondo del gráfico
        }]
      },
      options: {
        responsive: true, // Hacer que el gráfico sea sensible a los cambios de tamaño
        scales: {
          x: { beginAtZero: true }, // Escala del eje x comienza en 0
          y: { beginAtZero: true } // Escala del eje y comienza en 0
        }
      }
    });

    // Función para agregar una fila al registro
    function addLogRow(date, state, duration) {
      var row = document.createElement('tr'); // Crea una nueva fila
      row.classList.add('row-animation'); // Añade la clase de animación
      row.classList.add(state); // Añade la clase de estado
      row.innerHTML = `
        <td>${date.toLocaleString()}</td> <!-- Fecha y hora -->
        <td>${state.charAt(0).toUpperCase() + state.slice(1)}</td> <!-- Estado con la primera letra en mayúscula -->
        <td>${duration.toFixed(2)} s</td> <!-- Duración en segundos -->
      `;
      logTableBody.insertBefore(row, logTableBody.firstChild); // Inserta la fila en el inicio de la tabla
    }

    // Evento que se dispara cuando se recibe un mensaje del WebSocket
    ws.onmessage = function(event) {
      var data = JSON.parse(event.data); // Parsea el mensaje recibido
      if (data.status === currentState) return; // No hacer nada si el estado no cambia

      var now = new Date(); // Obtiene la hora actual
      var duration = (now - stateChangeTime) / 1000; // Calcula la duración en segundos

      // Actualiza la duración del estado anterior
      if (currentState === 'full') {
        lastFullDuration = duration; // Actualiza la duración del estado lleno
        addLogRow(stateChangeTime, 'full', lastFullDuration); // Añade una fila al registro
      } else if (currentState === 'empty') {
        lastEmptyDuration = duration; // Actualiza la duración del estado vacío
        addLogRow(stateChangeTime, 'empty', lastEmptyDuration); // Añade una fila al registro
      }

      // Actualiza el estado actual
      currentState = data.status;
      stateChangeTime = now;

      // Actualiza la interfaz de usuario
      statusElement.textContent = `Estado: ${currentState.charAt(0).toUpperCase() + currentState.slice(1)}`; // Muestra el estado actual
      if (currentState === 'full') {
        trash.classList.add('full'); // Añade la clase de estado lleno al tacho
        trash.classList.remove('empty'); // Elimina la clase de estado vacío
        innerTrash.style.transform = 'rotateX(-10deg) rotateY(-15deg)'; // Aplica transformación al tacho
        luz.classList.add('full'); // Añade la clase de estado lleno a la luz
        luz.classList.remove('empty'); // Elimina la clase de estado vacío
        spirals.forEach(spiral => spiral.classList.add('full')); // Añade la clase de estado lleno a las espirales
      } else {
        trash.classList.remove('full'); // Elimina la clase de estado lleno del tacho
        trash.classList.add('empty'); // Añade la clase de estado vacío
        innerTrash.style.transform = 'rotateX(0deg) rotateY(0deg)'; // Resetea la transformación del tacho
        luz.classList.add('empty'); // Añade la clase de estado vacío a la luz
        luz.classList.remove('full'); // Elimina la clase de estado lleno
        spirals.forEach(spiral => spiral.classList.remove('full')); // Elimina la clase de estado lleno de las espirales
      }

      // Actualización del gráfico
      var now = new Date().toLocaleTimeString(); // Obtiene la hora actual en formato de cadena
      chart.data.labels.push(now); // Añade la etiqueta actual al gráfico
      chart.data.datasets[0].data.push(data.status === 'full' ? 1 : 0); // Añade el dato actual al gráfico
      chart.update(); // Actualiza el gráfico
    };
});
