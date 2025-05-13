import { BinaryReader, BinaryWriter, Encoding } from 'csharp-binary-stream';
import { ASSERT } from "../../ASSERT";
import { C } from "../../C";
import { UtilsByteArray } from "../../../src.framework/net/retrocade/utils/UtilsByteArray";

class UnpackedVar {
    public name: string;
    public length: number;
    public value: number | string | Uint8Array | boolean;
    public type: number;

    public constructor() {
        this.name = '';
        this.length = 0;
        this.value = 0;
        this.type = 0;
    }

    public clear() {
        this.name = '';
        this.length = 0;
        this.value = 0;
        this.type = 0;
    }

    public clone(): UnpackedVar {
        const cloned = new UnpackedVar();
        cloned.name = this.name;
        cloned.length = this.length;
        cloned.type = this.type;

        if (this.value instanceof Uint8Array)
            cloned.value = UtilsByteArray.clone(this.value);
        else
            cloned.value = this.value;

        return cloned;
    }
}

export class PackedVars {
    private _vars: Map<string, UnpackedVar>;

    public constructor(buffer: Uint8Array | null = null) {
        this._vars = new Map();

        if (buffer)
            this.unpack(buffer);
    }

    public unpack(buffer: Uint8Array) {
        if (buffer.length < 4)
            return;

        //Packed unpackedVar buffer format is:
        //{VarNameSize1 UINT}{VarName1 SZ}{VarType1 number}{VarValueSize1 DWORD}{VarValue1}
        //{VarNameSize2 UINT}...
        //{EndCode UINT}

        const reader = new BinaryReader(buffer);
        this.clear();

        let varNameLength = reader.readUnsignedInt();

        while (varNameLength != 0) {
            ASSERT(varNameLength < 256); //256 = reasonable limit to var name size.
            if (varNameLength >= 256) {
                this.clear();
                return;
            }

            //Get var name.
            const varName: string = reader.readChars(varNameLength, Encoding.Utf8);

            //Create new packed var.
            const newVar = new UnpackedVar();
            newVar.name = varName.substr(0, varNameLength - 1);

            // Get var type
            newVar.type = reader.readUnsignedInt();

            // Get var size
            newVar.length = reader.readInt();

            // Get actual var
            switch (newVar.type) {
                case (C.UVT_bool):
                    newVar.value = reader.readBoolean();
                    break;

                case (C.UVT_byte):
                    newVar.value = reader.readByte();
                    break;

                case (C.UVT_byte_buffer):
                    newVar.value = new Uint8Array(reader.readBytes(newVar.length));
                    break;

                case (C.UVT_char_string):
                    newVar.value = reader.readChars(newVar.length, Encoding.Utf8);
                    break;

                case (C.UVT_int):
                    newVar.value = reader.readInt();
                    ASSERT(Number.isInteger(newVar.value), "PackedVars.unpack() variable is not integer");

                    break;

                case (C.UVT_uint):
                    newVar.value = reader.readUnsignedInt();
                    break;

                case (C.UVT_wchar_string):
                    newVar.value = UtilsByteArray.readWChar(buffer, reader.position, newVar.length);
                    reader.position += newVar.length;
                    break;
            }

            this._vars.set(newVar.name, newVar);

            if (reader.isEndOfStream) {
                break;
            }
            varNameLength = reader.readUnsignedInt();
        }
    }

    public pack(): Uint8Array {
        const writer = new BinaryWriter();

        for (const unpackedVar of this._vars.values()) {
            writer.writeUnsignedInt(unpackedVar.name.length + 1);
            writer.writeChars(unpackedVar.name, Encoding.Utf8);
            writer.writeByte(0);

            writer.writeUnsignedInt(unpackedVar.type);
            switch (unpackedVar.type) {
                case (C.UVT_bool):
                    writer.writeUnsignedInt(1);
                    writer.writeBoolean(unpackedVar.value as boolean);
                    break;
                case (C.UVT_byte):
                    writer.writeUnsignedInt(1);
                    writer.writeByte(unpackedVar.value as number);
                    break;
                case (C.UVT_byte_buffer):
                    const _ba: Uint8Array = unpackedVar.value as Uint8Array;
                    writer.writeUnsignedInt(_ba.length);
                    writer.writeBytes(Array.from(_ba));
                    break;
                case (C.UVT_char_string):
                    const _s: string = unpackedVar.value as string;
                    writer.writeUnsignedInt(_s.length);
                    writer.writeChars(_s, Encoding.Utf8);
                    break;
                case (C.UVT_int):
                    writer.writeUnsignedInt(4);
                    writer.writeInt(unpackedVar.value as number);
                    break;
                case (C.UVT_uint):
                    writer.writeUnsignedInt(4);
                    writer.writeUnsignedInt(unpackedVar.value as number);
                    break;
                case (C.UVT_wchar_string):
                    const _sw: string = unpackedVar.value as string;
                    writer.writeUnsignedInt(_sw.length * 2);
                    UtilsByteArray.writeWChar(writer, _sw);
                    break;
            }
        }

        // Regular drod writes a null byte at the end but we don't need it, since we never import this into regular DROD
        // writer.writeByte(0);

        return writer.toUint8Array();
    }

