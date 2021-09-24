const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMensajes, Usuario } = require('../models');

const chatMensajes = new ChatMensajes;

const socketController = async (socket = new Socket(), io) => {

    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if (!usuario) {
        return socket.disconnect();
    }

    // Agregar al usuario conectados
    chatMensajes.conectarUsuario(usuario);
    io.emit('usuarios-activos', chatMensajes.usuariosArr);
    io.emit('recibir-mensajes', chatMensajes.ultimos10);

    // Conectarlo a una sala esoecial
    socket.join(usuario.id); // Global, socket.id, usuario.id

    // Limpiar cuando alguien se desconecta
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos', chatMensajes.usuariosArr);
    })

    socket.on('enviar-mensaje', async ({ uid = null, mensaje = null }) => {

        if (uid) {

            // Nombre del destinatario
            const { nombre: para } = await Usuario.findById(uid);

            chatMensajes.enviarMensajePrivado(usuario.id, usuario.nombre, mensaje, uid, para);
            socket.to(uid).emit('mensaje-privado', chatMensajes.misMensajesPrivados(uid));
            socket.emit('mensaje-privado', chatMensajes.misMensajesPrivados(uid));

        } else {
            // Mensaje global
            chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimos10);
        }


    })

}


module.exports = {
    socketController
}