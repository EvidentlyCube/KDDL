import {VOCharacterCommand} from "./VOCharacterCommand";
import {RecamelObject} from "../../../src.framework/net/retrocade/camel/objects/RecamelObject";
import {TMonster} from "../objects/actives/TMonster";

export class VOSpeechCommand extends RecamelObject {
	public command: VOCharacterCommand;
	public text: string;
	public playSound: boolean = true;
	public flush: boolean;
	public turnNo: number;
	public scriptID: number;
	public commandIndex: number;

	public speakingEntity: TMonster;
	public executingNPC: TMonster;

	public constructor(
		monster: TMonster,
		command: VOCharacterCommand,
		turnNo: number,
		scriptID: number,
		commandIndex: number,
	) {
		super();

		this.speakingEntity = this.executingNPC = monster;
		this.command = command;
		this.turnNo = turnNo;
		this.scriptID = scriptID;
		this.commandIndex = commandIndex;
		this.flush = false;
		this.text = "";
	}
}
