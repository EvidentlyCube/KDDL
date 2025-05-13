import {NutkaLayer} from "./NutkaLayer";

export interface NutkaPlaybackParams {
	volume?: number;
	pan?: number;
	playbackRate?: number;
	detune?: number;
	isLooping?: boolean;
	loopStart?: number;
	loopEnd?: number;
	onFinished?: (sound: NutkaPlayback) => void;

	startOffset?: number;
}

export class NutkaPlayback {
	private readonly _node: AudioBufferSourceNode;
	private readonly _startTime: number;

	private readonly _volumeGain: GainNode;
	private readonly _playbackRate: number;

	private _stopTime?: number;

	public get volume() {
		return this._volumeGain.gain.value;
	}

	public set volume(value: number) {
		this._volumeGain.gain.value = value;
	}

	public set isLooping(value: boolean) {
		this._node.loop = value;
	}

	public get positionSeconds(): number {
		return this.playbackDuration / this._playbackRate;
	}

	public get playbackDuration(): number {
		return this._stopTime === undefined
			? this._node.context.currentTime - this._startTime
			: this._stopTime - this._startTime
	}

	public constructor(node: AudioBufferSourceNode, layer: NutkaLayer, params?: NutkaPlaybackParams) {
		const {
			volume, pan, playbackRate, detune,
			isLooping, loopStart, loopEnd,
			onFinished,
			startOffset,
		} = params || {};
		this._node = node;

		this._playbackRate = playbackRate ?? 1;

		node.playbackRate.value = playbackRate ?? 1;
		node.detune.value = detune ?? 0;

		if (onFinished) {
			node.onended = () => {
				onFinished(this);
			};
		}

		this._volumeGain = node.context.createGain();
		this._volumeGain.gain.value = volume ?? 1;
		node.connect(this._volumeGain);

		let connectNode: AudioNode = this._volumeGain;
		if (pan !== undefined && pan !== 1) {
			const panNode = node.context.createStereoPanner();
			panNode.pan.value = pan;
			connectNode.connect(panNode);
			connectNode = panNode;
		}
		connectNode.connect(layer.node);

		node.loop = isLooping ?? false;
		node.loopStart = loopStart ?? 0;
		node.loopEnd = loopEnd ?? 0;

		node.start(
			undefined,
			startOffset,
			undefined
		);
		this._startTime = node.context.currentTime
			- (startOffset ?? 0);
	}

	public stop() {
		this._stopTime = this._node.context.currentTime;
		this._node.stop(0);
	}
}