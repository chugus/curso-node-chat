const miForm = document.querySelector('form');
const google_signout = document.querySelector('#google_signout');

const url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/'
    : 'https://curso-node-chat-2021.herokuapp.com/api/auth/';


miForm.addEventListener('submit', ev => {
    ev.preventDefault();

    const formData = {};

    for (let el of miForm.elements) {
        if (el.name.length > 0) {
            formData[el.name] = el.value;
        }
    }

    fetch(url + 'login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(resp => resp.json())
        .then(({ msg, token }) => {
            if (msg) {
                return console.error(msg);
            }

            localStorage.setItem('token', token);
            window.location = 'chat.html'
        })
        .catch(err => {
            console.log(err)
        })

})



function handleCredentialResponse(response) {

    // Google Token : ID Token
    // console.log(response.credential);

    const body = { id_token: response.credential }

    fetch(url + 'google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(resp => resp.json())
        .then(resp => {
            localStorage.setItem('email', resp.usuario.correo)
        })
        .catch(console.warn)

}

google_signout.onclick = () => {

    google_signout.accounts.id.disableAutoSelect();

    google_signout.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear();
        localStorage.reload();
    })

}