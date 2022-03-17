import { BluePrint } from "../blueprint";
import { Building, BuildingList, BuilidingParam } from "./builiding";

class BeltParamLabel {
    label: number
    count: number

    constructor(label: number, count: number) {
        this.label = label
        this.count = count
    }
}

export class BeltBlueprintParam extends BuilidingParam  {
    private Belt:null | BeltParamLabel

    constructor() {
        super()
        this.reset()
    }

    reset() : number {
        this.Belt = null
        return 0
    }

    setLabel(label:number) : number{
        this.Belt = new BeltParamLabel(label, 0)
        return 2
    }

    getCount(): number {
        if (this.Belt == null) {
            return 0
        }
        else {
            return 2
        }
    }
}

export class Belt extends Building {
    constructor(
        area_index:number,
        local_offset_x:number,
        local_offset_y:number,
        local_offset_z:number,
        level=3,
    ) {
        let item_id = 2003
        let model_index = 37

        if (level == 3) {
            item_id = 2003
            model_index = 37
        }

        super(area_index, 
            local_offset_x, local_offset_y, local_offset_z,
            local_offset_x, local_offset_y, local_offset_z,
            item_id, model_index, false)
        this.param = new BeltBlueprintParam()
        this.header.parameter_count = 0
    }
    
    setLocal(
        local_offset_x:number,
        local_offset_y:number,
        local_offset_z:number
    ) {
        this.header.local_offset_x = local_offset_x
        this.header.local_offset_x2 = local_offset_x
        this.header.local_offset_y = local_offset_y
        this.header.local_offset_y2 = local_offset_y
        this.header.local_offset_z = local_offset_z
        this.header.local_offset_z2 = local_offset_z
        this.header.output_to_slot = 1
        this.header.input_to_slot = 1
    }

    connect(next_belt: Belt) {
        this.header.output_object_index = next_belt.header.index
        next_belt.header.input_object_index = this.header.index

        // Todo : Calculate the yaw
        if (this.header.local_offset_x == next_belt.header.local_offset_x) {
            if (this.header.local_offset_y < next_belt.header.local_offset_y) {
                this.header.yaw = 0
                this.header.yaw2 = 0
            }
            else {
                this.header.yaw = 180
                this.header.yaw2 = 180
            }
        }
        else if (this.header.local_offset_y == next_belt.header.local_offset_y) {
            if (this.header.local_offset_x < next_belt.header.local_offset_x) {
                this.header.yaw = 90
                this.header.yaw2 = 90
            }
            else {
                this.header.yaw = 270
                this.header.yaw2 = 270
            }
        }
    }
}

export function setBeltsLocalAndConnect(belts:Belt[], count: number, startLocal: [number, number, number], diff: [number, number, number]) {
    for (let index = 0; index < count; index++) {
        let belt = belts[index];
        belt.setLocal(startLocal[0] + diff[0] * index, startLocal[1] + diff[1] * index, startLocal[2] + diff[2] * index)
        if (index < count - 1) {
            belt.connect(belts[index + 1])
        }
    }
}

// undefined diff means you must set belt local later
export function appendBelts(bp: BluePrint, belts: Array<Belt>, count: number, diff?: [number, number, number]) {
    let belt = belts[belts.length - 1]
    let area_index = belt.header.area_index
    let x = belt.header.local_offset_x, y = belt.header.local_offset_y, z = belt.header.local_offset_z
    if (diff === undefined) diff = [0, 0, 0]
    for (let i = 0; i < count; i++) {
        let next_belt = new Belt(area_index, x + (i+1)*diff[0], y + (i+1)*diff[1], z + (i+1)*diff[2])
        bp.addBuilding(next_belt)
        if (diff !== [0, 0, 0]) belt.connect(next_belt)
        belts.push(next_belt)
        belt = next_belt
    }
}

export function prependBelts(bp: BluePrint, belts: Array<Belt>, count: number) {
    let area_index = belts[0].header.area_index
    let tmp_belts = new Array<Belt>()
    for (let i = 0; i < count; i++) {
        let pre_belt = new Belt(area_index, 0, 0, 0)
        bp.addBuilding(pre_belt)
        tmp_belts.push(pre_belt)
    }
    belts = tmp_belts.concat(belts)
}

export class BeltList extends BuildingList{
    lst:Array<Belt>

    constructor(
        area_index:number, count:number,
        local:[number,number,number],
        diff = [1, 0, 0],
        level = 3
    ) {
        super()
        this.lst = new Array<Belt>()
        for (let index = 0; index < count; index++) {
            this.lst.push(new Belt(area_index, local[0]+diff[0]*index, local[1]+diff[1]*index, local[2]+diff[2]*index, level))
        }
    }

    getList() : Array<Belt> {
        return this.lst
    }
    
    add(
        area_index:number,
        local_offset_x:number,
        local_offset_y:number,
        local_offset_z:number,
        level=3
    ) 
    {
        this.lst.push(new Belt(
            area_index, 
            local_offset_x, local_offset_y, local_offset_z,
            level
        ))
    }

    // Must after set belt index
    // connect() {
    //     this.lst.forEach((belt, index, belt_list)=>{
    //         if (index > 0 ) {
    //             belt.header.input_object_index = belt_list[index - 1].header.index
    //         }
    //         if (index + 1 < belt_list.length) {
    //             belt.header.output_object_index = belt_list[index + 1].header.index
    //         }
    
    //         // Todo: how to set the input/output from/to slot?
    //         belt.header.output_to_slot = 1
    //         belt.header.input_to_slot = 1
    //     })
    //     return this
    // }

    // reverse() {
    //     // Todo
    // }
}
