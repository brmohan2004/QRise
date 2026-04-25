export interface ActionMenuItem {
    id: string;
    label: string;
    actionType: string;
    actionValue: string;
    icon: string;
    displayOrder: number;
    color?: string;
}
export interface ActionMenuOptions {
    qrId: string;
    actions: ActionMenuItem[];
    title?: string;
    appUrl: string;
}
export declare function buildActionMenuPage(options: ActionMenuOptions): string;
//# sourceMappingURL=action-menu.d.ts.map