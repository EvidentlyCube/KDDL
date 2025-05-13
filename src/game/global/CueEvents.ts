import {C} from "../../C";

let _isCIDSet: boolean[] = [];
let _CIDPrivateData: any[][] = [];
let _nextPrivateDataIndex: number;
let _nextCID: number;
let _eventCount: number = 0

for (let i = 0; i < C.CID_COUNT; i++) {
	_isCIDSet[i] = false;
	_CIDPrivateData[i] = [];
}

export class CueEvents {
	/**
	 * Clears all events
	 */
	public static clear() {
		for (let i: number = 0; i < C.CID_COUNT; i++) {
			_isCIDSet[i] = false;
			_CIDPrivateData[i].length = 0;
		}

		_nextPrivateDataIndex = 0;
		_nextCID = Number.MAX_VALUE;
	}

	/**
	 * Clears an event state
	 */
	public static clearEvent(eCID: number) {
		_CIDPrivateData[eCID].length = 0;
		if (_nextCID == eCID) {
			_nextPrivateDataIndex = 0;
			_nextCID = Number.MAX_VALUE;
		}

		if (_isCIDSet[eCID]) {
			_isCIDSet[eCID] = false;
			--_eventCount;
		}
	}

	/**
	 * number of times a specified event has occurred
	 */
	public static getOccurrenceCount(eCID: number): number {
		return _CIDPrivateData[eCID].length;
	}

	public static add(eCID: number, data: any = null) {
		if (!_isCIDSet[eCID]) {
			_isCIDSet[eCID] = true;
			_eventCount++;
		}

		if (data !== null) {
			_CIDPrivateData[eCID].push(data);
		}
	}

	public static getFirstPrivateData(eCID: number): any {
		if (_CIDPrivateData[eCID].length > 0) {
			_nextCID = eCID;
			_nextPrivateDataIndex = 1;
			return _CIDPrivateData[eCID][0];
		}

		_nextPrivateDataIndex = 0;
		_nextCID = Number.MAX_VALUE;
		return null;
	}

	public static anyData(eCID: number, callback: (data: any) => boolean): any {
		for (let i:any = CueEvents.getFirstPrivateData(eCID); i; i = CueEvents.getNextPrivateData()) {
			if (callback(i)) {
				return true;
			}
		}

		return false;
	}

	public static getNextPrivateData(): any {
		if (_nextCID >= _CIDPrivateData.length || _nextPrivateDataIndex >= _CIDPrivateData[_nextCID].length) {
			return null;
		}

		return _CIDPrivateData[_nextCID][_nextPrivateDataIndex++];
	}

	public static hasOccurred(eventCID: number): boolean {
		return _isCIDSet[eventCID];
	}

	public static hasAnyOccurred(arrayOfCID: number[]): boolean {
		for (const CID of arrayOfCID) {
			if (_isCIDSet[CID]) {
				return true;
			}
		}

		return false;
	}

	public static countOccurred(eCID: number, callback?: (data: any) => boolean): number {
		if (callback) {
			return _CIDPrivateData[eCID].filter(callback).length;
		}

		return _CIDPrivateData[eCID].length;
	}

	public static hasOccurredWith(eCID: number, data: any): boolean {
		for (const i of _CIDPrivateData[eCID]) {
			if (i == data) {
				return true;
			}
		}
		return false;
	}

	public static getData(eCID: number): any[] {
		return _CIDPrivateData[eCID];
	}

	public static remove(eCID: number, data: any): boolean {
		let found = false;
		let length = _CIDPrivateData[eCID].length;
		for (let i: number = 0; i < length; i++) {
			if (found) {
				_CIDPrivateData[eCID][i - 1] = _CIDPrivateData[eCID][i];

			} else if (_CIDPrivateData[eCID][i] == data) {
				found = true;
			}
		}

		if (found) {
			_CIDPrivateData[eCID].length--;
		}

		return found;
	}
}