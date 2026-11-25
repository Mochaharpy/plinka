const socket = io({
    auth: {
        clientType: 'player'
    }
});

const state: ControllerState = {
    activeGame: null,
}

const nameForm = document.getElementById('name-form') as HTMLFormElement;
const nameElement = nameForm.querySelector('input[name=username]') as HTMLInputElement;

nameElement.addEventListener('input', () => {
    nameElement.setCustomValidity('');
});

nameForm.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    nameElement.setCustomValidity('');
    
    if (!nameElement.reportValidity()) {
        return;
    }
    
    const nameFormData = new FormData(nameForm);

    const name = nameFormData.get('username');

    socket.emit('registerPlayer', name);
})

socket.on('invalidUsername', (reason: string) => {
    nameElement.setCustomValidity(reason || 'Invalid username');
    nameElement.reportValidity();
});

socket.on('registerSuccess', () => {
    
    nameForm.style.display = 'none';
})

export {}