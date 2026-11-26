import nipplejs from 'nipplejs';

const scoreButtonElement = document.getElementById('score-button') as HTMLButtonElement;

scoreButtonElement.addEventListener('click', () => {
    const packet: Packet = {
        recipient: 'host',
        payload: 'button_clicked'
    }
    window.parent.postMessage(packet, window.location.origin);
})

const manager = nipplejs.create({
    zone: document.getElementById('joystick-zone') as HTMLDivElement,
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'blue'
});

manager.on('move' as any, ((evt: any) => {
    const packet: Packet = {
        recipient: 'host',
        payload: {
            x: evt.data.position.x,
            y: evt.data.position.y
        }
    }
    window.parent.postMessage(packet, window.location.origin)
}) as any);