import { TMonster } from "../objects/actives/TMonster";

export enum MonsterMessageType {
	Ok = 0,
	YesNo = 1,
	Menu = 2,
	NeatherSpareQuestion = 3,
	NeatherImpossibleKill = 4,
}

export class VOMonsterMessage {
	public readonly sender: TMonster;
	public readonly message: string;
	public readonly type: MonsterMessageType;

	public constructor(sender: TMonster, message: string, type: MonsterMessageType) {
		this.sender = sender;
		this.message = message;
		this.type = type;
	}
}
