
const url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/'
    : 'https://curso-node-chat-2021.herokuapp.com/api/auth/';

let usuario = null;
let socket = null;
const arrayMsg = [];
const idsPrivados = [];

// referencias HTML
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtUMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');
const enviarMensaje = document.querySelector('#enviarMensaje');
const ulChatsPivados = document.querySelector('#ulChatsPivados');

const txtSeleccionado = () => {
    const users = document.querySelectorAll('.users');

    for (let i = 0; i < users.length; i++) {
        users[i].onclick = () => {
            let j = 0;
            while (j < users.length) {
                users[j++].className = 'text-success users';
            }
            users[i].className = 'text-info users fs-3 fw-bold';
            idsPrivados.unshift(users[i].value)
        }
    }
}


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

    socket.on('mensaje-privado', dibujarMensajesPrivados);

}

const uidPrivado = (uid) => {

    idsPrivados.unshift(uid);

    return uid;
}

const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = '';
    usuarios.forEach(({ nombre, uid }) => {

        usersHtml += `
            <li>
                <p>
                <option class="text-success users" value="${uid}" onclick="uidPrivado(value);"> ${nombre} </option>
                </p>
                </li>
        `;

    });

    ulUsuarios.innerHTML = usersHtml;

    txtSeleccionado();

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
    let uid = idsPrivados[0];

    console.log(idsPrivados)

    if (uid !== 'todos') {
        if (mensaje.length === 0) { return; }

        socket.emit('enviar-mensaje', { uid, mensaje });

        txtMensaje.value = '';

    } else {
        uid = null;
        socket.emit('enviar-mensaje', { uid, mensaje });

        txtMensaje.value = '';
    }


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