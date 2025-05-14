import { assertDefined } from "src/ASSERT";
import { S } from "src/S";

interface DebugConsoleAction {
    name: string;
    description: string;
    invoke: (args: string[]) => void
}

const registeredActions = new Map<string, DebugConsoleAction>();

export class DebugConsole {
    private static consoleModal: HTMLDivElement;
    private static consoleBody: HTMLDivElement;
    private static consoleInput: HTMLInputElement;
    private static completionMatches: string[] = [];

    public static get isVisible() {
        return this.consoleModal ? !this.consoleModal.classList.contains('hidden') : false;
    }

    public static init() {
        DebugConsole.consoleModal = document.querySelector('#debug_modal')!;
        DebugConsole.consoleBody = document.querySelector('#debug_modal_text')!;
        DebugConsole.consoleInput = document.querySelector('#debug_modal_input')!;

        assertDefined(DebugConsole.consoleModal, "Debug Console's modal is not present");
        assertDefined(DebugConsole.consoleBody, "Debug Console's body is not present");
        assertDefined(DebugConsole.consoleInput, "Debug Console's input is not present");

        DebugConsole.consoleModal.classList.add('hidden');
        DebugConsole.consoleInput.addEventListener('keydown', e => this.handleKeyDown(e))
        DebugConsole.consoleInput.value = "";

        this.appendLine("King Dugan's Dungeon");
        this.appendLine(S.version);
        this.appendLine("Type **help** for list of commands.");
    }

    public static show() {
        if (!DebugConsole.consoleModal) {
            return;
        }

        DebugConsole.consoleModal.classList.remove('hidden');
        DebugConsole.consoleInput.focus();
    }

    public static hide() {
        if (!DebugConsole.consoleModal) {
            return;
        }

        DebugConsole.consoleModal.classList.add('hidden');
    }

    public static registerAction(name: string, description: string, invoke: (args: string[]) => void) {
        if (registeredActions.has(name)) {
            throw new Error(`Attempted to register debug console action ${name} but it already exists`);
        }

        registeredActions.set(name, { name, description, invoke });
    }

    private static handleKeyDown(e: KeyboardEvent) {
        const [command, ...args] = DebugConsole.consoleInput.value.split(" ").filter(x => x);

        if (e.key === 'Tab') {
            e.preventDefault();

            const lastMatchIndex = DebugConsole.completionMatches.indexOf(command);
            if (lastMatchIndex !== -1) {
                DebugConsole.consoleInput.value = DebugConsole.completionMatches[(lastMatchIndex + 1) % DebugConsole.completionMatches.length];
                return;
            }

            if (args.length > 0) {
                return;
            }

            const matches = Array.from(registeredActions.keys()).filter(key => key.startsWith(command));
            if (matches.length === 0) {
                DebugConsole.completionMatches.length = 0;
                return;
            }

            DebugConsole.completionMatches.push(...matches)
            DebugConsole.consoleInput.value = matches[0];

            return;
        }

        DebugConsole.completionMatches.length = 0;

        if (e.key === 'Enter') {
            DebugConsole.consoleInput.value = "";

            const action = registeredActions.get(command);

            if (action) {
                this.appendLine(`[DEBUG CONSOLE]> **${command}** ${args.join(" ")}`);
                try {
                    action.invoke(args);
                } catch (e: unknown) {
                    this.appendLine(`**Error:** ${String(e)}`);
                }

            } else {
                this.appendLine(
                    `[DEBUG CONSOLE]> **${command}** ${args.join(" ")}`,
                    `**Unknown action**`
                );
            }

        } else if (e.key === '`') {
            e.preventDefault();
            e.stopImmediatePropagation();
            DebugConsole.hide();
        }
    }

    public static appendLine(...lines: string[]) {
        DebugConsole.consoleBody.innerHTML += "\n" + lines
            .map(line => line.replace(/</g, '&lt;'))
            .map(line => line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
            .join("\n");

        DebugConsole.consoleBody.scrollTop = DebugConsole.consoleBody.scrollHeight;
    }
}

DebugConsole.registerAction('help', "Print this help", () => {
    for (const action of registeredActions.values()) {
        DebugConsole.appendLine(` • **${action.name}** ⟶ ${action.description}`);
    }
})