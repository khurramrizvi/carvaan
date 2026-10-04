import React from "react";
import { Users, Building2 } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: "committee" | "user";
  onChange: (role: "committee" | "user") => void;
  disabled?: boolean;
}

export function RoleSelector({ selectedRole, onChange, disabled }: RoleSelectorProps) {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-medium text-[#4d4d4d] text-left">
        Select Account Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* Committee Option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("committee")}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none
            ${
              selectedRole === "committee"
                ? "border-[#171717] bg-[#fafafa] text-[#171717] shadow-xs"
                : "border-[#ebebeb] bg-white text-[#666666] hover:bg-[#fafafa] hover:border-[#d4d4d4]"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="flex items-center space-x-2">
            <Building2 className={`w-4 h-4 ${selectedRole === "committee" ? "text-[#0070f3]" : "text-[#888888]"}`} />
            <span className="font-semibold text-sm">Committee</span>
          </div>
          <span className="text-[11px] text-[#888888] mt-0.5">Organizers & Admins</span>
        </button>

        {/* Normal User Option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("user")}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none
            ${
              selectedRole === "user"
                ? "border-[#171717] bg-[#fafafa] text-[#171717] shadow-xs"
                : "border-[#ebebeb] bg-white text-[#666666] hover:bg-[#fafafa] hover:border-[#d4d4d4]"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="flex items-center space-x-2">
            <Users className={`w-4 h-4 ${selectedRole === "user" ? "text-[#0070f3]" : "text-[#888888]"}`} />
            <span className="font-semibold text-sm">Citizen</span>
          </div>
          <span className="text-[11px] text-[#888888] mt-0.5">Attendees & Volunteers</span>
        </button>
      </div>
    </div>
  );
}
