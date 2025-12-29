import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';
import {Polygon} from './drawing.js'

const mainPolygon = new Polygon();
console.log(mainPolygon);

const sketch1 = (p) => {
    let pol;
    p.setup = () => {
        p.createCanvas(p.windowWidth,p.windowHeight);
        console.log("We created the window without problems");
    }
    
    p.draw = () => {
        p.background(220);
        p.circle(p.windowWidth/2, p.windowHeight/2, p.windowHeight/3);
    }
}

const PARAMS = {
    factor: '123',
    title: 'Hola como esstas',
    color: '#36423b'
}

// Set up Tweakpane (Floating Menu)
const pane = new Pane();
pane.addBinding(PARAMS,'factor');
pane.addBinding(PARAMS,'title');
pane.addBinding(PARAMS,'color');

new p5(sketch1);

