import { BluePrint } from "./BP/blueprint";
import { BeltList } from "./BP/builiding/belt";
import * as fs from 'fs'
import { Building } from "./BP/builiding/builiding";
import { Smelter, SmelterList } from "./BP/builiding/smelter";
import { NearlySmelterGroup } from "./building_group/smelter_groups";

// Todo: use system time
let timestamp = 637795946688143437
let cursor_offset_x = 1
let cursor_offset_y = 2
let cursor_target_area = 0
let dragbox_size_x = 3
let dragbox_size_y = 5
let bp = new BluePrint(timestamp,cursor_offset_x,cursor_offset_y,cursor_target_area,dragbox_size_x, dragbox_size_y)

let parent_index = -1
let tropic_anchor = 0
let area_segments = 200
let anchor_local_offset_x = 0
let anchor_local_offset_y = 0
let width = 20
let height = 20
let area_index = bp.addArea(parent_index, tropic_anchor, area_segments, 
    anchor_local_offset_x, anchor_local_offset_y, width, height)

let local:[number, number] = [0,0]
let smelter_group = bp.addBuildings(new NearlySmelterGroup(bp, area_index, local)) as NearlySmelterGroup

fs.writeFileSync(process.env.npm_config_output, bp.export())