const scoreButtonElement = document.getElementById('score-button') as HTMLButtonElement;

scoreButtonElement.addEventListener('click', () => {
    const packet: Packet = {
        recipient: 'host',
        payload: 'button_clicked'
    }
    window.parent.postMessage(packet, window.location.origin);
})