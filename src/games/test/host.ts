import {add} from './helper.js'

let score = 0;

window.addEventListener('message', (event) => {
    if (event.data.payload) { console.log(event.data.payload)};
    if (event.data.payload === 'button_clicked') {
        score = add(score, 1);
        document.body.textContent = score.toString();
    }
})
