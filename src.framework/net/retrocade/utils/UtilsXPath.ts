export const UtilsXPath = {
	extractXpathResult(result: XPathResult): Node[] {
		let node;
		const results = [];

		while ((node = result.iterateNext())) {
			results.push(node);
		}

		return results;
	},
	evaluate(xpath: string, document: Document, contextNode?: Node): Node[] {
		const xpathResult = document.evaluate(xpath, contextNode || document);

		return UtilsXPath.extractXpathResult(xpathResult);
	},
	getAllNodes(xpath: string, document: Document, contextNode?: Node): Node[] {
		const results = UtilsXPath.evaluate(xpath, document, contextNode);

		return results.filter(x => x.textContent);
	},
	getAllElements(xpath: string, document: Document, contextNode?: Node): Element[] {
		const results = UtilsXPath.evaluate(xpath, document, contextNode);

		return results.filter(x => x instanceof Element)! as Element[];
	},
	getAnyElement(xpath: string, document: Document, contextNode?: Node): Element {
		return UtilsXPath.getAllElements(xpath, document, contextNode)[0] || document.createElement('nothingfound');
	},
	getAnyElementStrict(xpath: string, document: Document, contextNode?: Node): Element | undefined {
		return UtilsXPath.getAllElements(xpath, document, contextNode)[0];
	},
	getAllTexts(xpath: string, document: Document, contextNode?: Node): string[] {
		const results = UtilsXPath.evaluate(xpath, document, contextNode);

		return results.filter(x => x.textContent).map(x => x.textContent!);
	},
	getAnyText(xpath: string, document: Document, contextNode?: Node): string {
		const texts = UtilsXPath.getAllTexts(xpath, document, contextNode);

		return texts[0] || '';
	},
};