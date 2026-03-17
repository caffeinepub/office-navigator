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
export interface UserProfile {
    name: string;
}
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRecentSubmissions(): Promise<Array<Scenario>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitScenario(text: string, category: Category | null): Promise<Array<string>>;
}
