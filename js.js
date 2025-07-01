

// Registra el Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registrado', reg))
        .catch(err => console.error('Error en Service Worker', err));
}

let agrm1 = document.getElementById("agrm1");
let btnlisterm = document.getElementById("btnlisterm");
let listaCompl = document.getElementById("listaCompl");

/* Funciones de localStorage */
function guardarElementoLocalStorage(seccion, valor) {
    let elementos = JSON.parse(localStorage.getItem(seccion)) || [];
    // Evitar duplicados antes de agregar
    if (!elementos.includes(valor)) {
        elementos.push(valor);
        localStorage.setItem(seccion, JSON.stringify(elementos));
    }
}

function cargarElementos(seccion, contenedor) {
    let elementos = JSON.parse(localStorage.getItem(seccion)) || [];
    elementos.forEach(valor => agregarElemento(seccion, contenedor, valor));
}

/* Funciones de elementos */
function agregarElemento(seccion, contenedor, valor) {
    const contenedorElementos = document.getElementById(contenedor);
    if (!contenedorElementos) {
        console.error(`No se encontró el contenedor con id "${contenedor}"`);
        return;
    }

    const nuevoElemento = document.createElement("div");
    nuevoElemento.classList.add("contarticulo");
    nuevoElemento.innerHTML = `
        <span class="nombart">${valor}</span>
        <div class="btn">Agregar a lista</div>
    `;

    nuevoElemento.querySelector(".nombart").addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModalEdicion(seccion, nuevoElemento, valor);
    });

    nuevoElemento.querySelector(".btn").addEventListener("click", (e) => {
        e.stopPropagation();
        agregarAListaCompl(valor);
    });

    contenedorElementos.appendChild(nuevoElemento);
}

/* Modales */
const modalAgregar = crearModal(`
    <div class="contelmagrmas">
        <input class="inpcontagrmas" type="text" placeholder="Añadir elemento">
        <button id="guardarElem" class="btnpeq verde">Guardar</button>
        <button id="eliminarElem" class="btnpeq rojo">Cancelar</button>
    </div>
`);

const modalEditar = crearModal(`
    <div class="contelmagrmas">
        <input class="inpcontedit" type="text">
        <button id="guardarEdicion" class="btnpeq verde">Guardar</button>
        <button id="eliminarEdicion" class="btnpeq rojo">Eliminar</button>
    </div>
`);

function crearModal(contenidoHTML) {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");
    modal.innerHTML = contenidoHTML;
    document.body.appendChild(modal);
    return modal;
}

/* Estilos */
document.head.insertAdjacentHTML("beforeend", `
    <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(20px);
            display: flex;
            justify-content: center;
            align-items: center;
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        .modal-overlay.active {
            visibility: visible;
            opacity: 1;
        }
    </style>
`);

/* Variables de sección activa */
let seccionActiva = "";
let contenedorActivo = "";
let elementoEditando = null;
let valorActualEditando = "";

/* Mostrar modal de agregar */
document.getElementById("agrm1").addEventListener("click", () => {
    seccionActiva = "comprasRecurrentes1";
    contenedorActivo = "articulos1";
    modalAgregar.classList.add("active");
});

document.getElementById("agrm2").addEventListener("click", () => {
    seccionActiva = "comprasRecurrentes2";
    contenedorActivo = "articulos2";
    modalAgregar.classList.add("active");
});

/* Cerrar modal sin guardar */
document.getElementById("eliminarElem").addEventListener("click", () => {
    modalAgregar.classList.remove("active");
});

/* Guardar nuevo elemento */
document.getElementById("guardarElem").addEventListener("click", () => {
    const input = document.querySelector(".inpcontagrmas");
    const valor = input.value.trim();
    if (valor === "") return;

    agregarElemento(seccionActiva, contenedorActivo, valor);
    guardarElementoLocalStorage(seccionActiva, valor);

    input.value = "";
    modalAgregar.classList.remove("active");
});

/* Modal de edición */
function abrirModalEdicion(seccion, elemento, valorActual) {
    const inputEdit = document.querySelector(".inpcontedit");
    inputEdit.value = valorActual;

    modalEditar.classList.add("active");
    elementoEditando = elemento;
    valorActualEditando = valorActual;

    // Reemplazar el botón de guardar para evitar múltiples listeners
    const btnGuardar = document.getElementById("guardarEdicion");
    btnGuardar.replaceWith(btnGuardar.cloneNode(true));

    document.getElementById("guardarEdicion").addEventListener("click", function() {
        const nuevoValor = inputEdit.value.trim();
        if (nuevoValor === "") return;

        const spanElemento = elementoEditando.querySelector(".nombart");
        if (spanElemento) {
            spanElemento.textContent = nuevoValor;
        }

        let elementos = JSON.parse(localStorage.getItem(seccion)) || [];
        let index = elementos.findIndex(item => item === valorActualEditando);
        if (index !== -1) {
            elementos[index] = nuevoValor;
            localStorage.setItem(seccion, JSON.stringify(elementos));
        }

        modalEditar.classList.remove("active");
        elementoEditando = null;
        valorActualEditando = "";
    });
}

