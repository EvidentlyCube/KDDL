import * as PIXI from 'pixi.js';
import {S} from "../../S";
import {Nutka} from "../../../src.evidently_audio/Nutka";
import RawInput from "../../../src.tn/RawInput";

const app = new PIXI.Application({
	width: S.SIZE_GAME_WIDTH,
	height: S.SIZE_GAME_HEIGHT,
	backgroundColor: 0,
	antialias: false,
	sharedTicker: true,
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

const domGame = document.getElementById('game');
if (!domGame) {
	throw new Error("Failed to find DOM element #game");
}

domGame.appendChild(app.view);
app.view.style.opacity = '0';

const resize = () => {
	const scaleX = window.innerWidth / S.SIZE_GAME_WIDTH;
	const scaleY = window.innerHeight / S.SIZE_GAME_HEIGHT;
	const scale = Math.min(scaleX, scaleY);
	const newWidth = S.SIZE_GAME_WIDTH * scale;
	const newHeight = S.SIZE_GAME_HEIGHT * scale;
	const x = (window.innerWidth - newWidth) / 2 | 0;
	const y = (window.innerHeight - newHeight) / 2 | 0;

	app.view.width = newWidth;
	app.view.height = newHeight;
	app.stage.scale.set(scale, scale);
	(app.screen as any).width = newWidth;
	(app.screen as any).height = newHeight;

	app.view.style.left = `${x}px`;
	app.view.style.top = `${y}px`;

	RawInput.gameOffsetX = x;
	RawInput.gameOffsetY = y;
	RawInput.gameScaleX = scale;
	RawInput.gameScaleY = scale;
};

window.addEventListener('resize', resize);
window.addEventListener('load', resize);

const nutka = new Nutka();
const nutkaLayerSfx = nutka.newLayer('sfx');
const nutkaLayerMusic = nutka.newLayer('music');
const nutkaLayerSpeech = nutka.newLayer('speech');

export const DROD = {
	app,
	resize,
	nutka, nutkaLayerSfx, nutkaLayerMusic, nutkaLayerSpeech
};