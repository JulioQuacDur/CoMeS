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

function drawPolygon(points, p,color){
    p.stroke(color);
    p.strokeWeight(10);
    for(const point of points){
        p.point(point[0],point[1])
    }

    p.strokeWeight(2);
    for(let i = 0; i < points.length-1; i++){
        p.line(points[i][0],points[i][1],points[i+1][0],points[i+1][1]);
    }

    p.line(points[points.length-1][0],points[points.length-1][1],
           points[0][0],points[0][1]);
}


const sketchPolygonPoints = (p) => {
    let container = document.getElementById('canvasPolygonPoints');
    let globalScale = 0.1*p.width;
    let centerPoint = [p.width/10,p.height/2]
    

    function coordXYToCanvasCoord(point){
        return [centerPoint[0] + globalScale*point[0],
                centerPoint[1] - globalScale*point[1]]
    }
    
    function coordXYToCanvasCoordList(points){
        const res = []
        for(const point of points){
            res.push(coordXYToCanvasCoord(point))
        }
        return res;
    }


    p.windowResized = () => {
        p.resizeCanvas(container.offsetWidth,container.offsetHeight);
        centerPoint = [p.width/10,p.height/3]
    }


    p.setup = () => {
        let canvasWidth = container.offsetWidth;
        let canvasHeight = container.offsetHeight;
        let canvas = p.createCanvas(canvasWidth,canvasHeight);
        globalScale = 0.1*p.width;
        centerPoint = [p.width/10,p.height/2]
        canvas.parent('canvasPolygonPoints');

    }
        
    p.draw = () => {
        p.background(240);
        globalScale = 0.1*p.width;
        centerPoint = [p.width/10,p.height/3]
        const vPoints = coordXYToCanvasCoordList(geoState.getVPointsCoord());
        drawPolygon(vPoints,p,'purple');
    }

}


let sketchZPoints = (p) => {
    let container = document.getElementById('canvasZPoints');
    let centerPoint = [container.offsetWidth,container.offsetHeight]
    let globalScale = container.offsetWidth*0.1;

    let clickedPoint = null;

    function coordXYToCanvasCoord(point){
        return [centerPoint[0] + globalScale*point[0],
                centerPoint[1] - globalScale*point[1]]
    }

    function canvasCoordToCoordXY(point) {
        return [
            (point[0] - centerPoint[0]) / globalScale,
            -(point[1] - centerPoint[1]) / globalScale
        ];
    }
    
    function coordXYToCanvasCoordList(points){
        const res = []
        for(const point of points){
            res.push(coordXYToCanvasCoord(point))
        }
        return res;
    }

    p.setup = () => {
        let canvas = p.createCanvas(container.offsetWidth,container.offsetHeight);
        canvas.parent('canvasZPoints');
    }

    p.windowResized = () => {
        p.resizeCanvas(container.offsetWidth,container.offsetHeight);
        centerPoint = [p.width,p.height]
    }


    p.mousePressed = () => {
        for(const [key,value] of Object.entries(geoState.zPoints)){
            const zPoint = coordXYToCanvasCoord(value);
            if(p.dist(p.mouseX,p.mouseY,zPoint[0],zPoint[1]) < globalScale){
                clickedPoint = key
            }
        }
    }

    p.mouseDragged = () => {
        if(clickedPoint != null){
            const newCoords = canvasCoordToCoordXY([p.mouseX,p.mouseY]);
            geoState.updateZPoint(clickedPoint,newCoords);
        }
    }

    p.mouseReleased = () => {
        clickedPoint = null;
        console.log("This is the new z values")
        console.log(geoState.zPoints)
    };

    p.draw = () => {
        centerPoint = [p.width/2,p.height/2]
        p.background(240);
        for(const [key,value] of Object.entries(geoState.zPoints)){
            const zPoint = coordXYToCanvasCoord(value)
            p.stroke('purple')
            p.strokeWeight(10);
            p.point(zPoint[0],zPoint[1])
            p.strokeWeight(2);
            p.line(centerPoint[0],centerPoint[1],zPoint[0],zPoint[1])
        }
    }
        
}

new p5(sketchPolygonPoints);
new p5(sketchZPoints);

