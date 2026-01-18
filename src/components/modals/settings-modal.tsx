"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { ModeToggle } from "@/components/mode-toggle"
import { useSettings } from "@/hooks/use-settings"
import { BackupSettings } from "@/components/backup-settings"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export const SettingsModal = () => {
  const settings = useSettings()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"account" | "appearance" | "data">("account")

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="flex flex-col gap-2 w-48">
            <button
              onClick={() => setActiveTab("account")}
              className={`px-3 py-2 text-sm text-left rounded-md transition-colors ${activeTab === "account"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-secondary/50"
                }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`px-3 py-2 text-sm text-left rounded-md transition-colors ${activeTab === "appearance"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-secondary/50"
                }`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`px-3 py-2 text-sm text-left rounded-md transition-colors ${activeTab === "data"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-secondary/50"
                }`}
            >
              Data
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your account settings
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <div className="text-sm text-muted-foreground">
                      {session?.user?.name || "Not set"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="text-sm text-muted-foreground">
                      {session?.user?.email || "Not set"}
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Appearance</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize how the app looks
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <div className="text-sm text-muted-foreground">
                        Select your preferred theme
                      </div>
                    </div>
                    <ModeToggle />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Data Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Export your workspace or import data
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <BackupSettings />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
