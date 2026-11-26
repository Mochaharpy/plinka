let score = 0;

window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data.payload === 'button_clicked') {
        console.log('clicked')
        score ++;
        document.body.textContent = score.toString();
    }
})