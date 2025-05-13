import {RecamelObject} from "../objects/RecamelObject";
import {UtilsRandom} from "../../utils/UtilsRandom";

export class RecamelGroup<T extends RecamelObject> extends RecamelObject {
	/****************************************************************************************************************/
	/**                                                                                                  VARIABLES  */
	/****************************************************************************************************************/

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Items Array
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * An array of group's objects
	 */
	protected _items: (T | null)[];

	/**
	 * Returns the amount of not nulled elements in the group
	 */
	public get length(): number {
		return this._length - this._nulled;
	}

	/**
	 * Length of the items arrays
	 */
	protected _length: number = 0;

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Counts
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * HELPER: Counts how many elements were nulled
	 */
	protected _nulled: number = 0;

	/**
	 * How many objects are nulled right now
	 */
	public get nulled(): number {
		return this._nulled;
	}

	/**
	 * Amount of Null variables in list which should turn the GC on automatically
	 */
	public gcThreshold: number = 10;

	/**
	 * If true automatic GC will use advanced garbage collection
	 */
	public gcAdvanced: boolean = true;


	/**
	 * Constructor
	 */
	public constructor() {
		super();

		this._items = [];
		this.active = true;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Adding
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Adds an object at the end of the group
	 * @param object RecamelObject to be added to the group
	 */
	public add(object: T): void {
		this._items[this._length++] = object;
	}

	/**
	 * Adds an object to the group at specified index
	 * @param object RecamelObject to be added to the group
	 * @param index Index where to add the item to the group
	 */
	public addAt(object: T, index: number): void {
		if (index > this._length) {
			this._items.length = index - 1;
		}

		this._items.splice(index, 0, object);
		this._length = this._items.length;
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Checking
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Checks if specified object is added to given group
	 * @param object Object to check
	 * @return True if this object already resides in the group
	 */
	public contains(object: T): boolean {
		return this._items.indexOf(object) !== -1;
	}

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Garbage Collecting
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Removes all Nulled objects from group and fills gap with items from the end of the list.
	 * Order is not retained
	 */
	public garbageCollect(): void {
		let l: number = this._length;
		let i: number = 0;

		for (; i < l; ++i) {
			while (this._items[i] == null && i < l) {
				this._items[i] = this._items[--l];
			}
		}

		this._items.length = l;
		this._nulled = 0;
		this._length = l;
	}

	/**
	 * Splices all Nulled objects from group, Order is retained.
	 */
	public garbageCollectAdvanced(): void {
		let l: number = this._length;
		let i: number = 0;
		let gap: number = 0;

		for (; i < l; i++) {
			if (this._items[i] == null) {
				gap++;
			} else if (gap) {
				this._items[i - gap] = this._items[i];
			}
		}

		this._length -= gap;
		this._items.length -= gap;
		this._nulled = 0;


	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Retrieving
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Retrieves an RecamelObject from a given index position
	 * @param    index An index position of the object to be retrieved
	 * @return RecamelObject located at given index
	 */
	public getAt(index: number): T | null {
		if (index < this._length) {
			return this._items[index];
		}

		return null;
	}

	/**
	 * Retrieves a randomly selected RecamelObject
	 * @return A randomly selected RecamelObject
	 */
	public getRandom(): T | null {
		if (this.length == 0) {
			return null;
		}

		var item: T | null = null;

		while (!item) {
			item = this._items[this._length * UtilsRandom.fraction() | 0];
		}

		return item;
	}

	/**
	 * Returns an array of all objects
	 * @return Array of all objects
	 */
	public getAll(): ReadonlyArray<T | null> {
		return this._items;
	}

	/**
	 * Returns an array of all objects, the original array used by group. Do NOT modify it!
	 * @return Array of all objects
	 */
	public getAllOriginal(): (T | null)[] {
		return this._items;
	}

	/**
	 * Returns the first not null object stored
	 * @return First not null object, or null if there are none
	 */
	public getFirst(): T | null {
		let i: number = 0;
		for (const item of this._items) {
			if (item) {
				return item;
			}
		}
		return null;
	}

	/**
	 * Returns the index of the object added or -1 if not found
	 * @param object Object which index you want to check
	 * @return Index of the object in the group or -1 if the object was not found
	 */
	public getIndexOf(object: T): number {
		return this._items.indexOf(object);
	}

	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Removing
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Removes all elements from the group
	 */
	public clear(): void {
		this._items.length = 0;
		this._length = 0;
		this._nulled = 0;
	}

	/**
	 * Nulls the specified object from the group
	 * @param object Object to be nulled
	 */
	public nullify(object: T): void {
		const index: number = this._items.indexOf(object);
		if (index == -1) {
			return;
		}

		this._nulled++;
		this._items[index] = null;
	}

	/**
	 * Nulls an object from the group at the specified index
	 * @param index Index at which an object has to be nulled
	 */
	public nullifyAt(index: number): void {
		if (index < this._items.length) {
			if (this._items[index] != null) {
				this._nulled++;
				this._items[index] = null;
			}

		}
	}

	/**
	 * Removes the specified object from the group using splice
	 * @param object Object to be removed
	 */
	public remove(object: T): void {
		const index: number = this._items.indexOf(object);
		if (index == -1) {
			return;
		}

		this._length--;
		this._items.splice(index, 1);
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Updating
	// ::::::::::::::::::::::::::::::::::::::::::::::

	/**
	 * Calls update on all active elements
	 */
	public override update(): void {
		for (const item of this._items) {
			if (item && item.active) {
				item.update();
			}
		}

		// Garbage Collect
		if (this._nulled > this.gcThreshold) {
			if (this.gcAdvanced) {
				this.garbageCollectAdvanced();
			} else {
				this.garbageCollect();
			}
		}
	}


	// ::::::::::::::::::::::::::::::::::::::::::::::
	// :: Miscellanous
	// ::::::::::::::::::::::::::::::::::::::::::::::
}
