import { UtilsBase64 } from "src.framework/net/retrocade/utils/UtilsBase64";

export function intAttr(xml: Element, attr: string, def: number = 0) {
	const val = xml.getAttribute(attr);

	return val === null ? def : parseInt(val);
}

export function boolAttr(xml: Element, attr: string, def: boolean) {
	const val = xml.getAttribute(attr);

	if (val === '1') {
		return true;
	} else if (val === '0') {
		return false;
	} else {
		return def;
	}
}

export function attr(xml: Element, attr: string, def: string = '') {
	const val = xml.getAttribute(attr);

	return val === null ? def : val;
}

export function textAttr(xml: Element, attr: string, def: string = '') {
	const val = xml.getAttribute(attr);

	return val === null
		? def
		: UtilsBase64.decodeWChar(val);
}