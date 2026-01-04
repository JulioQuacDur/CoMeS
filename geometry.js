import { create, all } from 'https://esm.sh/mathjs?bundle';

const PHI_STANDARD = Math.PI/3
const THETA_STANDARD = Math.PI/4
const PSI_STANDARD = Math.PI - PHI_STANDARD- PHI_STANDARD

const math = create(all);

export class GeometryState{
    constructor(){
        this.angles = {
            "phi": 1/3,
            "theta": 1/4,
            "psi": 1- 1/3 - 1/4
        }
        this.zPoints = {
            "z1": [0.5,0.0],
            "z2": [1.0,0.0],
            "z3": [1.5,0.0],
            "z4": [4,0.0]
        };
        this.polygonPoints = {};
        this.initPoints();
        this.updatePoints();
    }

    initPoints(){
        const names = ["A","C","Cp","B","v0","v1","v-1","v2","v-2","v3","v-3","v4","v-4","v*"]
        for (const name of names){
            this.polygonPoints[name] = {coordXY:[0.0,0.0],coordZ:[0.0,0.0,0.0,0.0]}
        }
    }

    getVPointsCoord(){
        return [this.polygonPoints["v0"].coordXY,
                this.polygonPoints["v1"].coordXY,
                this.polygonPoints["v2"].coordXY,
                this.polygonPoints["v3"].coordXY,
                this.polygonPoints["v4"].coordXY,
                this.polygonPoints["v*"].coordXY,
                this.polygonPoints["v-4"].coordXY,
                this.polygonPoints["v-3"].coordXY,
                this.polygonPoints["v-2"].coordXY,
                this.polygonPoints["v-1"].coordXY]
    }

    getXLimits(){
        let xmin = 0;
        let xmax = 0;
        for (const [key,value] of Object.entries(this.polygonPoints)){
            const x0 = value.coordXY[0]
            xmin = Math.min(x0,xmin);
            xmax = Math.max(x0,xmax);
        }
        return [xmin,xmax];
    }

    getYLimits(){
        let ymin = 0;
        let ymax = 0;
        for (const [key,value] of Object.entries(this.polygonPoints)){
            const y0 = value.coordXY[1];
            ymin = Math.min(y0,ymin);
            ymax = Math.max(y0,ymax);
        }
        return [ymin,ymax];
    }

    getCenter(){
        const [xmin,xmax] = this.getXLimits();
        const [ymin,ymax] = this.getYLimits();
        return [(xmin+xmax)/2,(ymin+ymax)/2]
    }

    getABCPointsCoord(){
        return [this.polygonPoints["A"].coordXY,
                this.polygonPoints["C"].coordXY,
                this.polygonPoints["Cp"].coordXY,
                this.polygonPoints["B"].coordXY]
    }

    updateZPoint(name, newCoords){
        this.zPoints[name] = newCoords
        this.updatePoints();
    }


    updateAngles(){
        this.angles.psi = 1-this.angles.theta-this.angles.phi
        this.updatePoints();
    }
    
    updatePoints(){
        this.updatePointsZCoord();
        this.updatePolygonXYCoord();
    }

    updatePointsZCoord(){
        const i = math.complex(0, 1), sin = math.sin, cos = math.cos, exp = math.exp, mul = math.multiply;
        const imin = math.complex(0, -1)
        const theta = Math.PI*this.angles.theta, phi = Math.PI*this.angles.phi, psi = Math.PI*this.angles.psi;

        this.polygonPoints["A"].coordZ = [0,0,0,0];
        this.polygonPoints["C"].coordZ = [0,0,0,mul(sin(psi)/sin(theta),exp(mul(i,phi)))];
        this.polygonPoints["Cp"].coordZ =[0,0,0,mul(sin(psi)/sin(theta),exp(mul(imin,phi)))];
        this.polygonPoints["B"].coordZ = [0,0,0,1];
        this.polygonPoints["v0"].coordZ = [math.complex(-1), 0, 0, math.complex(1)];
        this.polygonPoints["v1"].coordZ = [mul(-cos(theta / 2 - psi) / cos(theta / 2), exp(mul(imin, psi))), 0, 0, math.complex(1)];
        this.polygonPoints["v-1"].coordZ = [mul(-cos(theta / 2 - psi) / cos(theta / 2), exp(mul(i, psi))), 0, 0, math.complex(1)];
        this.polygonPoints["v2"].coordZ = [0, mul(cos(theta / 2) / sin(theta), exp(mul(imin, psi))), 0, mul(sin(psi) / sin(theta), exp(mul(i, phi)))];
        this.polygonPoints["v-2"].coordZ = [0, mul(cos(theta / 2) / sin(theta), exp(mul(i, psi))), 0, mul(sin(psi) / sin(theta), exp(mul(imin, phi)))];
        this.polygonPoints["v3"].coordZ = [0, mul(-cos(theta/2)/sin(theta),exp(mul(i,phi))), 0, mul(sin(psi)/sin(theta),exp(mul(i,phi)))];
        this.polygonPoints["v-3"].coordZ = [0, mul(-cos(theta/2)/sin(theta),exp(mul(imin,phi))), 0, mul(sin(psi)/sin(theta),exp(mul(imin,phi)))];
        this.polygonPoints["v4"].coordZ = [0,0,mul(cos(theta/2-phi)/cos(theta/2),exp(mul(i,phi))),0];
        this.polygonPoints["v-4"].coordZ = [0,0,mul(cos(theta/2-phi)/cos(theta/2),exp(mul(imin,phi))),0];
        this.polygonPoints["v*"].coordZ = [0,0,1,0];
    };
    
    updatePolygonXYCoord(){
        const z_v = [math.complex(this.zPoints["z1"][0],this.zPoints["z1"][1]),
                     math.complex(this.zPoints["z2"][0],this.zPoints["z2"][1]),
                     math.complex(this.zPoints["z3"][0],this.zPoints["z4"][1]),
                     math.complex(this.zPoints["z4"][0],this.zPoints["z4"][1]),
                    ]
        console.log("this is the value of the z_v")
        console.log(z_v)        
        for (const [key,value] of Object.entries(this.polygonPoints)){
            let w = math.complex(0.0,0.0);
            for(let i = 0; i < 4; i++) {
                w = math.add(math.multiply(z_v[i],value.coordZ[i]),w)
            }
            console.log("this is the value of the w")
            console.log(w)        

            const x = math.re(w);
            const y = math.im(w);
            value.coordXY = [x,y];
        }
    }
}



