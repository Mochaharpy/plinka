import {add} from './helper.js'
import nipplejs from 'nipplejs';

let score = 0;

window.addEventListener('message', (event) => {
    console.log(event)

    if (event.data.payload === 'button_clicked') {
        score = add(score, 1);
        document.body.textContent = score.toString();
    }
})

const manager = nipplejs.create({
    zone: document.getElementById('joystick-zone') as HTMLDivElement,
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'blue'
});

manager.on('move' as any, ((evt: any, data: any) => {
    console.log(data.position);
}) as any);
