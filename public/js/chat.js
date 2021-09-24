
const url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/'
    : 'https://curso-node-chat-2021.herokuapp.com/api/auth/';

let usuario = null;
let socket = null;
const arrayMsg = [];

// referencias HTML
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtUMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');
const enviarMensaje = document.querySelector('#enviarMensaje');
const ulChatsPivados = document.querySelector('#ulChatsPivados');
const ulUsuariosPrivados = document.querySelector('#ulUsuariosPrivados');

// Validar el JWT del LS
const validarJWT = async () => {

    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch(url, {
        headers: { 'x-token': token }
    })

    const { usuario: userDB, token: tokenDB } = await resp.json();
    localStorage.setItem('token', tokenDB);

    usuario = userDB;
    document.title = usuario.nombre;

    await conectarSocket();

}


const conectarSocket = async () => {

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Sockets online')
    });

    socket.on('disconnect', () => {
        console.log('Sockets offline')
    });

    socket.on('recibir-mensajes', dibujarMensajes);
    socket.on('usuarios-activos', dibujarUsuarios);
    socket.on('usuarios-activos', dibujarUsuariosPrivados);

    socket.on('mensaje-privado', dibujarMensajesPrivados);

}

const mensajeDesdeElOption = (uid) => {

    const mensaje = txtMensaje.value;

    if (mensaje !== '') {
        socket.emit('enviar-mensaje', { uid, mensaje });
    }

}

const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = '';
    usuarios.forEach(({ nombre }) => {

        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success"> ${nombre} </h5>
                </p>
            </li>
        `;
    });

    ulUsuarios.innerHTML = usersHtml;

}

const dibujarUsuariosPrivados = (usuariosPrivados = []) => {

    let usersHtml = '';
    usuariosPrivados.forEach(({ nombre, uid }) => {

        usersHtml += `
            <option label="${nombre}" value="${uid}">${nombre}</option>
        `;

    });


    ulUsuariosPrivados.innerHTML = usersHtml;

}


const dibujarMensajes = (mensajes = []) => {

    let mensajesHtml = '';
    mensajes.forEach(({ nombre, mensaje }) => {

        mensajesHtml += `
            <li>
                <p>
                    <span class="text-primary">${mensaje}: </span>
                    <span>${nombre}</span>
                </p>
            </li>
        `;

    });

    ulMensajes.innerHTML = mensajesHtml;

}

const dibujarMensajesPrivados = (mensajes) => {

    let mensajesHtml = '';

    arrayMsg.unshift(mensajes);

    arrayMsg.forEach(({ destinatario, nombre, mensaje }) => {
        mensajesHtml += `
            <li>
                <p>
                    <span class="text-primary">${mensaje}: </span>
                    <span>${nombre}</span>
                    <br/>
                    <span class="text-secondary">Para: ${destinatario}</span>
                </p>
            </li>
        `;
    })


    ulChatsPivados.innerHTML = mensajesHtml;

}


enviarMensaje.addEventListener('click', () => {

    const mensaje = txtMensaje.value;
    const uid = null;

    if (mensaje.length === 0) { return; }

    socket.emit('enviar-mensaje', { uid, mensaje });

    txtMensaje.value = '';

});

btnSalir.addEventListener('click', () => {

    localStorage.removeItem('token');

    console.log('User signed out.');
    window.location = 'index.html';
});

const main = async () => {

    // ValidarJWT
    await validarJWT();

}


main();