    public clone() {
        const cloned = new PackedVars();

        for (const unpackedVar of this._vars.values()) {
            cloned._vars.set(unpackedVar.name, this._vars.get(unpackedVar.name)!.clone());
        }

        return cloned;
    }

    public clear() {
        for (const unpackedVar of this._vars.values()) {
            unpackedVar.clear();
        }

        this._vars.clear();
    }




    // ::::::::::::::::::::::::::::::::::::::::::::::
    // :: Setters
    // ::::::::::::::::::::::::::::::::::::::::::::::

    public setInt(name: string, to: number) {
        let unpackedVar = this._vars.get(name) || null;

        if (!unpackedVar || unpackedVar.type != C.UVT_int) {
            unpackedVar = new UnpackedVar();
            unpackedVar.name = name;
            unpackedVar.length = 4;
            unpackedVar.type = C.UVT_int;

            this._vars.set(name, unpackedVar);
        }

        ASSERT(Number.isInteger(to), "PackedVars.setInt() is not integer");
        ASSERT(to >= C.MIN_INT, "PackedVars.setUint() is too small");
        ASSERT(to <= C.MAX_INT, "PackedVars.setUint() is too large");

        unpackedVar.value = to;
    }

    public setUint(name: string, to: number) {
        let unpackedVar = this._vars.get(name) || null;
        if (!unpackedVar || unpackedVar.type != C.UVT_uint) {
            unpackedVar = new UnpackedVar();
            unpackedVar.name = name;
            unpackedVar.length = 4;
            unpackedVar.type = C.UVT_uint;

            this._vars.set(name, unpackedVar);
        }

        ASSERT(Number.isInteger(to), "PackedVars.setUint() is not integer");
        ASSERT(to <= 4294967295, "PackedVars.setUint() is too large");
        ASSERT(to >= 0, "PackedVars.setUint() is negative");

        unpackedVar.value = to;
    }

    public setString(name: string, to: string) {
        let unpackedVar = this._vars.get(name) || null;
        if (!unpackedVar || unpackedVar.type != C.UVT_char_string) {
            unpackedVar = new UnpackedVar();
            unpackedVar.name = name;
            unpackedVar.type = C.UVT_char_string;

            this._vars.set(name, unpackedVar);
        }

        unpackedVar.value = to;
        unpackedVar.length = to.length;
    }




    // ::::::::::::::::::::::::::::::::::::::::::::::
    // :: Getters
    // ::::::::::::::::::::::::::::::::::::::::::::::

    public getBool(name: string, def: boolean = false): boolean {
        const unpackedVar = this._vars.get(name);
        if (unpackedVar) {
            ASSERT(unpackedVar.type == C.UVT_bool);
            return unpackedVar.value as boolean;
        }

        return def;
    }

    public getByte(name: string, def: number = 0): number {
        ASSERT(def < 256);

        const unpackedVar = this._vars.get(name);
        if (unpackedVar) {
            ASSERT(unpackedVar.type == C.UVT_byte);
            return unpackedVar.value as number;
        }

        return def;
    }

    public getByteArray(name: string, def: Uint8Array | null = null): Uint8Array | null {
        const unpackedVar = this._vars.get(name);
        if (unpackedVar) {
            ASSERT(unpackedVar.type == C.UVT_byte_buffer);
            return unpackedVar.value as Uint8Array;
        }

        return def;
    }

    public getString(name: string, def: string = ""): string {
        const unpackedVar = this._vars.get(name);
        if (unpackedVar) {
            ASSERT(
                unpackedVar.type == C.UVT_char_string ||
                unpackedVar.type == C.UVT_wchar_string
            );
            return unpackedVar.value as string;
        }

        return def;
    }

    public getInt(name: string, def: number = 0): number {
        const unpackedVar = this._vars.get(name);
        if (unpackedVar) {
            ASSERT(unpackedVar.type == C.UVT_int);
            return unpackedVar.value as number;
        }

        return def;
    }

    public getUint(name: string, def: number = 0): number {
        const unpackedVar = this._vars.get(name);
        if (unpackedVar) {
            ASSERT(unpackedVar.type == C.UVT_uint);
            return unpackedVar.value as number;
        }

        return def;
    }

    public typeOf(name: string): number {
        let unpackedVar = this._vars.get(name);

        return (unpackedVar ? unpackedVar.type : C.UVT_unknown);
    }
}

