const PHI_STANDARD = Math.PI/3

export class ParameterSpace{
    constructor(){
        this.points = []
        for(let i =0; i < 4; i++){
            this.points.push({labels:"z"+i.toString(),
                              coorX: 0.0,
                              coorY: 0.0})
        }
    }
}

export class Polygon{
    constructor(){
        this.parameterSpace = new ParameterSpace();
        this.theta = 0.0
        this.phi = 0.0
        this.points = []
        for(let i = 4; i > 0; i--){
            this.points.push({labels:"v-"+i.toString(),
                              coorX: 0.0,
                              coorY: 0.0})
            
        }
        for(let i = 0; i < 5; i++){
            this.points.push({labels:"v"+i.toString(),
                              coorX: 0.0,
                              coorY: 0.0})
            
        }
    }

}

