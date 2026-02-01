export type MergeMode = 'union' | 'intersection' | 'xor'

export const MERGE_MODE_DETAILS = {
    intersection: {
        label: "MATCH",
        description: "Movies everyone wants to watch"
    },
    union: {
        label: "BUFFET",
        description: "Everything from everyone"
    },
    xor: {
        label: "GEMS",
        description: "Hidden gems only one person has"
    }
} as const;
