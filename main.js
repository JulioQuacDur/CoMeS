import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';
import {GeometryState} from './geometry.js'

const geoState = new GeometryState();
const anglesPane = new Pane();


anglesPane.addBinding(geoState.angles,'phi', {min:0.0,max: 1.0}).on('change',
                                                     (ev) => {
                                                         geoState.updateAngles();
                                                         console.log(geoState.angles);
                                                         });
anglesPane.addBinding(geoState.angles,'theta',{min:0.0,max: 1.0}).on('change',
                                                      (ev) => {
                                                          geoState.updateAngles();
                                                          console.log(geoState.angles);});


const sketch1 = (p) => {
    let globalScale = 100;
    let centerPoint = [p.windowWidth/10,p.windowHeight/2];

    function coordXYToCanvasCoor(point){
        return [centerPoint[0] + globalScale*point[0],
                centerPoint[1] + globalScale*point[1]]
    }

    p.setup = () => {
        p.createCanvas(p.windowWidth,p.windowHeight);
    }
    
    p.draw = () => {
        p.background(222);
        p.stroke('purple');
        p.strokeWeight(10);
        p.point(centerPoint[0],centerPoint[0])
        for(const [key,value] of Object.entries(geoState.polygonPoints)){
            const coords = coordXYToCanvasCoor(value.coordXY)
            p.point(coords[0],coords[1])
        }
    }

}

new p5(sketch1);

