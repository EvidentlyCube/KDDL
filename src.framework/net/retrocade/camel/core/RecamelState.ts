import {RecamelCore} from "./RecamelCore";

export class RecamelState {
	/**
	 * Called when state is set
	 */
	public create(): void {
	}

	/**
	 * Called when state is unset
	 */
	public destroy(): void {
	}

	/**
	 * State update
	 */
	public update(): void {
	}

	/**
	 * Sets this state, useful when you are working with State Instance variable
	 */
	public setState(): void {
		RecamelCore.setState(this);
	}
}
