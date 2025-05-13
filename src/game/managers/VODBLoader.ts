type VODBLoaderCallback = (id: number, packedData: any) => void;

export class VODBLoader {
	public id: any;
	public data: any;
	public callback: VODBLoaderCallback;

	public constructor(id: number, data: any, callback: VODBLoaderCallback) {
		this.id = id;
		this.data = data;
		this.callback = callback;
	}

	public run() {
		this.callback(this.id, this.data);
	}
}
