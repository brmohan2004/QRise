"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, BarChart2, Edit2, Copy, Download, Trash } from "lucide-react";

interface ActionMenuProps {
  onCopy: () => void;
  onDelete: () => void;
  qrId: string;
  type: string;
  isBulk?: boolean;
}

export function ActionMenu({ onCopy, onDelete, qrId, type, isBulk }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1 rounded-md hover:bg-gray-100 focus:outline-none transition-colors">
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {!isBulk && (
          <DropdownMenuItem onClick={() => { window.location.href = `/qr-codes/${qrId}/analytics`; }}>
            <BarChart2 className="w-4 h-4 mr-2" />Analytics
          </DropdownMenuItem>
        )}
        {!isBulk && (
          <DropdownMenuItem onClick={() => { window.location.href = `/create/${type}?edit=${qrId}`; }}>
            <Edit2 className="w-4 h-4 mr-2" />Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => { onCopy(); }}>
          <Copy className="w-4 h-4 mr-2" />Copy link
        </DropdownMenuItem>
        {!isBulk && (
          <DropdownMenuItem onClick={() => { window.location.href = `/api/qr/${qrId}/export`; }}>
            <Download className="w-4 h-4 mr-2" />Download
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { onDelete(); }} className="text-red-600">
          <Trash className="w-4 h-4 mr-2" />Delete {isBulk ? "Batch" : ""}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
