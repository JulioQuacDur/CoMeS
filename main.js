import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';
import {GeometryState} from './geometry.js'

const geoState = new GeometryState();
const pane = new Pane();

const anglesFolder = pane.addFolder({ title: 'Angles' });
anglesFolder.addBinding(geoState.angles, 'phi', { min: 0, max: 1 });
anglesFolder.addBinding(geoState.angles, 'theta', { min: 0, max: 1 });

const config = {
    orientation: true
}

const configFolder = pane.addFolder({ title: 'Config' });
configFolder.addBinding(config, 'orientation');




function drawArrow(p,base, vec, myColor) {
    p.push();
    p.stroke(myColor);
    p.strokeWeight(3);
    p.fill(myColor);
    p.translate(base.x, base.y);
    p.line(0, 0, vec.x, vec.y);
    p.rotate(vec.heading());
    let arrowSize = 7;
    p.translate(vec.mag() - arrowSize, 0);
    p.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    p.pop();
}


function drawPolygonLine(points,p,size,color,dashed = null, arrow = false){
    p.stroke(color);
    p.strokeWeight(size);

    if(arrow){
        let v0;
        let v1;
        for(let i = 0; i < points.length-1; i++){
            v0 = p.createVector(points[i][0],points[i][1])
            v1 = p.createVector(points[i+1][0]-points[i][0],points[i+1][1]-points[i][1])
            drawArrow(p,v0,v1,color);
        }
        v0 = p.createVector(points[points.length-1][0],points[points.length-1][1]);
        v1 = p.createVector(points[0][0]-points[points.length-1][0],points[0][1]-points[points.length-1][1]);
        drawArrow(p,v0,v1,color);
    }else{
        if(dashed != null){
            p.drawingContext.setLineDash(dashed)
        }

        for(let i = 0; i < points.length-1; i++){
            p.line(points[i][0],points[i][1],points[i+1][0],points[i+1][1]);
        }
        p.line(points[points.length-1][0],points[points.length-1][1],
               points[0][0],points[0][1]);
        p.drawingContext.setLineDash([])

    }

}

function drawPoints(points,p,size,color){
    p.stroke(color);
    p.strokeWeight(size);
    for(const point of points){
        p.point(point[0],point[1])
    }

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

        // Drawing the triangles that change.
        const triangles = geoState.getTriangles();
        const trianglesCanvasCoordinates = [];
        for(const triangle of triangles){
            trianglesCanvasCoordinates.push(coordXYToCanvasCoordList(triangle));
        }
        
        for(const triangle of trianglesCanvasCoordinates){
            drawPolygonLine(triangle,p,2,'black',[10,10]);
            drawPoints(triangle,p,6,'black');
        }

        const vPoints = coordXYToCanvasCoordList(geoState.getVPointsCoord());
        console.log(config.orientation)
        drawPolygonLine(vPoints,p,3,'purple',null,config.orientation);
        if(!config.orientation){
            drawPoints(vPoints,p,10,'purple');
        }
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
            if(p.dist(p.mouseX,p.mouseY,zPoint[0],zPoint[1]) < 0.2*globalScale){
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

