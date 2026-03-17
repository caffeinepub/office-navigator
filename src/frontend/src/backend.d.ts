import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Scenario {
    suggestions: Array<string>;
    text: string;
    timestamp: Time;
    category?: Category;
}
export enum Category {
    communication = "communication",
    workload = "workload",
    conflict = "conflict",
    feedback = "feedback",
    general = "general",
    escalation = "escalation"
}
export interface backendInterface {
    getRecentSubmissions(): Promise<Array<Scenario>>;
    submitScenario(text: string, category: Category | null): Promise<Array<string>>;
}
