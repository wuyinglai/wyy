import type { CharacterState } from '../core/types';

export const initialCharacters: CharacterState[] = [
  {
    id: 'road_guard',
    name: '护路人',
    maxHp: 42,
    hp: 42,
    armor: 2,
    shield: 0,
    barrier: 0,
    role: '前排、防御、护车、拦截',
    skillNames: ['回刃', '横身拦截', '稳住阵线', '盾反', '重击', '车队防护'],
  },
  {
    id: 'wasteland_shooter',
    name: '荒野射手',
    maxHp: 32,
    hp: 32,
    armor: 0,
    shield: 0,
    barrier: 0,
    role: '输出、标记、流血、迟滞、追击',
    skillNames: ['标记', '放血箭', '断筋箭', '猎灰重箭', '会合射击', '补射'],
  },
  {
    id: 'mechanic',
    name: '修补师',
    maxHp: 34,
    hp: 34,
    armor: 0,
    shield: 0,
    barrier: 0,
    role: '治疗、修车、净化、加固、过载',
    skillNames: ['简易治疗', '防护加固', '车体修理', '拆解破甲', '灰烬净化', '过载'],
  },
];
