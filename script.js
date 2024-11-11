// Variables globales
let filas = 10;
let columnas = 10;
let lado = 30;
let minas = 10;
let tablero = [];
let enJuego = true;
let juegoIniciado = false;
let marcas = 0;
let primerClic = true; // Variable para detectar el primer clic

const dificultades = {
    facil: { filas: 8, columnas: 8, minas: 10 },
    medio: { filas: 12, columnas: 12, minas: 20 },
    dificil: { filas: 16, columnas: 16, minas: 40 },
    muy_dificil: { filas: 20, columnas: 20, minas: 60 },
    hardcore: { filas: 25, columnas: 25, minas: 80 },
    leyenda: { filas: 30, columnas: 30, minas: 120 },
};

document.addEventListener("DOMContentLoaded", () => {
    const dificultadSelect = document.getElementById("dificultad");
    dificultadSelect.addEventListener("change", actualizarDificultad);

    const iniciarJuegoBtn = document.getElementById("iniciar-juego");
    iniciarJuegoBtn.addEventListener("click", iniciarJuego);
});

function actualizarDificultad() {
    const nivelSeleccionado = document.getElementById("dificultad").value;
    const configuracion = dificultades[nivelSeleccionado];
    ({ filas, columnas, minas } = configuracion);

    const infoDificultad = document.getElementById("info-dificultad");
    infoDificultad.textContent = `Dificultad: ${nivelSeleccionado.toUpperCase()} (${filas}x${columnas}, Minas: ${minas})`;
}

function iniciarJuego() {
    nuevoJuego();
    document.getElementById("juego-nuevo").style.display = "inline";
}

function nuevoJuego() {
    primerClic = true; 
    reiniciarVariables();
    generarTableroHTML();
    generarTableroJuego();
    añadirEventos();
    refrescarTablero();
    actualizarContadorMinas(); 
}

function reiniciarVariables() {
    marcas = 0;
    enJuego = true;
    juegoIniciado = false;
}

function actualizarContadorMinas() {
    const minasRestantes = minas - marcas;
    document.getElementById("minas-count").textContent = `💣 ${minasRestantes}`;
}

function generarTableroHTML() {
    let html = "";
    for (let f = 0; f < filas; f++) {
        html += "<tr>";
        for (let c = 0; c < columnas; c++) {
            html += `<td id="celda-${f}-${c}" style="width:${lado}px;height:${lado}px"></td>`;
        }
        html += "</tr>";
    }
    let tableroHTML = document.getElementById("tablero");
    tableroHTML.innerHTML = html;
    tableroHTML.style.width = columnas * lado + "px";
    tableroHTML.style.height = filas * lado + "px";
}

function añadirEventos() {
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            let celda = document.getElementById(`celda-${f}-${c}`);
            if (celda) {
                celda.addEventListener("dblclick", (e) => dobleClic(celda, f, c, e));
                celda.addEventListener("mouseup", (e) => clicSimple(celda, f, c, e));
            }
        }
    }
}

function bloquearInteraccion() {
    const celdas = document.querySelectorAll("td");
    celdas.forEach((celda) => (celda.style.pointerEvents = "none"));
}

function desbloquearInteraccion() {
    const celdas = document.querySelectorAll("td");
    celdas.forEach((celda) => (celda.style.pointerEvents = "auto"));
}

function clicSimple(celda, f, c, me) {
    if (!enJuego || tablero[f][c]?.estado === "descubierto") return;

    bloquearInteraccion(); 

    switch (me.button) {
        case 0: 
            if (primerClic) {
                primerClic = false;
                while (tablero[f][c]?.valor === -1) {
                    generarTableroJuego();
                }
            }
            if (tablero[f][c]?.estado !== "marcado") {
                tablero[f][c].estado = "descubierto";
                juegoIniciado = true;
                if (tablero[f][c].valor === 0) abrirArea(f, c);
            }
            break;

        case 2: 
            if (tablero[f][c]?.estado === "marcado") {
                tablero[f][c].estado = undefined;
                marcas -= 1;
            } else if (tablero[f][c]?.estado === undefined) {
                tablero[f][c].estado = "marcado";
                marcas += 1;
            }
            actualizarContadorMinas();
            break;
    }

    refrescarTablero();
    verificarPerdedor(); 
    desbloquearInteraccion(); 
}

function dobleClic(celda, f, c, me) {
    if (!enJuego) return;
    abrirArea(f, c);
    refrescarTablero();
}

function generarTableroJuego() {
    tablero = Array.from({ length: filas }, () =>
        Array.from({ length: columnas }, () => ({
            valor: 0,
            estado: undefined,
        }))
    );

    ponerMinas();
    contadoresMinas();
}

function ponerMinas() {
    for (let i = 0; i < minas; i++) {
        let c, f;
        do {
            c = Math.floor(Math.random() * columnas);
            f = Math.floor(Math.random() * filas);
        } while (tablero[f][c]?.valor === -1);
        tablero[f][c].valor = -1;
    }
}

function contadoresMinas() {
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            if (tablero[f][c]?.valor === -1) continue;
            let contador = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (
                        f + i >= 0 &&
                        f + i < filas &&
                        c + j >= 0 &&
                        c + j < columnas &&
                        tablero[f + i][c + j]?.valor === -1
                    ) {
                        contador++;
                    }
                }
            }
            tablero[f][c].valor = contador;
        }
    }
}

function abrirArea(f, c) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const nf = f + i;
            const nc = c + j;
            if (
                nf >= 0 &&
                nf < filas &&
                nc >= 0 &&
                nc < columnas &&
                tablero[nf][nc]?.estado !== "descubierto" &&
                tablero[nf][nc]?.estado !== "marcado"
            ) {
                tablero[nf][nc].estado = "descubierto";
                if (tablero[nf][nc].valor === 0) abrirArea(nf, nc);
            }
        }
    }
}

function refrescarTablero() {
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            let celda = document.getElementById(`celda-${f}-${c}`);
            if (tablero[f][c].estado === "descubierto") {
                celda.style.boxShadow = "none";
                celda.innerHTML =
                    tablero[f][c].valor === -1
                        ? `<i class="fas fa-bomb"></i>`
                        : tablero[f][c].valor || "";
                celda.style.background = tablero[f][c].valor === -1 ? "white" : "#d7b899";
            } else if (tablero[f][c].estado === "marcado") {
                celda.innerHTML = `<i class="fas fa-flag"></i>`;
                celda.style.background = "#a67a5e";
            } else {
                celda.innerHTML = "";
                celda.style.background = "#f3e5d2";
            }
        }
    }
    verificarGanador();
}

function verificarGanador() {
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            if (
                tablero[f][c]?.estado !== "descubierto" &&
                tablero[f][c]?.valor !== -1
            )
                return;
        }
    }
    alert("¡Felicidades, has ganado el juego!");
    enJuego = false;
}

function verificarPerdedor() {
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            if (tablero[f][c]?.valor === -1 && tablero[f][c]?.estado === "descubierto") {
                for (let i = 0; i < filas; i++) {
                    for (let j = 0; j < columnas; j++) {
                        if (tablero[i][j]?.valor === -1) {
                            let celda = document.getElementById(`celda-${i}-${j}`);
                            celda.innerHTML = `<i class="fas fa-bomb"></i>`;
                        }
                    }
                }
                alert("¡Has perdido!");
                enJuego = false;
                return;
            }
        }
    }
}
