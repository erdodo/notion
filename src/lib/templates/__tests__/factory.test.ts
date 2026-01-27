
import { describe, it, expect, vi, beforeEach } from "vitest";
import { goalSettingTemplate } from "../definitions/goal-setting.factory";
import { db } from "../../db";
import fs from "fs/promises";
import path from "path";

// Mocks
vi.mock("../../db", () => ({
    db: {
        page: {
            create: vi.fn(),
            update: vi.fn(),
        },
        database: {
            create: vi.fn(),
        },
        databaseView: {
            create: vi.fn(),
        },
        property: {
            create: vi.fn(),
        },
        cell: {
            create: vi.fn(),
        }
    }
}));

vi.mock("fs/promises", () => {
    return {
        default: {
            readFile: vi.fn(),
            access: vi.fn().mockResolvedValue(undefined),
        }
    };
});

describe("Template Factory: Goal Setting", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        // Mock DB returns
        (db.page.create as any).mockResolvedValue({ id: "root-page-id", databaseRow: { id: "row-id" } });
        (db.database.create as any).mockResolvedValue({ id: "db-id" });
        (db.databaseView.create as any).mockResolvedValue({ id: "view-id" });
        (db.property.create as any).mockResolvedValue({ id: "prop-id" });
    });

    it("should process markdown and import CSV links", async () => {
        // Mock File System
        (fs.readFile as any).mockImplementation(async (filePath: string) => {
            if (filePath.endsWith(".md")) {
                return `
# Goals
Here are my [Dreams](Dreams.csv)
![Goals](Goals.png)
                `;
            }
            if (filePath.endsWith(".csv")) {
                return `Name,Target Date\nTravel,2025-01-01`;
            }
            return "";
        });

        const ctx = { userId: "user-1", parentId: "parent-1" };

        const pageId = await goalSettingTemplate.factory!(ctx);

        expect(pageId).toBe("root-page-id");
        expect(db.page.create).toHaveBeenCalledTimes(3);
        // 1. Root Page
        // 2. Database Page (from CSV)
        // 3. Row Page (from CSV row)

        expect(db.cell.create).toHaveBeenCalled(); // Should assume CSV import worked

        // Verify Image URL fix
        expect(db.page.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: "root-page-id" },
            data: expect.objectContaining({
                content: expect.stringContaining("/templates/Goal Setting and Vision Board Template/Goals.png")
            })
        }));
    });
});
