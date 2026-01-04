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
        const geoCenter = geoState.getCenter();
        return [centerPoint[0] + globalScale*(point[0]-geoCenter[0]),
                centerPoint[1] - globalScale*(point[1]-geoCenter[1])]
    }
    
    function coordXYToCanvasCoordList(points){
        const res = []
        for(const point of points){
            res.push(coordXYToCanvasCoord(point))
        }
        return res;
    }

    function setScale(){
        const [xmin,xmax] = geoState.getXLimits();
        const [ymin,ymax] = geoState.getYLimits();
        const xy_width = xmax - xmin;
        const xy_height = ymax - ymin;
        const canva_width = p.width;
        const canva_height = p.height;
        globalScale = 0.95*Math.min(canva_width/xy_width,canva_height/xy_height);
        centerPoint = [p.width/2,p.height/2];
    }

    p.windowResized = () => {
        p.resizeCanvas(container.offsetWidth,container.offsetHeight);
        setScale();
    }

    p.setup = () => {
        let canvas = p.createCanvas(container.offsetWidth,container.offsetHeight);
        canvas.parent('canvasPolygonPoints');
        setScale();
    }
        
    p.draw = () => {
        p.clear();
        setScale();
        const vPoints = coordXYToCanvasCoordList(geoState.getVPointsCoord());
        drawPolygon(vPoints,p,'purple');
        p.stroke('purple');
        p.strokeWeight(10);
        console.log(geoState.polygonPoints);
        let pp;
        pp = coordXYToCanvasCoord(geoState.polygonPoints["A"].coordXY)
        p.point(pp[0],pp[1])
        pp = coordXYToCanvasCoord(geoState.polygonPoints["B"].coordXY)
        p.point(pp[0],pp[1])
        pp = coordXYToCanvasCoord(geoState.polygonPoints["C"].coordXY)
        p.point(pp[0],pp[1])
        pp = coordXYToCanvasCoord(geoState.polygonPoints["Cp"].coordXY)
        p.point(pp[0],pp[1])

    }
}


let sketchZPoints = (p) => {
    let container = document.getElementById('canvasZPoints');
    let centerPoint = [container.offsetWidth*0.5,container.offsetHeight*0.5];
    let globalScale = 0.1*container.offsetWidth;
    let clickedPoint = null;

    function coordXYToCanvasCoord(point){
        const geo = geoState.getCenter();
        return [centerPoint[0] + globalScale*point[0],
                centerPoint[1] - globalScale*point[1]]
    }

    function canvasCoordToCoordXY(point){
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
        centerPoint = [p.width/2,p.height/2]
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
        p.clear();
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