// Eliminar elemento
document.getElementById("eliminarEdicion").addEventListener("click", function() {
    if (elementoEditando && elementoEditando.parentNode) {
        elementoEditando.remove();
    } else {
        console.warn("Elemento a eliminar no encontrado en el DOM.");
    }

    // Actualizar en localStorage la sección activa
    try {
        if (seccionActiva) {
            let elementos = JSON.parse(localStorage.getItem(seccionActiva)) || [];
            elementos = elementos.filter(item => item !== valorActualEditando);
            localStorage.setItem(seccionActiva, JSON.stringify(elementos));
        } else {
            console.error("Sección activa no definida.");
        }
    } catch (error) {
        console.error("Error al actualizar localStorage de la sección:", error);
    }

    // Actualizar lista completa en localStorage (si es necesario)
    try {
        let comprasRecurrentes1 = JSON.parse(localStorage.getItem("comprasRecurrentes1")) || [];
        comprasRecurrentes1 = comprasRecurrentes1.filter(item => item !== valorActualEditando);
        localStorage.setItem("comprasRecurrentes1", JSON.stringify(comprasRecurrentes1));
    } catch (error) {
        console.error("Error al actualizar localStorage de la lista completa:", error);
    }
    try {
        let comprasRecurrentes2 = JSON.parse(localStorage.getItem("comprasRecurrentes2")) || [];
        comprasRecurrentes2 = comprasRecurrentes2.filter(item => item !== valorActualEditando);
        localStorage.setItem("comprasRecurrentes2", JSON.stringify(comprasRecurrentes2));
    } catch (error) {
        console.error("Error al actualizar localStorage de la lista completa:", error);
    }

    // Cerrar modal de edición
    if (modalEditar.classList.contains("active")) {
        modalEditar.classList.remove("active");
    }

    // Resetear variables de edición
    elementoEditando = null;
    valorActualEditando = "";
});



/* Lista completa */
function guardarListaCompl() {
    const elementos = [];
    document.querySelectorAll("#listaCompl .nmbrecheck").forEach(span => {
        elementos.push(span.textContent.trim());
    });
    localStorage.setItem("listaCompleta", JSON.stringify(elementos));
}

function agregarAListaCompl(valor, guardar = true, completado = false) {
    if ([...listaCompl.querySelectorAll(".nmbrecheck")].some(span => span.textContent.trim() === valor.trim())) {
        console.warn("El elemento ya está en la lista.");
        return;
    }

    const nuevoElemento = document.createElement("div");
    nuevoElemento.classList.add("artenlistcomp");
    nuevoElemento.innerHTML = `
        <input class="inpcheck" type="checkbox" ${completado ? "checked" : ""}>
        <span class="nmbrecheck" style="color: ${completado ? '#9E9E9E' : 'black'}">${valor}</span>
        <button class="elim">x</button>
    `;

    const checkbox = nuevoElemento.querySelector(".inpcheck");
    const nombre = nuevoElemento.querySelector(".nmbrecheck");

    checkbox.addEventListener("change", () => {
        nombre.style.color = checkbox.checked ? "#9E9E9E" : "black";
        guardarListaCompl();
    });

    nuevoElemento.querySelector(".elim").addEventListener("click", () => {
        nuevoElemento.remove();
        guardarListaCompl();
    });

    listaCompl.appendChild(nuevoElemento);
    if (guardar) {
        guardarListaCompl();
    }
}

document.getElementById("btnagrmasinpt").addEventListener("click", () => {
    const inputMas = document.getElementById("inptagrmas");
    const valor = inputMas.value.trim();

    if (valor === "") return;

    agregarAListaCompl(valor);
    inputMas.value = ""; // Limpiar el input después de agregar el elemento
});


function guardarListaCompl() {
    const elementos = [];
    document.querySelectorAll("#listaCompl .artenlistcomp").forEach(elemento => {
        const nombre = elemento.querySelector(".nmbrecheck").textContent.trim();
        const completado = elemento.querySelector(".inpcheck").checked;
        elementos.push({ nombre, completado });
    });
    localStorage.setItem("listaCompleta", JSON.stringify(elementos));
}
function cargarListaCompl() {
    const elementos = JSON.parse(localStorage.getItem("listaCompleta")) || [];
    elementos.forEach(({ nombre, completado }) => agregarAListaCompl(nombre, false, completado));
}


/* Cargar listas al iniciar */
document.addEventListener("DOMContentLoaded", () => {
    cargarListaCompl();
    cargarElementos("comprasRecurrentes1", "articulos1");
    cargarElementos("comprasRecurrentes2", "articulos2");
});

/* Borrar lista terminada sin eliminar el contenedor */
btnlisterm.addEventListener("click", () => {
    listaCompl.innerHTML = "";
    localStorage.removeItem("listaCompleta");
});



