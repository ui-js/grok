/*
 * Enums
 */
export enum Response {
    No = 0,
    Yes = 1,
}
export enum Direction {
    Up = 'UP',
    Down = 'DOWN',
    Left = 'LEFT',
    Right = 'RIGHT',
}
export enum FileAccess {
    // constant members
    None,
    Read = 1 << 1,
    Write = 1 << 2,
    ReadWrite = Read | Write,
    // computed member
    G,
    B,
}
export const nameOfA = Direction.Up; // "UP"

export const enum EnumH1 {
    /**
     * Shortest name:  {@link EnumH1.memberH2}
     * Full name:      {@link (EnumH1:enum).memberH2}
     */
    memberH2,
}

// (MUST NOT have TSDoc, because this is part of an enum that was already
// documented above.)
export const enum EnumH1 {
    /**
     * Shortest name:  {@link EnumH1.memberH3}
     * Full name:      {@link (EnumH1:enum).memberH3}
     */
    memberH3 = 3,
}
