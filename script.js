// Configuración
const scriptURL = 'https://script.google.com/macros/s/AKfycbwVJ_w83MgUiDAd-8fEg4wre3Vpvb-Y1kWkV2_5v408hWaabAVWi7XA0RSKQdZmrQ5o/exec';

// Elementos del DOM
const form = document.getElementById('storyForm');
const formMessage = document.getElementById('formMessage');
const storiesContainer = document.getElementById('storiesContainer');

// Cargar historias al iniciar
document.addEventListener('DOMContentLoaded', cargarHistorias);

// Enviar formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim() || 'Anónimo';
    const historia = document.getElementById('historia').value.trim();
    const lugar = document.getElementById('lugar').value.trim() || 'No especificado';
    
    if (!historia) {
        showMessage('Por favor escribe una historia', 'error');
        return;
    }
    
    // Deshabilitar botón mientras envía
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                nombre: nombre,
                historia: historia,
                lugar: lugar
            })
        });
        
        showMessage('¡Historia enviada con éxito!', 'success');
        form.reset();
        
        // Recargar historias después de un breve retraso
        setTimeout(cargarHistorias, 2000);
        
    } catch (error) {
        showMessage('Error al enviar. Intenta de nuevo.', 'error');
        console.error('Error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Historia';
    }
});

// Función para cargar historias
async function cargarHistorias() {
    storiesContainer.innerHTML = '<p class="loading">Cargando historias...</p>';
    
    try {
        // Para leer datos, necesitamos hacer una petición GET al script
        // pero con mode 'no-cors' no podemos leer la respuesta.
        // Una alternativa es usar JSONP o un proxy. 
        // Aquí asumiremos que el script soporta GET y devuelve JSON.
        // Si no, necesitarás modificar el script de Apps Script.
        
        const response = await fetch(scriptURL + '?action=get', {
            method: 'GET',
            // Si el script no permite CORS, esto no funcionará.
            // En ese caso, necesitaremos implementar JSONP.
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta');
        }
        
        const data = await response.json();
        mostrarHistorias(data);
        
    } catch (error) {
        console.error('Error cargando historias:', error);
        storiesContainer.innerHTML = '<p class="error">No se pudieron cargar las historias. Intenta más tarde.</p>';
    }
}

// Función para mostrar historias en tarjetas desplegables
function mostrarHistorias(historias) {
    if (!historias || historias.length === 0) {
        storiesContainer.innerHTML = '<p class="loading">No hay historias aún. ¡Sé el primero en compartir!</p>';
        return;
    }
    
    // Ordenar por fecha descendente (asumiendo que la primera columna es fecha)
    historias.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    let html = '<div class="stories-grid">';
    
    historias.forEach(historia => {
        // Ajusta los índices según tu hoja:
        // [0] fecha, [1] nombre, [2] historia, [3] lugar
        const fecha = new Date(historia[0]).toLocaleDateString('es-PA');
        const nombre = historia[1] || 'Anónimo';
        const texto = historia[2] || '';
        const lugar = historia[3] || 'No especificado';
        
        // Crear un ID único para cada tarjeta
        const storyId = `story-${Date.now()}-${Math.random()}`;
        
        html += `
            <div class="story-card">
                <div class="story-header" onclick="toggleStory('${storyId}')">
                    <span class="story-title">${nombre}</span>
                    <span class="story-meta">${fecha} · ${lugar}</span>
                </div>
                <div id="${storyId}" class="story-content">
                    <div class="story-text">${texto.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    storiesContainer.innerHTML = html;
}

// Función para desplegar/contraer historia (debe ser global)
window.toggleStory = function(storyId) {
    const content = document.getElementById(storyId);
    content.classList.toggle('show');
};

// Función auxiliar para mostrar mensajes
function showMessage(msg, type) {
    formMessage.textContent = msg;
    formMessage.className = `message ${type}`;
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.className = 'message';
    }, 5000);
}
